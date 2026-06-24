
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import bcrypt from "bcryptjs";




export const registerUser = async (req, res) => {
    try {
        const { fullName, mobile, email, password, gender, registeringFor } = req.body;

        if (!fullName || !mobile || !password || !gender || !registeringFor) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        const existingMobile = await User.findOne({ mobile });

        if (existingMobile) {
            return res.status(409).json({
                success: false,
                message: "Mobile number already registered",
            });
        }

        if (email) {
            const existingEmail = await User.findOne({ email });

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: "Email already registered",
                });
            }
        }

        const user = await User.create({
            fullName,
            mobile,
            email,
            password,
            gender,
            registeringFor,
            role: "user",
            membershipPlan: "free",
        });

        console.log("NEW USER CREATED:", user);
        console.log("COLLECTION:", user.collection.name);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user._id,
                fullName: user.fullName,
                mobile: user.mobile,
                email: user.email,
                gender: user.gender,
                registeringFor: user.registeringFor,
                role: user.role,
                membershipPlan: user.membershipPlan,
                isMobileVerified: user.isMobileVerified,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
export const sendOtp = async (req, res) => {
    try {
        const { mobile } = req.body;

        if (!mobile) {
            return res.status(400).json({
                success: false,
                message: "Mobile number is required",
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await Otp.create({
            mobile,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        console.log("DEV OTP:", otp);

        res.json({
            success: true,
            message: "OTP sent successfully",
            devOtp: otp,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const verifyOtp = async (req, res) => {
    try {

        const { mobile, otp } = req.body;

               

        const otpRecord = await Otp.findOne({
            mobile,
            otp,
            isUsed: false,
            expiresAt: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP",
            });
        }

        

        const otpCount = await Otp.countDocuments();
        console.log("OTP COUNT:", otpCount);


        otpRecord.isUsed = true;
        await otpRecord.save();

        console.log("VERIFY OTP REQUEST:", {
            mobile,
            otp,
        });

        await User.findOneAndUpdate(
            { mobile },
            { isMobileVerified: true }
        );

        res.json({
            success: true,
            message: "OTP verified successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { mobile, password } = req.body;

        if (!mobile || !password) {
            return res.status(400).json({
                success: false,
                message: "Mobile and password are required",
            });
        }

        const user = await User.findOne({ mobile });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid mobile or password",
            });
        }

        if (!user.isMobileVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify OTP before login",
            });
        }

        res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                mobile: user.mobile,
                email: user.email,
                gender: user.gender,
                registeringFor: user.registeringFor,
                role: user.role,
                membershipPlan: user.membershipPlan,
                isMobileVerified: user.isMobileVerified,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};