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
  StudentProfileInput,
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
    const examRollNo = buildExamRollNo(data.rollCode, data.rollNumber);

    const entrance = await EntranceRepository.findOne({
      where: {
        examYear: data.examYear.trim(),
        examRollNo,
        fatherNameMm: data.fatherName.trim(),
      },
      select: [
        'entranceId',
        'applicantNameMm',
        'fatherNameMm',
        'examYear',
        'examRollNo',
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
      examRollNo: entrance.examRollNo,
      institution: entrance.institution,
      totalScore: Number(entrance.totalScore),
    };
  }

  /**
   * Registers a new user, hashes the password, and generates an OTP for verification.
   * Re-verifies the entrance record inside the transaction and marks it as claimed
   * so the same roll number cannot be used to register twice.
   * If an existing account with the same email is unverified, it will be updated in-place.
   */
  async register(data: AccountRegisterInput): Promise<Account> {
    const { examYear, rollCode, rollNumber, fatherName, email, password } = data;
    const examRollNo = buildExamRollNo(rollCode, rollNumber);

    // 1. Hash password and OTP
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const plaintextOtp = generateOtp();
    const otpHash = hashOtp(plaintextOtp);
    const otpExpiresAt = getOtpExpiration();

    // 2. Perform atomic lookup, claim, and upsert inside transaction
    const savedAccount = await AppDataSource.transaction(async (manager) => {
      const accountRepo = manager.getRepository(Account);
      const entranceRepo = manager.getRepository(EntranceRegistration);

      // --- Re-verify the entrance record (anti-bypass) ---
      const entrance = await entranceRepo.findOne({
        where: {
          examYear: examYear.trim(),
          examRollNo,
          fatherNameMm: fatherName.trim(),
        },
        lock: { mode: 'pessimistic_write' },
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

      // Claim it now, within the same transaction.
      entrance.isClaimed = true;
      await entranceRepo.save(entrance);

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

  /**
   * Saves or updates the student registration profile submitted from the dashboard form.
   * Resolves state/district/township names → IDs, writes StudentProfile,
   * ParentProfile, and two Address records in a single transaction.
   */
  async saveStudentProfile(
    accountId: number,
    data: StudentProfileInput,
  ): Promise<StudentProfile> {
    // Helper: Myanmar digit → ASCII digit for comparison
    const toAsciiDigit = (s: string): string =>
      s.replace(/[၁-၉]/g, (c) => String(c.codePointAt(0)! - 0x1040));

    const buildNrc = (n: typeof data.studentNrc): string =>
      `${n.region}/${n.city}(${n.prefix})${n.number}`;

    // Build NRC strings
    const studentNrc = buildNrc(data.studentNrc);
    const fatherNrc = buildNrc(data.fatherNrc);
    const motherNrc = buildNrc(data.motherNrc);

    // High-school roll number (matriPlaceSelect-matriRollNumber)
    const highSchoolRollNo = `${data.matriPlaceSelect}-${data.matriRollNumber}`;

    // Map Myanmar gender label to DB enum
    const genderMap: Record<string, 'M' | 'F' | 'Other'> = {
      'ကျား': 'M',
      'မ': 'F',
    };
    const gender: 'M' | 'F' | 'Other' = genderMap[data.gender] ?? (data.gender as 'M' | 'F' | 'Other');

    // Fetch student's account to get the associated entrance ID
    const account = await this.accountRepo.findOne({
      where: { id: accountId },
      select: ['entranceId'],
    });

    /**
     * Resolves a Myanmar-name state/district/township into their ID codes.
     * Throws a 400 error if any name is not found in the database.
     */
    const resolveLocationIds = async (
      manager: typeof AppDataSource.manager,
      contact: typeof data.student_contact,
    ): Promise<{ stateId: string; districtId: string; townshipId: string }> => {
      const stateRepo = manager.getRepository(State);
      const districtRepo = manager.getRepository(District);
      const townshipRepo = manager.getRepository(Township);

      const state = await stateRepo.findOne({ where: { nameMm: contact.state } });
      if (!state) throw AppError.badRequest(`State not found: ${contact.state}`);

      const district = await districtRepo.findOne({
        where: { stateId: state.stateId, nameMm: contact.district },
      });
      if (!district) throw AppError.badRequest(`District not found: ${contact.district}`);

      const township = await townshipRepo.findOne({
        where: {
          stateId: state.stateId,
          districtId: district.districtId,
          nameMm: contact.township,
        },
      });
      if (!township) throw AppError.badRequest(`Township not found: ${contact.township}`);

      return {
        stateId: state.stateId,
        districtId: district.districtId,
        townshipId: township.townshipId,
      };
    };

    const savedProfile = await AppDataSource.transaction(async (manager) => {
      const studentProfileRepo = manager.getRepository(StudentProfile);
      const parentProfileRepo = manager.getRepository(ParentProfile);
      const addressRepo = manager.getRepository(Address);

      // -- Resolve location IDs for both addresses --
      const studentLocIds = await resolveLocationIds(manager, data.student_contact);
      const parentLocIds = await resolveLocationIds(manager, data.parent_contact);

      // -- Upsert StudentProfile --
      let profile = await studentProfileRepo.findOne({ where: { studentId: accountId } });
      if (!profile) {
        profile = studentProfileRepo.create({ studentId: accountId } as Partial<StudentProfile> as StudentProfile);
      }

      profile.nameMm = data.nameMm;
      profile.nameEn = data.nameEn;
      profile.gender = gender;
      profile.dob = new Date(data.dob) as unknown as Date;
      profile.phoneNumber = data.phoneNumber;
      profile.studentNrc = studentNrc;
      profile.ethnicity = data.ethnicity.r1 || undefined;
      profile.religion = data.religion || undefined;
      profile.highSchoolRollNo = highSchoolRollNo;
      profile.highSchoolName = data.highSchoolName || undefined;
      profile.entryAcademicYear = data.entryAcademicYear || undefined;
      profile.entranceId = account?.entranceId || undefined;

      const savedStudentProfile = await studentProfileRepo.save(profile);

      // -- Upsert ParentProfile --
      let parentProfile = await parentProfileRepo.findOne({
        where: { studentId: accountId },
      });
      if (!parentProfile) {
        parentProfile = parentProfileRepo.create({ studentId: accountId } as Partial<ParentProfile> as ParentProfile);
      }

      parentProfile.fatherNameMm = data.fatherNameMm;
      parentProfile.fatherNameEn = data.fatherNameEn;
      parentProfile.fatherNrc = fatherNrc || undefined;
      parentProfile.fatherEthnicity = data.fatherEthnicity.r1 || undefined;
      parentProfile.fatherReligion = data.fatherReligion || undefined;
      parentProfile.fatherJob = data.fatherJob || undefined;
      parentProfile.motherNameMm = data.motherNameMm;
      parentProfile.motherNameEn = data.motherNameEn;
      parentProfile.motherNrc = motherNrc || undefined;
      parentProfile.motherEthnicity = data.motherEthnicity.r1 || undefined;
      parentProfile.motherReligion = data.motherReligion || undefined;
      parentProfile.motherJob = data.motherJob || undefined;
      parentProfile.parentPhone = data.parentPhone || undefined;

      await parentProfileRepo.save(parentProfile);

      // -- Upsert Address records --
      // Delete existing 'current' and 'parent' addresses to replace them
      await addressRepo.delete({ student: { studentId: accountId }, type: 'current' });
      await addressRepo.delete({ student: { studentId: accountId }, type: 'parent' });

      // Student current address
      const studentAddr = addressRepo.create({
        type: 'current',
        streetAddress: data.student_contact.address,
        stateId: studentLocIds.stateId,
        districtId: studentLocIds.districtId,
        townshipId: studentLocIds.townshipId,
        student: savedStudentProfile,
      });
      await addressRepo.save(studentAddr);

      // Parent address
      const parentAddr = addressRepo.create({
        type: 'parent',
        streetAddress: data.parent_contact.address,
        stateId: parentLocIds.stateId,
        districtId: parentLocIds.districtId,
        townshipId: parentLocIds.townshipId,
        student: savedStudentProfile,
      });
      await addressRepo.save(parentAddr);

      return savedStudentProfile;
    });

    return savedProfile;
  }
}
