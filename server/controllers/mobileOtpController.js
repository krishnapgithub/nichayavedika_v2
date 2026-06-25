import Otp from "../models/Otp.js";

export const sendMobileOtp = async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required",
            });
        }

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        await Otp.create({
            type: "mobile",
            mobile,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        res.json({
            success: true,
            message: "Mobile OTP sent successfully",
            devOtp: otp, // remove in production
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const verifyMobileOtp = async (req, res) => {
    try {
        const { mobile, otp } = req.body;

        if (!mobile || !otp) {
            return res.status(400).json({
                success: false,
                message: "Mobile number and OTP are required",
            });
        }

        const otpDoc = await Otp.findOne({
            type: "mobile",
            mobile,
            otp,
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

        return res.json({
            success: true,
            message: "Mobile verified successfully",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};