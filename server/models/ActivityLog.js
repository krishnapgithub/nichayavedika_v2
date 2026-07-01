import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        userName: {
            type: String,
            default: "Guest",
        },
        userEmail: {
            type: String,
            default: "",
        },
        role: {
            type: String,
            default: "guest",
        },
        method: {
            type: String,
            required: true,
        },
        path: {
            type: String,
            required: true,
        },
        statusCode: {
            type: Number,
            default: 0,
        },
        ipAddress: {
            type: String,
            default: "",
        },
        location: {
            country: {
                type: String,
                default: "",
            },
            region: {
                type: String,
                default: "",
            },
            city: {
                type: String,
                default: "",
            },
            timezone: {
                type: String,
                default: "",
            },
            language: {
                type: String,
                default: "",
            },
        },
        userAgent: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

export default ActivityLog;
