import mongoose from "mongoose";

const adminAuditLogSchema = new mongoose.Schema(
    {
        actor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        actorName: {
            type: String,
            default: "",
        },
        actorEmail: {
            type: String,
            default: "",
        },
        targetUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        targetName: {
            type: String,
            default: "",
        },
        targetEmail: {
            type: String,
            default: "",
        },
        action: {
            type: String,
            required: true,
        },
        changes: {
            type: [
                {
                    field: String,
                    from: mongoose.Schema.Types.Mixed,
                    to: mongoose.Schema.Types.Mixed,
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const AdminAuditLog = mongoose.model("AdminAuditLog", adminAuditLogSchema);

export default AdminAuditLog;
