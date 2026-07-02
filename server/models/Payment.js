import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        plan: {
            type: String,
            enum: ["premium", "elite"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            default: "INR",
        },
        durationDays: {
            type: Number,
            required: true,
        },
        profileViews: {
            type: Number,
            required: true,
            default: 0,
        },
        status: {
            type: String,
            enum: ["pending", "submitted", "success", "failed", "cancelled"],
            default: "pending",
        },
        provider: {
            type: String,
            default: "manual",
        },
        paymentReference: {
            type: String,
            trim: true,
        },
        razorpayOrderId: {
            type: String,
            index: true,
            sparse: true,
        },
        razorpayPaymentId: {
            type: String,
            index: true,
            sparse: true,
        },
        razorpaySignature: {
            type: String,
            trim: true,
        },
        notes: {
            type: String,
            trim: true,
        },
        receiptNumber: {
            type: String,
            unique: true,
            sparse: true,
        },
        membershipStartDate: Date,
        membershipExpiryDate: Date,
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        verifiedAt: Date,
        adminNotes: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
