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

const args = process.argv.slice(2);

const getArgValue = (name) => {
    const prefix = `--${name}=`;
    const inlineArg = args.find((arg) => arg.startsWith(prefix));

    if (inlineArg) return inlineArg.slice(prefix.length).trim();

    const index = args.indexOf(`--${name}`);
    return index >= 0 ? args[index + 1]?.trim() || "" : "";
};

const hasFlag = (name) => args.includes(`--${name}`);

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);
const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const identifier = {
    email: getArgValue("email").toLowerCase(),
    mobile: getArgValue("mobile"),
    userId: getArgValue("userId"),
    profileId: getArgValue("profileId"),
    profileNumber: getArgValue("profileNumber"),
};

const confirmDelete = hasFlag("confirm");
const allowAdminDelete = hasFlag("allow-admin");

const deleteUserAndProfile = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing from server/.env");
    }

    if (!Object.values(identifier).some(Boolean)) {
        throw new Error(
            "Provide one identifier: --email, --mobile, --userId, --profileId, or --profileNumber"
        );
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);

    const userQuery = {};
    const profileQuery = {};

    if (identifier.email) userQuery.email = identifier.email;
    if (identifier.mobile) userQuery.mobile = identifier.mobile;
    if (identifier.userId) {
        if (!isValidObjectId(identifier.userId)) {
            throw new Error("--userId must be a valid MongoDB ObjectId");
        }

        userQuery._id = toObjectId(identifier.userId);
    }

    if (identifier.profileId) {
        if (!isValidObjectId(identifier.profileId)) {
            throw new Error("--profileId must be a valid MongoDB ObjectId");
        }

        profileQuery._id = toObjectId(identifier.profileId);
    }

    if (identifier.profileNumber) {
        profileQuery.profileNumber = identifier.profileNumber;
    }

    let user = Object.keys(userQuery).length > 0 ? await User.findOne(userQuery) : null;
    let profile = Object.keys(profileQuery).length > 0 ? await Profile.findOne(profileQuery) : null;

    if (!profile && user) {
        profile = await Profile.findOne({ user: user._id });
    }

    if (!user && profile?.user) {
        user = await User.findById(profile.user);
    }

    if (!user && !profile) {
        console.log("No matching user or profile found.");
        return;
    }

    if (user && ["admin", "super_admin", "oper_admin"].includes(user.role) && !allowAdminDelete) {
        throw new Error(
            `Refusing to delete ${user.role}. Re-run with --allow-admin only if this is intentional.`
        );
    }

    const userId = user?._id;
    const profileId = profile?._id;
    const email = user?.email || identifier.email;
    const mobile = user?.mobile || identifier.mobile;

    const filters = {
        interests: {
            $or: [
                ...(userId ? [{ sender: userId }, { fromUser: userId }] : []),
                ...(profileId ? [{ receiverProfile: profileId }, { toProfile: profileId }] : []),
            ],
        },
        payments: userId ? { user: userId } : null,
        otps: {
            $or: [
                ...(email ? [{ email }] : []),
                ...(mobile ? [{ mobile }] : []),
            ],
        },
        activityLogs: {
            $or: [
                ...(userId ? [{ user: userId }] : []),
                ...(email ? [{ userEmail: email }] : []),
            ],
        },
        adminAuditLogs: userId ? { targetUser: userId } : null,
    };

    const summary = {
        user: user
            ? `${user.fullName || "Unnamed"} <${user.email}> (${user._id})`
            : "not found",
        profile: profile
            ? `${profile.profileNumber || "No profile number"} (${profile._id})`
            : "not found",
        interests: filters.interests.$or.length
            ? await Interest.countDocuments(filters.interests)
            : 0,
        payments: filters.payments
            ? await Payment.countDocuments(filters.payments)
            : 0,
        otps: filters.otps.$or.length
            ? await Otp.countDocuments(filters.otps)
            : 0,
        activityLogs: filters.activityLogs.$or.length
            ? await ActivityLog.countDocuments(filters.activityLogs)
            : 0,
        adminAuditLogs: filters.adminAuditLogs
            ? await AdminAuditLog.countDocuments(filters.adminAuditLogs)
            : 0,
    };

    console.log("Delete preview:");
    console.table(summary);

    if (!confirmDelete) {
        console.log("Dry run only. Add --confirm to delete these records.");
        return;
    }

    const results = {};

    results.interests = filters.interests.$or.length
        ? await Interest.deleteMany(filters.interests)
        : { deletedCount: 0 };
    results.payments = filters.payments
        ? await Payment.deleteMany(filters.payments)
        : { deletedCount: 0 };
    results.otps = filters.otps.$or.length
        ? await Otp.deleteMany(filters.otps)
        : { deletedCount: 0 };
    results.activityLogs = filters.activityLogs.$or.length
        ? await ActivityLog.deleteMany(filters.activityLogs)
        : { deletedCount: 0 };
    results.adminAuditLogs = filters.adminAuditLogs
        ? await AdminAuditLog.deleteMany(filters.adminAuditLogs)
        : { deletedCount: 0 };
    results.profile = profileId
        ? await Profile.deleteOne({ _id: profileId })
        : { deletedCount: 0 };
    results.user = userId
        ? await User.deleteOne({ _id: userId })
        : { deletedCount: 0 };

    console.log("Deleted records:");
    console.table(
        Object.fromEntries(
            Object.entries(results).map(([key, result]) => [key, result.deletedCount || 0])
        )
    );
};

deleteUserAndProfile()
    .catch((error) => {
        console.error(`Delete failed: ${error.message}`);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
