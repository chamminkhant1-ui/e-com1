import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { BaseService } from '../../common/services/BaseService';
import { Account } from '../../database/entities/Account';
import { EntranceRegistration } from '../../database/entities/EntranceRegistration';
import { StudentProfile } from '../../database/entities/StudentProfile';
import { ParentProfile } from '../../database/entities/ParentProfile';
import { Address } from '../../database/entities/Address';
import { State } from '../../database/entities/State';
import { District } from '../../database/entities/District';
import { Township } from '../../database/entities/Township';
import { AppDataSource } from '../../database/data-source';
import {
  AccountLoginInput,
  AccountRegisterInput,
  AccountVerifyEntranceInput,
  AccountVerifyOtpInput,
  AccountForgotPasswordInput,
  AccountVerifyResetOtpInput,
  AccountResetPasswordInput,
  buildExamRollNo,
  type EntranceMatchDto,
} from './auth.schema';
import { generateOtp, getOtpExpiration } from '../../common/utils/otp.utils';
import AppError from '../../common/utils/AppError';
import { EmailService } from '../../common/services/email.service';

// Set a safe and recommended salt round for bcrypt
const SALT_ROUNDS = 10;

// Helper to hash OTP using SHA-256 HMAC to avoid CPU blocking
const hashOtp = (otp: string): string => {
  const salt = process.env.OTP_SALT || 'default_otp_salt_secret';
  return crypto.createHmac('sha256', salt).update(otp).digest('hex');
};

export const AccountRepository = AppDataSource.getRepository(Account);
const EntranceRepository = AppDataSource.getRepository(EntranceRegistration);

export class AuthService extends BaseService<Account> {
  protected accountRepo: Repository<Account>;
  private emailService: EmailService;

  constructor(emailService?: EmailService) {
    super(AccountRepository);
    this.accountRepo = AccountRepository;
    this.emailService = emailService || new EmailService();
  }

  /**
   * Looks up an entrance record for the first-year registration flow.
   * Read-only: does NOT mark the entrance as claimed. Returns a safe subset of
   * the record so the user can confirm before creating an account.
   */
  async verifyEntrance(
    data: AccountVerifyEntranceInput,
  ): Promise<EntranceMatchDto> {
    const matricExamRollNo = buildExamRollNo(data.rollCode, data.rollNumber);

    const entrance = await EntranceRepository.findOne({
      where: {
        examYear: data.examYear.trim(),
        matricExamRollNo,
        fatherNameMm: data.fatherName.trim(),
      },
      select: [
        'entranceId',
        'applicantNameMm',
        'fatherNameMm',
        'examYear',
        'matricExamRollNo',
        'institution',
        'totalScore',
      ],
    });

    if (!entrance) {
      // Generic message to avoid enumerating entrance records.
      throw AppError.notFound(
        'No matching entrance record found. Please check your details.',
      );
    }

    return {
      entranceId: entrance.entranceId,
      applicantNameMm: entrance.applicantNameMm,
      fatherNameMm: entrance.fatherNameMm,
      examYear: entrance.examYear,
      matricExamRollNo: entrance.matricExamRollNo,
      institution: entrance.institution,
      totalScore: Number(entrance.totalScore),
    };
  }

