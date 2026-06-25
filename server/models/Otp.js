import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["mobile", "email"],
            required: true,
        },

        mobile: String,

        email: {
            type: String,
            lowercase: true,
            trim: true,
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
    { timestamps: true }
);

export default mongoose.model("Otp", otpSchema);