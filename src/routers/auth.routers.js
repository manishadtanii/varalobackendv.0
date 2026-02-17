import express from 'express';
import { login, changePassword, forgotPasswordRequestOTP, forgotPasswordResendOTP, forgotPasswordVerifyOTP, forgotPasswordReset } from '../controllers/auth.controller.js';
const router = express.Router();

// ========== SIMPLE LOGIN FLOW ==========
// Direct login with email + password (No OTP)
router.post('/admin/login', login);

// ========== SIMPLE PASSWORD CHANGE FLOW ==========
// Direct password change (No OTP - requires JWT)
router.post('/admin/change-password', changePassword);

// ========== FORGOT PASSWORD FLOW ==========
// Step 1: Request OTP for forgot password (NO JWT NEEDED - Public endpoint)
router.post('/admin/forgot-password/request-otp', forgotPasswordRequestOTP);

// Step 1.5: Resend OTP for forgot password
router.post('/admin/forgot-password/resend-otp', forgotPasswordResendOTP);

// Step 2: Verify OTP for forgot password
router.post('/admin/forgot-password/verify-otp', forgotPasswordVerifyOTP);

// Step 3: Reset password (requires resetPasswordToken from step 2)
router.post('/admin/forgot-password/reset', forgotPasswordReset);

export default router;