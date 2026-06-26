// ==========================================
// Imports
// ==========================================
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import User from "../models/User.js";

dotenv.config();

// ==========================================
// Create Super Admin
// ==========================================
const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const existingAdmin = await User.findOne({
            email: "admin@admin.com",
        });

        if (existingAdmin) {
            console.log("Super Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash("welcome123", 10);

        await User.create({
            fullName: "System Administrator",
            mobile: "9999999999",
            email: "admin@admin.com",
            password: "hashedPassword",
            gender: "Groom",
            registeringFor: "Self",

            role: "super_admin",
            status: "approved",

            isEmailVerified: true,
            isMobileVerified: true,

            membershipPlan: "elite",
            profileViewsRemaining: 999999,
        });

        console.log("✅ Super Admin created successfully");
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createSuperAdmin();