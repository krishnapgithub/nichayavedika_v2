import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        durationDays: {
            type: Number,
            required: true,
            min: 0,
        },
        profileViews: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

const membershipPlanSettingSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            default: "default",
            unique: true,
            immutable: true,
        },
        plans: {
            free: {
                type: planSchema,
                required: true,
            },
            premium: {
                type: planSchema,
                required: true,
            },
            elite: {
                type: planSchema,
                required: true,
            },
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const MembershipPlanSetting = mongoose.model(
    "MembershipPlanSetting",
    membershipPlanSettingSchema
);

export default MembershipPlanSetting;
