import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Profile from "../models/Profile.js";

const isSuperAdmin = (user) => user?.role === "super_admin";
const isPrivilegedUser = (user) => user?.role && user.role !== "user";
const canEditUserGender = (user) => ["admin", "super_admin"].includes(user?.role);

export const getAllUsers = async (req, res) => {
    try {
        const filter = isSuperAdmin(req.user)
            ? {}
            : { role: "user" };

        const users = await User.find(filter)
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
        const targetUser = await User.findById(id).select("-password");

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (String(req.user._id || req.user.id) === String(id) && req.body.isActive === false) {
            return res.status(400).json({
                success: false,
                message: "You cannot deactivate your own account",
            });
        }

        if (!isSuperAdmin(req.user)) {
            if (isPrivilegedUser(targetUser)) {
                return res.status(403).json({
                    success: false,
                    message: "Only Super Admin can manage admin accounts",
                });
            }

            const requestedFields = Object.keys(req.body || {});
            const allowedFields = ["isActive", "gender"];
            const hasRestrictedField = requestedFields.some((field) => !allowedFields.includes(field));

            if (hasRestrictedField) {
                return res.status(403).json({
                    success: false,
                    message: "Admin can only activate, deactivate, or update gender for regular users",
                });
            }
        }

        const updateData = {};

        if (isSuperAdmin(req.user) && req.body.fullName !== undefined) {
            const fullName = String(req.body.fullName || "").trim();

            if (!fullName) {
                return res.status(400).json({
                    success: false,
                    message: "Display name is required",
                });
            }

            if (fullName.length > 200) {
                return res.status(400).json({
                    success: false,
                    message: "Display name cannot exceed 200 characters",
                });
            }

            updateData.fullName = fullName;
        }

        if (isSuperAdmin(req.user) && req.body.email !== undefined) {
            const email = String(req.body.email || "").trim().toLowerCase();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address",
                });
            }

            const existingUser = await User.findOne({
                email,
                _id: { $ne: id },
            });

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "Another account already uses this email address",
                });
            }

            updateData.email = email;
        }

        if (canEditUserGender(req.user) && req.body.gender !== undefined) {
            const gender = String(req.body.gender || "").trim();

            if (!["Bride", "Groom"].includes(gender)) {
                return res.status(400).json({
                    success: false,
                    message: "Gender must be Bride or Groom",
                });
            }

            updateData.gender = gender;
        }

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

        console.log("UPDATED USER:", user?.email, user?.isActive);

        if (user && Object.prototype.hasOwnProperty.call(updateData, "gender")) {
            await Profile.findOneAndUpdate(
                { user: user._id },
                { gender: updateData.gender }
            );
        }

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

        const targetUser = await User.findById(id).select("-password");

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!isSuperAdmin(req.user) && isPrivilegedUser(targetUser)) {
            return res.status(403).json({
                success: false,
                message: "Only Super Admin can reset admin account passwords",
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
