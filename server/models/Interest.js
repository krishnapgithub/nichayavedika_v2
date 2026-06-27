import mongoose from "mongoose";

const interestSchema = new mongoose.Schema(


    {

        // User who sent the interest
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Profile receiving the interest
        receiverProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },

        // Interest status
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending",
        },

        fromUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        toProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Accepted", "Rejected"],
            default: "Pending",
        },
    },
    { timestamps: true }
);

// ==========================================
// Prevent duplicate interests
// Same user cannot send interest twice
// ==========================================
interestSchema.index(
    { sender: 1, receiverProfile: 1 },
    { unique: true }
);

export default mongoose.model("Interest", interestSchema);