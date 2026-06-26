
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import {
    USER_STATUS,
    USER_ROLES,
    MEMBERSHIP_PLANS,
    APP_SETTINGS,
} from "../config/appConstants.js";

{/*
import {
    USER_STATUS,
    USER_ROLES,
    MEMBERSHIP_PLANS,
    FREE_PROFILE_VIEWS,
} from "../config/appConstants.js";*/}

const userSchema = new mongoose.Schema(
    {

        role: {
            type: String,
            enum: ["user", "admin", "super_admin", "oper_admin", "executive"],
            default: "user",
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
            
        },

        mobile: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
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
            enum: Object.values(USER_ROLES),
            default: "user",
        },

        isMobileVerified: {
            type: Boolean,
            default: false,
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

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    //next();
});



const User = mongoose.model("User", userSchema);

export default User;