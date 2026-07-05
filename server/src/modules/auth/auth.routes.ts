import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../common/middleware/validate";
import { verifyAuth } from "../../common/middleware/auth.middleware";
import { AccountSchema } from "./auth.schema";
import rateLimit from "express-rate-limit";

const router = Router();
const authController = new AuthController();

// Rate limiter for sensitive auth endpoints (15 min window, 20 requests max)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    ok: false,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route POST /api/v1/auth/verify-entrance
 * @desc Read-only lookup of an entrance record for the first-year registration flow.
 *       Returns a safe subset for confirmation without claiming the record.
 * @access Public
 */
router.post(
  "/verify-entrance",
  authRateLimiter,
  validate({ body: AccountSchema.verifyEntrance }),
  authController.verifyEntrance
);

/**
 * @route POST /api/v1/auth/register
 * @desc Registers a new account, re-verifies the entrance record, generates an OTP (which is hashed), and sends it to the user. The entrance is NOT claimed here — it is claimed only after the email is verified (see /verify-otp).
 * @access Public
 */
router.post(
  "/register",
  authRateLimiter,
  validate({ body: AccountSchema.register }),
  authController.register
);

/**
 * @route POST /api/v1/auth/verify-otp
 * @desc Verifies the account using the plaintext OTP provided by the user (compares it against the stored hash). On success, also claims the linked entrance record so it cannot be used by another account.
 * @access Public
 */
router.post(
  "/verify-otp",
  authRateLimiter,
  validate({ body: AccountSchema.verifyOtp }),
  authController.verifyOtp
);

/**
 * @route POST /api/v1/auth/reset-otp
 * @desc Initiates the OTP reset process by sending a new OTP to the user's email.
 * @access Public
 */
router.post(
  "/reset-otp",
  authRateLimiter,
  validate({ body: AccountSchema.resetOtp }), 
  authController.resetOtpController
);

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Requests a password reset code for an email.
 * @access Public
 */
router.post(
  "/forgot-password",
  authRateLimiter,
  validate({ body: AccountSchema.forgotPassword }),
  authController.forgotPassword
);

/**
 * @route POST /api/v1/auth/verify-reset-otp
 * @desc Verifies the reset OTP is correct without consuming it.
 * @access Public
 */
router.post(
  "/verify-reset-otp",
  authRateLimiter,
  validate({ body: AccountSchema.verifyResetOtp }),
  authController.verifyResetOtp
);

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Resets the password using email, OTP, and new password.
 * @access Public
 */
router.post(
  "/reset-password",
  authRateLimiter,
  validate({ body: AccountSchema.resetPassword }),
  authController.resetPassword
);

/**
 * @route POST /api/v1/auth/login
 * @desc Logs in a user, issues a JWT, and sets an HTTP-only cookie.
 * @access Public
 */
router.post(
  "/login",
  authRateLimiter,
  validate({ body: AccountSchema.login }),
  authController.login
);

// --- Protected Routes (Require Authentication) ---

/**
 * @route GET /api/v1/auth/me
 * @desc Fetches the current user's details based on the JWT cookie.
 * @access Private
 */
router.get(
  "/me",
  verifyAuth,
  authController.getMe
);

/**
 * @route POST /api/v1/auth/logout
 * @desc Logs out the user by clearing the JWT cookie.
 * @access Private
 */
router.post(
  "/logout",
  verifyAuth,
  authController.logout
);

/**
 * @route POST /api/v1/auth/logout-all
 * @desc Logs out the user from all devices by invalidating all existing tokens.
 * @access Private
 */
router.post(
  "/logout-all",
  verifyAuth,
  authController.logoutAll
);

/**
 * @route POST /api/auth/profile
 * @desc Saves (upserts) the student's full registration profile submitted from the /dashboard form.
 *       Resolves address names → IDs and writes StudentProfile, ParentProfile, and Address records.
 * @access Private (student must be authenticated)
 */
router.post(
  "/profile",
  verifyAuth,
  validate({ body: AccountSchema.studentProfile }),
  authController.saveProfile
);

export default router;