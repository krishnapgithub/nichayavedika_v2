import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        membershipPlan: {
            type: String,
            enum: ["free", "premium", "elite"],
            default: "free",
        },

        profileUnlockLimit: {
            type: Number,
            default: 5,
        },

        unlockedProfiles: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
        }],

        /*membershipExpiry: {
            type: Date,
        },*/

        membershipStartDate: Date,
        membershipExpiryDate: Date,


        interestsRemaining: {
            type: Number,
            default: 3,
        },

        profileViewsRemaining: {
            type: Number,
            default: 5,
        },

        profileUnlocksRemaining: {
            type: Number,
            default: 5,
        },

        fullName: String,
        gender: {
            type: String,
            enum: ["Bride", "Groom"],
        },
        dateOfBirth: Date,
        age: Number,
        height: String,

        maritalStatus: {
            type: String,
            default: "Never Married",
        },

        motherTongue: {
            type: String,
            default: "Telugu",
        },
        religion: {
            type: String,
            default: "Hindu",
        },
        caste: String,
        subCaste: String,
        gothram: String,

        education: String,
        occupation: String,
        annualIncome: String,

        city: String,
        state: String,
        country: {
            type: String,
            default: "India",
        },

        familyDetails: String,
        contactPreference: {
            type: String,
            default: "Phone",
        },

        aboutMe: String,

        preferredAgeFrom: Number,
        preferredAgeTo: Number,
        preferredCaste: String,
        preferredLocation: String,

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