
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const admins = [
    {
        fullName: "Admin One",
        email: "admin1@nichayavedika.com",
        mobile: "9000000001",
        password: "Admin123",
        role: "admin",
        registeringFor: "Self",
        gender: "Bride",
    },
    {
        fullName: "Admin Two",
        email: "admin2@nichayavedika.com",
        mobile: "9000000002",
        password: "Admin123",
        role: "admin",
        registeringFor: "Self",
        gender: "Bride",
    },
    {
        fullName: "Admin Three",
        email: "admin3@nichayavedika.com",
        mobile: "9000000003",
        password: "Admin123",
        role: "admin",
        registeringFor: "Self",
        gender: "Bride",
    },

    {
        fullName: "Admin 4",
        email: "admin@nv.com",
        mobile: "9000000001",
        password: "Admin123",
        role: "admin",
        registeringFor: "Self",
        gender: "Bride",
    }
];



const resetAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");

        await User.deleteMany({
            role: { $ne: "super_admin" },
        });

        console.log("Deleted all users except super_admin");

        for (const admin of admins) {
            const hashedPassword = await bcrypt.hash(admin.password, 10);

            await User.create({
                ...admin,
                password: hashedPassword,
                isEmailVerified: true,
                isMobileVerified: true,
                status: "approved",
                membershipPlan: "elite",
            });
        }

        console.log("Admin users created successfully");
        process.exit(0);
    } catch (error) {
        console.error("Reset failed:", error);
        process.exit(1);
    }
};

resetAdmins();