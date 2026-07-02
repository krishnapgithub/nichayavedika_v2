import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Profile from "../models/Profile.js";
import AdminAuditLog from "../models/AdminAuditLog.js";
import ActivityLog from "../models/ActivityLog.js";

const isSuperAdmin = (user) => user?.role === "super_admin";
const isPrivilegedUser = (user) => user?.role && user.role !== "user";
const canEditUserGender = (user) => ["admin", "super_admin"].includes(user?.role);
const allowedMenuAccess = [
    "dashboard",
    "profile",
    "sentInterests",
    "receivedInterests",
    "adminProfiles",
    "adminPayments",
    "adminContent",
    "adminUsers",
];
const PROFILE_VIEW_LIMITS = {
    free: 5,
    premium: 20,
    elite: 40,
};

const getProfileViewLimit = (membershipPlan = "free") =>
    PROFILE_VIEW_LIMITS[String(membershipPlan || "free").toLowerCase()] ?? PROFILE_VIEW_LIMITS.free;

const formatAuditValue = (value) => {
    if (Array.isArray(value)) return value.join(", ");
    if (value === undefined || value === null || value === "") return "-";
    return value;
};

const createAdminAuditLog = async ({ req, targetUser, action, changes = [] }) => {
    await AdminAuditLog.create({
        actor: req.user._id,
        actorName: req.user.fullName || "",
        actorEmail: req.user.email || "",
        targetUser: targetUser._id,
        targetName: targetUser.fullName || "",
        targetEmail: targetUser.email || "",
        action,
        changes: changes.map((change) => ({
            field: change.field,
            from: formatAuditValue(change.from),
            to: formatAuditValue(change.to),
        })),
    });
};

const getDateQuery = (query) => {
    const filter = {};
    const createdAt = {};

    if (query.from) {
        const fromDate = new Date(`${query.from}T00:00:00.000Z`);

        if (!Number.isNaN(fromDate.getTime())) {
            createdAt.$gte = fromDate;
        }
    }

    if (query.to) {
        const toDate = new Date(`${query.to}T23:59:59.999Z`);

        if (!Number.isNaN(toDate.getTime())) {
            createdAt.$lte = toDate;
        }
    }

    if (Object.keys(createdAt).length > 0) {
        filter.createdAt = createdAt;
    }

    return filter;
};

export const getAllUsers = async (req, res) => {
    try {
        const filter = isSuperAdmin(req.user)
            ? {}
            : { role: "user" };
        const userSelect = isSuperAdmin(req.user)
            ? "-password"
            : "-password -profileViewsRemaining -profileViewsUsed -viewedProfileIds";

        const users = await User.find(filter)
            .select(userSelect)
            .sort({ createdAt: -1 });

        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
        });
    }
};

export const getAdminAuditLogs = async (req, res) => {
    try {
        if (!isSuperAdmin(req.user)) {
            return res.status(403).json({
                success: false,
                message: "Super Admin access only",
            });
        }

        const filter = getDateQuery(req.query);
        const [logs, totalCount] = await Promise.all([
            AdminAuditLog.find(filter)
                .sort({ createdAt: -1 })
                .limit(100)
                .lean(),
            AdminAuditLog.countDocuments(filter),
        ]);

        res.json({ success: true, logs, totalCount });
    } catch (error) {
        console.error("Fetch admin logs error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch admin logs",
        });
    }
};

export const getActivityLogs = async (req, res) => {
    try {
        if (!isSuperAdmin(req.user)) {
            return res.status(403).json({
                success: false,
                message: "Super Admin access only",
            });
        }

        const filter = getDateQuery(req.query);
        const [logs, totalCount, guestCount, loggedInCount] = await Promise.all([
            ActivityLog.find(filter)
                .sort({ createdAt: -1 })
                .limit(200)
                .lean(),
            ActivityLog.countDocuments(filter),
            ActivityLog.countDocuments({
                ...filter,
                role: "guest",
            }),
            ActivityLog.countDocuments({
                ...filter,
                role: { $ne: "guest" },
            }),
        ]);

        res.json({
            success: true,
            logs,
            totalCount,
            guestCount,
            loggedInCount,
        });
    } catch (error) {
        console.error("Fetch activity logs error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch activity logs",
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
            const usedViews = Math.max(
                targetUser.profileViewsUsed || 0,
                targetUser.viewedProfileIds?.length || 0
            );
            updateData.profileViewsRemaining = Math.max(
                getProfileViewLimit(req.body.membershipPlan) - usedViews,
                0
            );
        }

        if (isSuperAdmin(req.user) && req.body.menuAccess !== undefined) {
            if (!Array.isArray(req.body.menuAccess)) {
                return res.status(400).json({
                    success: false,
                    message: "Menu access must be a list",
                });
            }

            updateData.menuAccess = req.body.menuAccess.filter((item, index, list) =>
                allowedMenuAccess.includes(item) && list.indexOf(item) === index
            );
        }

        if (req.body.isActive !== undefined) {
            updateData.isActive = req.body.isActive;
        }

        const changes = Object.entries(updateData)
            .filter(([field, value]) => JSON.stringify(targetUser[field]) !== JSON.stringify(value))
            .map(([field, value]) => ({
                field,
                from: targetUser[field],
                to: value,
            }));

        const user = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { returnDocument: "after" }
        ).select(
            isSuperAdmin(req.user)
                ? "-password"
                : "-password -profileViewsRemaining -profileViewsUsed -viewedProfileIds"
        );

        if (user && Object.prototype.hasOwnProperty.call(updateData, "gender")) {
            await Profile.findOneAndUpdate(
                { user: user._id },
                { gender: updateData.gender }
            );
        }

        if (user && changes.length > 0) {
            await createAdminAuditLog({
                req,
                targetUser: user,
                action: "Updated user",
                changes,
            });
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

        await createAdminAuditLog({
            req,
            targetUser,
            action: "Reset password",
            changes: [
                {
                    field: "password",
                    from: "existing password",
                    to: "new password",
                },
            ],
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
