import Otp from "../models/Otp.js";
import User from "../models/User.js";
import { sendOtpEmail } from "../services/emailService.js";

export const sendEmailOtp = async (req, res) => {
    try {
        const { email, mobile } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanMobile = mobile?.trim();
        const existingUser = await User.findOne({
            $or: [
                { email: cleanEmail },
                ...(cleanMobile ? [{ mobile: cleanMobile }] : []),
            ],
        });

        if (existingUser) {
            const duplicateField = existingUser.email === cleanEmail ? "email" : "mobile number";

            return res.status(409).json({
                success: false,
                message: `An account already exists with this ${duplicateField}. Please login using your existing credentials.`,
            });
        }

        await Otp.updateMany(
            {
                type: "email",
                email: cleanEmail,
                isUsed: false,
            },
            { isUsed: true }
        );

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        await Otp.create({
            type: "email",
            email: cleanEmail,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        await sendOtpEmail(cleanEmail, otp);

        return res.status(200).json({
            success: true,
            message: "OTP sent to your email",
        });
    } catch (error) {
        console.error("SEND EMAIL OTP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const verifyEmailOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanOtp = otp.toString().trim();

        const otpDoc = await Otp.findOne({
            type: "email",
            email: cleanEmail,
            otp: cleanOtp,
            isUsed: false,
        }).sort({ createdAt: -1 });

        if (!otpDoc) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (otpDoc.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP expired",
            });
        }

        otpDoc.isUsed = true;
        await otpDoc.save();

        return res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        console.error("VERIFY EMAIL OTP ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};