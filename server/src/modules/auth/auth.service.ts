import { Repository } from 'typeorm';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { BaseService } from '../../common/services/BaseService';
import { Account } from '../../database/entities/Account';
import { AppDataSource } from '../../database/data-source';
import {
  AccountLoginInput,
  AccountRegisterInput,
  AccountVerifyOtpInput,
  AccountForgotPasswordInput,
  AccountVerifyResetOtpInput,
  AccountResetPasswordInput,
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

export class AuthService extends BaseService<Account> {
  protected accountRepo: Repository<Account>;
  private emailService: EmailService;

  constructor(emailService?: EmailService) {
    super(AccountRepository);
    this.accountRepo = AccountRepository;
    this.emailService = emailService || new EmailService();
  }

  /**
   * Registers a new user, hashes the password, and generates an OTP for verification.
   * If an existing account with the same email is unverified, it will be updated in-place.
   */
  async register(data: AccountRegisterInput): Promise<Account> {
    const { username, email, password } = data;

    // 1. Hash password and OTP
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const plaintextOtp = generateOtp();
    const otpHash = hashOtp(plaintextOtp);
    const otpExpiresAt = getOtpExpiration();

    // 2. Perform atomic lookup and upsert inside transaction
    const savedAccount = await AppDataSource.transaction(async (manager) => {
      const accountRepo = manager.getRepository(Account);

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
        account.username = username;
        account.password = passwordHash;
        account.otpCode = otpHash;
        account.otpExpiresAt = otpExpiresAt;
        account.isVerified = false;
      } else {
        account = accountRepo.create({
          username,
          email,
          password: passwordHash,
          otpCode: otpHash,
          otpExpiresAt,
          isVerified: false,
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

    // 4. Update status and save directly to DB
    account.isVerified = true;
    account.otpCode = null;
    account.otpExpiresAt = null;
    account.lastLoginAt = new Date();

    const verifiedAccount = await this.accountRepo.save(account);
    verifiedAccount.password = '';

    return verifiedAccount;
  }

  /**
   * Resets (regenerates) a new OTP for an unverified account.
   * Prevents user enumeration by returning generic response if email is missing or verified.
   */
  async resetOtp(email: string): Promise<{ message: string }> {
    const successMsg = { message: 'A new OTP has been sent to your email address.' };

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

    const dummyHash = '$2b$10$abcdefghijklmnopqrstuvwxyzaaaaaaaaaaaaaaaaaaaaaaaaa';

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

  async verifyResetOtp(data: AccountVerifyResetOtpInput): Promise<{ message: string }> {
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
      throw AppError.badRequest('OTP code has expired. Please request a new one.');
    }

    if (!account.otpCode) {
      throw AppError.badRequest('No password reset requested or OTP has expired.');
    }

    const hashedInputOtp = hashOtp(otp);
    if (account.otpCode !== hashedInputOtp) {
      throw AppError.badRequest('Invalid OTP code.');
    }

    // OTP is valid — do NOT clear it yet. It will be consumed by resetPassword.
    return { message: 'OTP verified successfully.' };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const successMsg = { message: 'If this email exists in our system, a password reset code has been sent.' };

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
      .catch((err) => console.error('Error sending password reset email:', err));

    account.otpCode = otpHash;
    account.otpExpiresAt = otpExpiresAt;
    await this.accountRepo.save(account);

    return successMsg;
  }

  async resetPassword(data: AccountResetPasswordInput): Promise<{ message: string }> {
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
      throw AppError.badRequest('OTP code has expired. Please request a new one.');
    }

    if (!account.otpCode) {
      throw AppError.badRequest('No password reset requested or OTP has expired.');
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

    return { message: 'Password reset successful. You can now login with your new password.' };
  }

  async logoutAll(accountId: number): Promise<Account> {
    await this.accountRepo.increment({ id: accountId }, 'tokenVersion', 1);
    return await this.accountRepo.findOneByOrFail({ id: accountId });
  }
}
