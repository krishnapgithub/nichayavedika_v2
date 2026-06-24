import mongoose from "mongoose";


export const sendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;

        console.log("SEND OTP MOBILE:", mobile);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const otpDoc = await Otp.create({
            mobile,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        console.log("OTP SAVED:", otpDoc);

        res.json({
            success: true,
            message: "OTP sent successfully",
            devOtp: otp,
        });
    } catch (error) {
        console.error("SEND OTP ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const otpSchema = new mongoose.Schema(
    {
        mobile: {
            type: String,
            required: true,
        },

        otp: {
            type: String,
            required: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        isUsed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;