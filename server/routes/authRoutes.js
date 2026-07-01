import express from "express";

import {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
    updateMyAccount,
} from "../controllers/authController.js";

import {
    sendEmailOtp,
    verifyEmailOtp,
} from "../controllers/emailOtpController.js";

import {
    sendMobileOtp,
    verifyMobileOtp,
} from "../controllers/mobileOtpController.js";

import { createProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* =====================================================
   AUTH ROUTES
   Handles user registration and login
===================================================== */
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/me", protect, updateMyAccount);

/* =====================================================
   EMAIL OTP ROUTES
   Sends and verifies OTP for email verification
===================================================== */
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);

/* =====================================================
   MOBILE OTP ROUTES
   Sends and verifies OTP for mobile verification
===================================================== */
router.post("/send-mobile-otp", sendMobileOtp);
router.post("/verify-mobile-otp", verifyMobileOtp);

/* =====================================================
   PASSWORD RESET ROUTES
   Sends password reset OTP and updates password
===================================================== */
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

/* =====================================================
   PROFILE ROUTE
   Creates or updates logged-in user's profile
===================================================== */
router.post(
    "/create",
    protect,
    createProfile
);

export default router;
