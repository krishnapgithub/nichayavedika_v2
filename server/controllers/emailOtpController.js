import Otp from "../models/Otp.js";

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

        console.log("VERIFY INPUT:", {
            email: cleanEmail,
            otp: cleanOtp,
        });

        const latestOtp = await Otp.findOne({
            email: cleanEmail,
        }).sort({ createdAt: -1 });

        console.log("LATEST OTP RECORD:", latestOtp);

        const otpDoc = await Otp.findOne({
            type: "email",
            email: cleanEmail,
            otp: cleanOtp,
            isUsed: false,
        }).sort({ createdAt: -1 });

        console.log("OTP DOC FOUND:", otpDoc);

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
export const sendEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        await Otp.updateMany(
            {
                type: "email",
                email: cleanEmail,
                isUsed: false,
            },
            {
                isUsed: true,
            }
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

        console.log("EMAIL OTP CREATED:", {
            email: cleanEmail,
            otp,
        });

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