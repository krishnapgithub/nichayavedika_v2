import jwt from "jsonwebtoken";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

export const registerUser = async (req, res) => {
    try {
        const { fullName, mobile, email, password, gender, registeringFor } = req.body;

        if (!fullName || !mobile || !email || !password || !gender || !registeringFor) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanMobile = mobile.trim();

        const existingUser = await User.findOne({
            $or: [{ email: cleanEmail }, { mobile: cleanMobile }],
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email or mobile already registered",
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
                isEmailVerified: user.isEmailVerified,
                isMobileVerified: user.isMobileVerified,
            },
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);

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

        const isPasswordMatch = await bcrypt.compare(password, user.password);

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
                isEmailVerified: user.isEmailVerified,
                isMobileVerified: user.isMobileVerified,
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