  /**
   * Registers a new user, hashes the password, and generates an OTP for verification.
   * Re-verifies the entrance record inside the transaction but does NOT mark it as
   * claimed yet — the entrance is only claimed once the account's email is verified
   * (see verifyOtp). This lets a user re-register with a different email if they
   * mistyped it, and prevents an abandoned unverified account from locking the roll no.
   * If an existing account with the same email is unverified, it will be updated in-place.
   */
  async register(data: AccountRegisterInput): Promise<Account> {
    const { examYear, rollCode, rollNumber, fatherName, email, password } =
      data;
    const matricExamRollNo = buildExamRollNo(rollCode, rollNumber);

    // 1. Hash password and OTP
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const plaintextOtp = generateOtp();
    const otpHash = hashOtp(plaintextOtp);
    const otpExpiresAt = getOtpExpiration();

    // 2. Perform atomic lookup and upsert inside transaction.
    //    The entrance is NOT claimed here — that happens only after the email is
    //    verified in verifyOtp(), so an abandoned unverified account cannot lock
    //    the entrance roll number.
    const savedAccount = await AppDataSource.transaction(async (manager) => {
      const accountRepo = manager.getRepository(Account);
      const entranceRepo = manager.getRepository(EntranceRegistration);

      // --- Re-verify the entrance record (anti-bypass) ---
      const entrance = await entranceRepo.findOne({
        where: {
          examYear: examYear.trim(),
          matricExamRollNo,
          fatherNameMm: fatherName.trim(),
        },
      });

      if (!entrance) {
        throw AppError.badRequest(
          'No matching entrance record found. Please complete the entrance lookup again.',
        );
      }

      if (entrance.isClaimed) {
        throw AppError.badRequest(
          'This entrance record has already been used to register an account.',
        );
      }

      // --- Account lookup / upsert ---
      // Lock row to prevent registration race conditions
      const existingAccount = await accountRepo.findOne({
        where: { email },
        lock: { mode: 'pessimistic_write' },
      });

      if (existingAccount && existingAccount.isVerified) {
        throw AppError.badRequest('An account with this email already exists.');
      }

      let account = existingAccount;
      if (account) {
        // Update unverified account in-place
        account.password = passwordHash;
        account.otpCode = otpHash;
        account.otpExpiresAt = otpExpiresAt;
        account.isVerified = false;
        account.entranceId = entrance.entranceId;
      } else {
        account = accountRepo.create({
          email,
          password: passwordHash,
          otpCode: otpHash,
          otpExpiresAt,
          isVerified: false,
          entranceId: entrance.entranceId,
        });
      }

      return await accountRepo.save(account);
    });

    // 3. Send OTP email asynchronously
    const emailSubject = 'Your Account Verification Code (OTP)';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2>Email Verification Required</h2>
        <p>Thank you for registering. Please use the following code to verify your account:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f4f4f4; border-radius: 4px; display: inline-block; margin: 15px 0;">
          ${plaintextOtp}
        </div>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    this.emailService
      .sendEmail({
        to: email,
        subject: emailSubject,
        html: emailHtml,
        text: `Your OTP is: ${plaintextOtp}. It expires in 10 minutes.`,
      })
      .catch((err) => console.error('Error sending OTP email:', err));

    // 4. Clean sensitive data
    savedAccount.password = '';
    savedAccount.otpCode = undefined;

    return savedAccount;
  }

