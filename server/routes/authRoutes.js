import express from "express";
import {
    forgotPassword,
    resetPassword,
} from "../controllers/authController.js";

import {
    registerUser,
    loginUser,
} from "../controllers/authController.js";

import {
    sendEmailOtp,
    verifyEmailOtp,
} from "../controllers/emailOtpController.js";

import {
    sendMobileOtp,
    verifyMobileOtp,
} from "../controllers/mobileOtpController.js";

const router = express.Router();

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);

// Email OTP
router.post("/send-email-otp", sendEmailOtp);
router.post("/verify-email-otp", verifyEmailOtp);

// Mobile OTP
router.post("/send-mobile-otp", sendMobileOtp);
router.post("/verify-mobile-otp", verifyMobileOtp);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;