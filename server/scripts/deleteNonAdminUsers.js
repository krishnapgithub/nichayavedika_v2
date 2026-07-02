import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/User.js";
import Profile from "../models/Profile.js";
import Interest from "../models/Interest.js";
import Payment from "../models/Payment.js";
import Otp from "../models/Otp.js";
import ActivityLog from "../models/ActivityLog.js";
import AdminAuditLog from "../models/AdminAuditLog.js";

dotenv.config();

const PRESERVED_ROLES = ["admin", "super_admin", "oper_admin"];
const args = process.argv.slice(2);
const confirmDelete = args.includes("--confirm");

const countWithFilter = async (Model, filter) => {
    if (!filter) return 0;
    if (Array.isArray(filter.$or) && filter.$or.length === 0) return 0;

    return Model.countDocuments(filter);
};

const deleteWithFilter = async (Model, filter) => {
    if (!filter) return { deletedCount: 0 };
    if (Array.isArray(filter.$or) && filter.$or.length === 0) return { deletedCount: 0 };

    return Model.deleteMany(filter);
};

const deleteNonAdminUsers = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing from server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
    console.log(`Preserving roles: ${PRESERVED_ROLES.join(", ")}`);

    const usersToDelete = await User.find({
        role: {
            $nin: PRESERVED_ROLES,
        },
    }).select("_id fullName email mobile role");

    const userIds = usersToDelete.map((user) => user._id);
    const emails = usersToDelete.map((user) => user.email).filter(Boolean);
    const mobiles = usersToDelete.map((user) => user.mobile).filter(Boolean);

    const profilesToDelete = await Profile.find({
        user: {
            $in: userIds,
        },
    }).select("_id profileNumber user");

    const profileIds = profilesToDelete.map((profile) => profile._id);

    const filters = {
        interests: {
            $or: [
                { sender: { $in: userIds } },
                { fromUser: { $in: userIds } },
                { receiverProfile: { $in: profileIds } },
                { toProfile: { $in: profileIds } },
            ],
        },
        payments: {
            user: {
                $in: userIds,
            },
        },
        otps: {
            $or: [
                { email: { $in: emails } },
                { mobile: { $in: mobiles } },
            ],
        },
        activityLogs: {
            $or: [
                { user: { $in: userIds } },
                { userEmail: { $in: emails } },
            ],
        },
        adminAuditLogs: {
            $or: [
                { actor: { $in: userIds } },
                { targetUser: { $in: userIds } },
            ],
        },
        profiles: {
            _id: {
                $in: profileIds,
            },
        },
        users: {
            _id: {
                $in: userIds,
            },
        },
    };

    const summary = {
        usersToDelete: userIds.length,
        profilesToDelete: profileIds.length,
        preservedUsers: await User.countDocuments({ role: { $in: PRESERVED_ROLES } }),
        interests: await countWithFilter(Interest, filters.interests),
        payments: await countWithFilter(Payment, filters.payments),
        otps: await countWithFilter(Otp, filters.otps),
        activityLogs: await countWithFilter(ActivityLog, filters.activityLogs),
        adminAuditLogs: await countWithFilter(AdminAuditLog, filters.adminAuditLogs),
        profileUnlockReferences: profileIds.length
            ? await Profile.countDocuments({ unlockedProfiles: { $in: profileIds } })
            : 0,
    };

    console.log("Bulk delete preview:");
    console.table(summary);

    if (usersToDelete.length > 0) {
        console.log("Sample users to delete:");
        console.table(
            usersToDelete.slice(0, 10).map((user) => ({
                id: String(user._id),
                fullName: user.fullName,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
            }))
        );
    }

    if (!confirmDelete) {
        console.log("Dry run only. Re-run with --confirm to delete non-admin users and linked records.");
        return;
    }

    if (userIds.length === 0) {
        console.log("No non-admin users found. Nothing deleted.");
        return;
    }

    const results = {};

    results.interests = await deleteWithFilter(Interest, filters.interests);
    results.payments = await deleteWithFilter(Payment, filters.payments);
    results.otps = await deleteWithFilter(Otp, filters.otps);
    results.activityLogs = await deleteWithFilter(ActivityLog, filters.activityLogs);
    results.adminAuditLogs = await deleteWithFilter(AdminAuditLog, filters.adminAuditLogs);
    results.profileUnlockReferences = profileIds.length
        ? await Profile.updateMany(
            { unlockedProfiles: { $in: profileIds } },
            { $pull: { unlockedProfiles: { $in: profileIds } } }
        )
        : { modifiedCount: 0 };
    results.profiles = await deleteWithFilter(Profile, filters.profiles);
    results.users = await deleteWithFilter(User, filters.users);

    console.log("Deleted records:");
    console.table({
        interests: results.interests.deletedCount || 0,
        payments: results.payments.deletedCount || 0,
        otps: results.otps.deletedCount || 0,
        activityLogs: results.activityLogs.deletedCount || 0,
        adminAuditLogs: results.adminAuditLogs.deletedCount || 0,
        profileUnlockReferencesUpdated: results.profileUnlockReferences.modifiedCount || 0,
        profiles: results.profiles.deletedCount || 0,
        users: results.users.deletedCount || 0,
    });
};

deleteNonAdminUsers()
    .catch((error) => {
        console.error(`Bulk delete failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