  /**
   * Verifies the user's email using the provided plaintext OTP.
   * On success, atomically marks the account verified AND claims the entrance
   * record (sets isClaimed = true) so a single roll number can only be tied to
   * one verified account. If two unverified accounts raced on the same entrance,
   * the first to verify wins; the loser gets a clear error and must re-register.
   * @param data OTP verification data.
   * @returns The verified Account entity.
   */
  async verifyOtp(data: AccountVerifyOtpInput): Promise<Account> {
    const { email, otp } = data;

    // 1. Find account by email and select the otpCode hash
    const account = await this.accountRepo
      .createQueryBuilder('account')
      .addSelect('account.otpCode')
      .where('account.email = :email', { email })
      .getOne();

    if (!account) {
      throw AppError.notFound('Account not found.');
    }

    if (account.isVerified) {
      throw AppError.badRequest('Account is already verified.');
    }

    // 2. Check expiration
    if (account.otpExpiresAt && account.otpExpiresAt.getTime() < Date.now()) {
      account.otpCode = null;
      account.otpExpiresAt = null;
      await this.accountRepo.save(account);
      throw AppError.badRequest(
        'OTP code has expired. Please request a new one.',
      );
    }

    // 3. Compare HMAC SHA-256 OTP hashes (non-blocking)
    if (!account.otpCode) {
      throw AppError.badRequest(
        'No OTP found for this account. Please register or request a new OTP.',
      );
    }

    const hashedInputOtp = hashOtp(otp);
    if (account.otpCode !== hashedInputOtp) {
      throw AppError.badRequest('Invalid OTP code.');
    }

    // 4. Mark verified and claim the entrance atomically.
    //    The entrance is only locked down here — after the email is proven
    //    valid — so a mistyped/abandoned email never strands the roll number.
    const verifiedAccount = await AppDataSource.transaction(async (manager) => {
      const accountRepo = manager.getRepository(Account);
      const entranceRepo = manager.getRepository(EntranceRegistration);

      // Re-load the account with a write lock so two concurrent verifications
      // of the same account serialize.
      const lockedAccount = await accountRepo.findOne({
        where: { id: account.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!lockedAccount) {
        throw AppError.notFound('Account not found.');
      }

      // Claim the entrance (if this account has one). This is the real
      // "this roll number is now taken" moment.
      if (lockedAccount.entranceId != null) {
        const entrance = await entranceRepo.findOne({
          where: { entranceId: lockedAccount.entranceId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!entrance) {
          throw AppError.badRequest(
            'The entrance record linked to this account no longer exists.',
          );
        }

        if (entrance.isClaimed) {
          // Another account verified first and claimed this entrance.
          throw AppError.badRequest(
            'This entrance record has already been claimed by another account. ' +
              'Please register again with the correct roll number.',
          );
        }

        entrance.isClaimed = true;
        await entranceRepo.save(entrance);
      }

      lockedAccount.isVerified = true;
      lockedAccount.otpCode = null;
      lockedAccount.otpExpiresAt = null;
      lockedAccount.lastLoginAt = new Date();

      const saved = await accountRepo.save(lockedAccount);
      saved.password = '';
      return saved;
    });

    return verifiedAccount;
  }

  /**
   * Resets (regenerates) a new OTP for an unverified account.
   * Prevents user enumeration by returning generic response if email is missing or verified.
   */
  async resetOtp(email: string): Promise<{ message: string }> {
    const successMsg = {
      message: 'A new OTP has been sent to your email address.',
    };

    const account = await this.accountRepo.findOne({ where: { email } });

    if (!account || account.isVerified) {
      return successMsg;
    }

    const plaintextOtp = generateOtp();
    const otpHash = hashOtp(plaintextOtp);
    const otpExpiresAt = getOtpExpiration();

    const emailSubject = 'Your New Verification Code (OTP)';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2>New Verification Code</h2>
        <p>You have requested a new verification code. Please use the following OTP to verify your account:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f4f4f4; border-radius: 4px; display: inline-block; margin: 15px 0;">
          ${plaintextOtp}
        </div>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    this.emailService
      .sendEmail({
        to: email,
        subject: emailSubject,
        html: emailHtml,
        text: `Your new OTP is: ${plaintextOtp}. It expires in 10 minutes.`,
      })
      .catch((err) => console.error('Error sending OTP email:', err));

    account.otpCode = otpHash;
    account.otpExpiresAt = otpExpiresAt;
    await this.accountRepo.save(account);

    return successMsg;
  }

  /**
   * Logs a user in by checking credentials.
   * Prevents timing attacks via dummy comparisons.
   */
  async login(data: AccountLoginInput): Promise<Account> {
    const { email, password } = data;

    const account = await this.accountRepo
      .createQueryBuilder('account')
      .addSelect('account.password')
      .where('account.email = :email', { email })
      .getOne();

    const dummyHash =
      '$2b$10$abcdefghijklmnopqrstuvwxyzaaaaaaaaaaaaaaaaaaaaaaaaa';

    if (!account) {
      // Prevent timing attack
      await bcrypt.compare(password, dummyHash);
      throw AppError.unauthorized('Invalid credentials.');
    }

    if (!account.isVerified) {
      // Prevent timing attack and hide verification state from non-credentials checks
      await bcrypt.compare(password, dummyHash);
      throw AppError.forbidden(
        'Account not verified. Please verify your email using the sent OTP code.',
      );
    }

    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      throw AppError.unauthorized('Invalid credentials.');
    }

    account.lastLoginAt = new Date();
    await this.accountRepo.save(account);

    account.password = '';
    return account;
  }

  async verifyResetOtp(
    data: AccountVerifyResetOtpInput,
  ): Promise<{ message: string }> {
    const { email, otp } = data;

    const account = await this.accountRepo
      .createQueryBuilder('account')
      .addSelect('account.otpCode')
      .where('account.email = :email', { email })
      .getOne();

    if (!account) {
      throw AppError.notFound('Account not found.');
    }

    if (account.otpExpiresAt && account.otpExpiresAt.getTime() < Date.now()) {
      account.otpCode = null;
      account.otpExpiresAt = null;
      await this.accountRepo.save(account);
      throw AppError.badRequest(
        'OTP code has expired. Please request a new one.',
      );
    }

    if (!account.otpCode) {
      throw AppError.badRequest(
        'No password reset requested or OTP has expired.',
      );
    }

    const hashedInputOtp = hashOtp(otp);
    if (account.otpCode !== hashedInputOtp) {
      throw AppError.badRequest('Invalid OTP code.');
    }

    // OTP is valid — do NOT clear it yet. It will be consumed by resetPassword.
    return { message: 'OTP verified successfully.' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const successMsg = {
      message:
        'If this email exists in our system, a password reset code has been sent.',
    };

    const account = await this.accountRepo.findOne({ where: { email } });

    // Prevent user enumeration: return success even if user not found or unverified
    if (!account || !account.isVerified) {
      return successMsg;
    }

    const plaintextOtp = generateOtp();
    const otpHash = hashOtp(plaintextOtp);
    const otpExpiresAt = getOtpExpiration();

    const emailSubject = 'Your Password Reset Verification Code (OTP)';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2>Password Reset Code</h2>
        <p>Please use the following code to reset your password:</p>
        <div style="font-size: 24px; font-weight: bold; padding: 10px; background-color: #f4f4f4; border-radius: 4px; display: inline-block; margin: 15px 0;">
          ${plaintextOtp}
        </div>
        <p>This code is valid for 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    this.emailService
      .sendEmail({
        to: email,
        subject: emailSubject,
        html: emailHtml,
        text: `Your password reset OTP is: ${plaintextOtp}. It expires in 10 minutes.`,
      })
      .catch((err) =>
        console.error('Error sending password reset email:', err),
      );

    account.otpCode = otpHash;
    account.otpExpiresAt = otpExpiresAt;
    await this.accountRepo.save(account);

    return successMsg;
  }

  async resetPassword(
    data: AccountResetPasswordInput,
  ): Promise<{ message: string }> {
    const { email, otp, password } = data;

    const account = await this.accountRepo
      .createQueryBuilder('account')
      .addSelect('account.otpCode')
      .where('account.email = :email', { email })
      .getOne();

    if (!account) {
      throw AppError.notFound('Account not found.');
    }

    if (account.otpExpiresAt && account.otpExpiresAt.getTime() < Date.now()) {
      account.otpCode = null;
      account.otpExpiresAt = null;
      await this.accountRepo.save(account);
      throw AppError.badRequest(
        'OTP code has expired. Please request a new one.',
      );
    }

    if (!account.otpCode) {
      throw AppError.badRequest(
        'No password reset requested or OTP has expired.',
      );
    }

    const hashedInputOtp = hashOtp(otp);
    if (account.otpCode !== hashedInputOtp) {
      throw AppError.badRequest('Invalid OTP code.');
    }

    // Hash the new password with bcrypt
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    account.password = passwordHash;
    account.otpCode = null;
    account.otpExpiresAt = null;
    account.tokenVersion += 1; // Invalidate all existing tokens on other devices

    await this.accountRepo.save(account);

    return {
      message:
        'Password reset successful. You can now login with your new password.',
    };
  }

  async logoutAll(accountId: number): Promise<Account> {
    await this.accountRepo.increment({ id: accountId }, 'tokenVersion', 1);
    return await this.accountRepo.findOneByOrFail({ id: accountId });
  }

}
