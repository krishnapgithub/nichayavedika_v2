// ==========================================
// Imports
// ==========================================
import User from "../models/User.js";
import { USER_STATUS } from "../config/appConstants.js";

// ==========================================
// Get Pending Users
// ==========================================
export const getPendingUsers = async (req, res) => {
    try {
        const users = await User.find({
            status: USER_STATUS.PENDING,
        }).select("-password");

        return res.json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        console.error("GET PENDING USERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ==========================================
// Approve User
// ==========================================
export const approveUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: USER_STATUS.APPROVED },
            { returnDocument: "after" }
        ).select("-password");

        return res.json({
            success: true,
            message: "User approved successfully",
            user,
        });
    } catch (error) {
        console.error("APPROVE USER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// ==========================================
// Reject User
// ==========================================
export const rejectUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status: USER_STATUS.REJECTED },
            { returnDocument: "after" }
        ).select("-password");

        return res.json({
            success: true,
            message: "User rejected successfully",
            user,
        });
    } catch (error) {
        console.error("REJECT USER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

