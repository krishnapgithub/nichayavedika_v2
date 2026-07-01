import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        profileNumber: {
            type: String,
            unique: true,
            sparse: true,
            index: true
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

        stylishPhotos: {
            type: [String],
            default: [],
        },

        showPhotosToMembers: {
            type: Boolean,
            default: true,
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "deactivated"],
            default: "pending",
        },

        reviewChanges: {
            type: [String],
            default: [],
        },

        pendingReviewData: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

        reviewSubmittedAt: Date,

        changeHistory: {
            type: [
                {
                    changedAt: {
                        type: Date,
                        default: Date.now,
                    },
                    changedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    source: {
                        type: String,
                        enum: ["user", "admin", "revert"],
                        default: "user",
                    },
                    changedFields: {
                        type: [String],
                        default: [],
                    },
                    previousData: {
                        type: mongoose.Schema.Types.Mixed,
                        default: {},
                    },
                    newData: {
                        type: mongoose.Schema.Types.Mixed,
                        default: {},
                    },
                    revertedAt: Date,
                    revertedBy: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                },
            ],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
