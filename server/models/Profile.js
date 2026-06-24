import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        dateOfBirth: Date,
        age: Number,
        height: String,

        education: String,
        occupation: String,
        annualIncome: String,

        caste: String,
        subCaste: String,
        gothram: String,

        city: String,
        state: String,
        country: {
            type: String,
            default: "India",
        },

        aboutMe: String,

        profilePhoto: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;