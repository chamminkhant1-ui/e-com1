import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from './auth.service';
import AppError from '../../common/utils/AppError';
import {
  signToken,
  JWT_COOKIE_NAME,
  AuthTokenPayload,
} from '../../common/utils/jwt.utils';
import {
  AccountLoginInput,
  AccountRegisterInput,
  AccountResetOtpInput,
  AccountVerifyEntranceInput,
  AccountVerifyOtpInput,
  AccountForgotPasswordInput,
  AccountVerifyResetOtpInput,
  AccountResetPasswordInput,
  StudentProfileInput,
} from './auth.schema';
import { buildAuthUserDto } from './auth.user';

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  /**
   * Sets the JWT in an HTTP-only cookie.
   */
  private setAuthCookie = (res: Response, token: string): void => {
    res.cookie(JWT_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching token expiration)
    });
  };

  /**
   * Handles user registration.
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const payload: AccountRegisterInput = (req as any).validatedBody ?? req.body;
    const newAccount = await this.authService.register(payload);

    res.status(201).json({
      ok: true,
      message:
        'Registration successful. A 6-digit OTP code has been sent to your email for verification.',
      data: newAccount,
    });
  });

  /**
   * Read-only entrance lookup for the first-year registration flow.
   * Returns a safe subset of the matched entrance record for confirmation.
   */
  verifyEntrance = asyncHandler(async (req: Request, res: Response) => {
    const payload: AccountVerifyEntranceInput =
      (req as any).validatedBody ?? req.body;
    const match = await this.authService.verifyEntrance(payload);

    res.status(200).json({
      ok: true,
      message: 'Entrance record found. Please confirm your details.',
      data: match,
    });
  });

  /**
   * Handles OTP verification.
   */
  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const payload: AccountVerifyOtpInput = (req as any).validatedBody ?? req.body;
    const verifiedAccount = await this.authService.verifyOtp(payload);

    const token = signToken(verifiedAccount);
    this.setAuthCookie(res, token);

    const userDto = await buildAuthUserDto(verifiedAccount);

    res.status(200).json({
      ok: true,
      message: 'Email verified. You are signed in.',
      data: userDto,
    });
  });

  /**
   * Handles the request to reset a new OTP.
   */
  resetOtpController = asyncHandler(async (req: Request, res: Response) => {
    const payload: AccountResetOtpInput = (req as any).validatedBody ?? req.body;
    const result = await this.authService.resetOtp(payload.email);

    res.status(200).json({
      ok: true,
      message: result.message,
    });
  });

  /**
   * Handles user login, issues JWT, and sets it as an HTTP-only cookie.
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const payload: AccountLoginInput = (req as any).validatedBody ?? req.body;
    const account = await this.authService.login(payload);
    const userDto = await buildAuthUserDto(account);

    const token = signToken(account);
    this.setAuthCookie(res, token);

    res.status(200).json({
      ok: true,
      message: 'Login successful.',
      data: userDto,
    });
  });

  /**
   * Handles user logout by clearing the authentication cookie immediately.
   */
  logout = (_req: Request, res: Response) => {
    res.clearCookie(JWT_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ ok: true, message: 'Logged out successfully.' });
  };

  /**
   * Handles logging out from all devices by invalidating all existing tokens.
   */
  logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user as AuthTokenPayload;

    const account = await this.authService.logoutAll(user.id);
    const token = signToken(account);
    this.setAuthCookie(res, token);

    res
      .status(200)
      .json({ ok: true, message: 'Logged out all devices successfully.' });
  });

  /**
   * Handles forgot password requests (generates OTP).
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const payload: AccountForgotPasswordInput = (req as any).validatedBody ?? req.body;
    const result = await this.authService.forgotPassword(payload.email);

    res.status(200).json({
      ok: true,
      message: result.message,
    });
  });

  /**
   * Verifies the reset OTP without consuming it (allows showing password step only after OTP is confirmed valid).
   */
  verifyResetOtp = asyncHandler(async (req: Request, res: Response) => {
    const payload: AccountVerifyResetOtpInput = (req as any).validatedBody ?? req.body;
    const result = await this.authService.verifyResetOtp(payload);

    res.status(200).json({
      ok: true,
      message: result.message,
    });
  });

  /**
   * Handles reset password requests (verifies OTP and updates password).
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const payload: AccountResetPasswordInput = (req as any).validatedBody ?? req.body;
    const result = await this.authService.resetPassword(payload);

    res.status(200).json({
      ok: true,
      message: result.message,
    });
  });

  /**
   * Endpoint to get the currently logged-in user's details.
   */
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user as AuthTokenPayload;
    if (!user) {
      throw AppError.unauthorized('Authentication failed in getMe.');
    }
    const account = await this.authService.findOne(user.id);
    if (!account) {
      throw AppError.unauthorized('User associated with token no longer exists.');
    }

    const userDto = await buildAuthUserDto(account);
    userDto.serverDate = new Date().toISOString();

    res.status(200).json({
      ok: true,
      data: userDto,
    });
  });

  /**
   * POST /api/auth/profile
   * Saves the full student registration profile from the dashboard form.
   * Requires authentication. Resolves address names to IDs and persists all
   * related records (StudentProfile, ParentProfile, addresses) in one transaction.
   */
  saveProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user as AuthTokenPayload;
    if (!user) {
      throw AppError.unauthorized('Authentication failed in saveProfile.');
    }

    const payload: StudentProfileInput = (req as any).validatedBody ?? req.body;
    const profile = await this.authService.saveStudentProfile(user.id, payload);

    res.status(200).json({
      ok: true,
      message: 'Profile saved successfully.',
      data: { studentId: profile.studentId },
    });
  });
}
