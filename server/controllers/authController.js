
// ==========================================
// Application Constants
// ==========================================
import { USER_STATUS } from "../config/appConstants.js";

import jwt from "jsonwebtoken";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { sendOtpEmail } from "../services/emailService.js";



const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const getExpectedGender = (registeringFor) => {
    if (["Son", "Brother"].includes(registeringFor)) return "Groom";
    if (["Daughter", "Sister"].includes(registeringFor)) return "Bride";
    return "";
};

const buildUserResponse = (user) => ({
    id: user._id,
    fullName: user.fullName,
    mobile: user.mobile,
    email: user.email,
    gender: user.gender,
    registeringFor: user.registeringFor,
    role: user.role,
    membershipPlan: user.membershipPlan,
    menuAccess: user.menuAccess,
    isEmailVerified: user.isEmailVerified,
    isMobileVerified: user.isMobileVerified,
    status: user.status,
});



export const registerUser = async (req, res) => {

    console.log("REGISTER BODY:", req.body);
    try {
        const { fullName, mobile, email, password, gender, registeringFor } = req.body;

        if (!fullName || !mobile || !email || !password || !gender || !registeringFor) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        const expectedGender = getExpectedGender(registeringFor);

        if (expectedGender && gender !== expectedGender) {
            return res.status(400).json({
                success: false,
                message: `${registeringFor} registration should be selected as ${expectedGender}`,
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanMobile = mobile.trim();

        const existingUser = await User.findOne({
            $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
        });

        if (existingUser) {
            const duplicateField = existingUser.email === cleanEmail ? "email" : "mobile number";

            return res.status(409).json({
                success: false,
                message: `An account already exists with this ${duplicateField}. Please login using your existing credentials.`,
            });
        }

        const user = await User.create({
            fullName,
            mobile: cleanMobile,
            email: cleanEmail,
            password,
            gender,
            registeringFor,
            role: "user",
            membershipPlan: "free",
            isEmailVerified: true,
            isMobileVerified: false,
        });

        const token = generateToken(user._id);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                mobile: user.mobile,
                email: user.email,
                gender: user.gender,
                registeringFor: user.registeringFor,
                role: user.role,
                membershipPlan: user.membershipPlan,
                menuAccess: user.menuAccess,
                isEmailVerified: user.isEmailVerified,
                isMobileVerified: user.isMobileVerified,
            },
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);

        if (error.code === 11000) {
            const duplicateField = error.keyPattern?.mobile ? "mobile number" : "email";

            return res.status(409).json({
                success: false,
                message: `An account already exists with this ${duplicateField}. Please login using your existing credentials.`,
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (user.isActive === false) {
            return res.status(403).json({
                success: false,
                message: "Your account is deactivated. Please contact Super Admin.",
            });
        }



        const isPasswordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify email before login",
            });
        }

        // ==========================================
        // Admin Approval Check
        // ==========================================
        if (user.status !== USER_STATUS.APPROVED) {
            return res.status(403).json({
                success: false,
                message:
                    "Your registration is pending admin approval. Please wait for confirmation.",
            });
        }

        const token = generateToken(user._id);

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                mobile: user.mobile,
                email: user.email,
                gender: user.gender,
                registeringFor: user.registeringFor,
                role: user.role,
                membershipPlan: user.membershipPlan,
                menuAccess: user.menuAccess,
                isEmailVerified: user.isEmailVerified,
                isMobileVerified: user.isMobileVerified,
                status: user.status, // Added
            },
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const updateMyAccount = async (req, res) => {
    try {
        const fullName = String(req.body.fullName || "").trim();
        const mobile = String(req.body.mobile || "").trim();
        const gender = String(req.body.gender || "").trim();
        const registeringFor = String(req.body.registeringFor || "").trim();

        if (!fullName || !mobile || !gender || !registeringFor) {
            return res.status(400).json({
                success: false,
                message: "Name, phone, registering for and gender are required",
            });
        }

        if (fullName.length > 200) {
            return res.status(400).json({
                success: false,
                message: "Name must be 200 characters or less",
            });
        }

        if (!["Bride", "Groom"].includes(gender)) {
            return res.status(400).json({
                success: false,
                message: "Please select Bride or Groom",
            });
        }

        if (!["Self", "Son", "Daughter", "Brother", "Sister"].includes(registeringFor)) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid registering for option",
            });
        }

        const expectedGender = getExpectedGender(registeringFor);

        if (expectedGender && gender !== expectedGender) {
            return res.status(400).json({
                success: false,
                message: `${registeringFor} registration should be selected as ${expectedGender}`,
            });
        }

        const duplicateMobile = await User.findOne({
            _id: { $ne: req.user._id },
            mobile,
        });

        if (duplicateMobile) {
            return res.status(409).json({
                success: false,
                message: "An account already exists with this phone number",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                fullName,
                mobile,
                gender,
                registeringFor,
            },
            {
                new: true,
                runValidators: true,
            }
        ).select("-password");

        return res.json({
            success: true,
            message: "Account settings updated",
            user: buildUserResponse(user),
        });
    } catch (error) {
        console.error("ACCOUNT UPDATE ERROR:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An account already exists with this phone number",
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to update account settings",
        });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

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

        await sendOtpEmail(cleanEmail, otp);

        return res.json({
            success: true,
            message: "Password reset OTP sent to your email",
        });
    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({
                success: false,
                message: "Email, OTP, and new password are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanOtp = otp.toString().trim();

        console.log("RESET INPUT:", { cleanEmail, cleanOtp });

        const latestOtp = await Otp.findOne({
            type: "email",
            email: cleanEmail,
        }).sort({ createdAt: -1 });

        console.log("LATEST OTP IN DB:", latestOtp);


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

        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        otpDoc.isUsed = true;
        await otpDoc.save();

        user.password = password;
        await user.save();

        return res.json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
