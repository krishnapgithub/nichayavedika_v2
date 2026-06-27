import bcrypt from "bcryptjs";
import User from "../models/User.js";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 });

        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};

export const updateUserAccess = async (req, res) => {
    try {
        const { id } = req.params;

        const updateData = {};

        if (req.body.role !== undefined) {
            updateData.role = req.body.role;
        }

        if (req.body.status !== undefined) {
            updateData.status = req.body.status;
        }

        if (req.body.membershipPlan !== undefined) {
            updateData.membershipPlan = req.body.membershipPlan;
        }

        if (req.body.isActive !== undefined) {
            updateData.isActive = req.body.isActive;
        }

        console.log("UPDATE USER ID:", id);
        console.log("REQUEST BODY:", req.body);
        console.log("UPDATE DATA:", updateData);

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { returnDocument: "after" }
        ).select("-password");

        console.log("UPDATED USER:", user.email, user.isActive);

        res.json({
            success: true,
            message: "User updated successfully",
            user,
        });
    } catch (error) {
        console.error("Update user error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update user",
        });
    }
};

export const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.findByIdAndUpdate(id, {
            password: hashedPassword,
        });

        res.json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to reset password",
        });
    }
};