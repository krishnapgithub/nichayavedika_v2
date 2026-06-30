import mongoose from "mongoose";

const pageContentSchema = new mongoose.Schema(
    {
        pageType: {
            type: String,
            enum: ["success", "events", "muhurthalu", "contact"],
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        subtitle: {
            type: String,
            trim: true,
            default: "",
        },
        metaLabel: {
            type: String,
            trim: true,
            default: "",
        },
        detailLines: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        sortOrder: {
            type: Number,
            default: 0,
        },
        expiresAt: {
            type: Date,
            default: null,
            index: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("PageContent", pageContentSchema);
