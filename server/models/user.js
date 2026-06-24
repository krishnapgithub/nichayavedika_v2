import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        gender: {
            type: String,
            enum: ["Bride", "Groom"],
            required: true,
        },

        registeringFor: {
            type: String,
            enum: ["Self", "Son", "Daughter", "Brother", "Sister"],
            required: true,
        },

        role: {
            type: String,
            enum: ["user", "admin", "oper_admin", "executive"],
            default: "user",
        },

        isMobileVerified: {
            type: Boolean,
            default: false,
        },

        otp: {
            type: String,
            default: null,
        },

        otpExpiresAt: {
            type: Date,
            default: null,
        },

        membershipPlan: {
            type: String,
            enum: ["free", "premium", "elite"],
            default: "free",
        },

        membershipExpiresAt: {
            type: Date,
            default: null,
        },

        profileViewsRemaining: {
            type: Number,
            default: 5,
        },

        profileStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);

export default User;