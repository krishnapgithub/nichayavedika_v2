import express from "express";
import {
    registerUser,
    sendOtp,
    verifyOtp,
    loginUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);

export default router;