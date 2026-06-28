import Profile from "../models/Profile.js";
import User from "../models/User.js";



import { getSafeProfile } from "../utils/profilePrivacy.js";

const API_URL = process.env.API_URL || "http://localhost:5000";

export const getPendingProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find({ status: "pending" }).sort({
            createdAt: -1,
        });

        res.json({
            success: true,
            profiles,
        });
    } catch (error) {
        console.error("Get pending profiles error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending profiles",
        });
    }
};

export const getMyProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user._id,
        });

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        return res.json({
            success: true,
            profile,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const searchProfiles = async (req, res) => {
    try {

        const {
            gender,
            ageFrom,
            ageTo,
            caste,
            subCaste,
            education,
            occupation,
            city,
            state,
            page = 1,
            limit = 10,
        } = req.query;

        const filter = {
            status: "approved",
        };

        if (gender) filter.gender = gender;
        if (caste) filter.caste = new RegExp(caste, "i");
        if (subCaste) filter.subCaste = new RegExp(subCaste, "i");
        if (education) filter.education = new RegExp(education, "i");
        if (occupation) filter.occupation = new RegExp(occupation, "i");
        if (city) filter.city = new RegExp(city, "i");
        if (state) filter.state = new RegExp(state, "i");

        if (ageFrom || ageTo) {

            filter.age = {};

            if (ageFrom)
                filter.age.$gte = Number(ageFrom);

            if (ageTo)
                filter.age.$lte = Number(ageTo);
        }

        const skip =
            (Number(page) - 1) * Number(limit);

        const profiles = await Profile.find(filter)
            .populate("user", "fullName email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total =
            await Profile.countDocuments(filter);

        res.json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(
                total / Number(limit)
            ),
            profiles,
        });

    } catch (error) {

        console.error(
            "Search profiles error:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Search failed",
        });
    }
};

export const getProfileById = async (req, res) => {
    try {
        // Get profile first
        const profile = await Profile.findById(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        const currentUser = req.user;

        // Admin / Premium see full details
        if (
            currentUser?.role === "admin" ||
            currentUser?.role === "super_admin" ||
            currentUser?.membershipPlan !== "free"
        ) {
            return res.json({
                success: true,
                profile,
            });
        }

        // Free user sees limited details
        return res.json({
            success: true,
            profile: {
                _id: profile._id,
                fullName: profile.fullName
                    ? profile.fullName.charAt(0).toUpperCase() + "*****"
                    : "Profile Name Hidden",
                age: profile.age,
                gender: profile.gender,
                height: profile.height,
                education: profile.education,
                occupation: profile.occupation,
                city: profile.city,
                state: profile.state,
                caste: profile.caste,
                profilePhoto: profile.profilePhoto,
            },
        });

    } catch (error) {
        console.error("Get Profile By ID Error:", error);

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
}; 

// ==========================================
// Check whether user can view a full profile
// Free users -> 5 views only
// Premium/Admin -> unlimited
// ==========================================
export const checkProfileViewAccess = async (req, res) => {
    try {

        // Get logged-in user
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Admins have unlimited access
        if (user.role === "admin") {
            return res.json({
                success: true,
                canView: true,
            });
        }

        // Premium members have unlimited access
        if (user.membershipPlan === "premium") {
            return res.json({
                success: true,
                canView: true,
            });
        }

        // Free members can view only 5 profiles
        if (user.profileViewsUsed >= 5) {

            return res.status(403).json({
                success: false,
                canView: false,
                message:
                    "Free members can view only 5 profiles. Please upgrade to Premium.",
            });
        }

        // Increase profile view count
        user.profileViewsUsed += 1;

        await user.save();

        res.json({
            success: true,
            canView: true,
            remainingViews: 5 - user.profileViewsUsed,
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};

export const createProfile = async (req, res) => {
    try {
        const existingProfile = await Profile.findOne({ user: req.body.user });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Profile already exists for this user",
            });
        }

        if (req.file) {
            req.body.profilePhoto = req.file.filename;
        }

        const profile = await Profile.create(req.body);

        res.status(201).json({
            success: true,
            message: "Profile created successfully",
            profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getProfileByUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const profile = await Profile.findOne({ user: userId }).populate(
            "user",
            "fullName mobile email gender"
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.json({
            success: true,
            profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find({ status: "approved" }).sort({
            createdAt: -1,
        });

        Profile.find({ status: "approved" })
            .select(
                "fullName age gender education occupation city state caste profilePhoto"
            );

        res.json({
            success: true,
            profiles,
        });
    } catch (error) {
        console.error("Get profiles error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profiles",
        });
    }
};

export const ProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No photo uploaded",
            });
        }

        const photoUrl = `${API_URL}/uploads/${req.file.filename}`;

        const profile = await Profile.findOneAndUpdate(
            { user: req.params.userId },
            { profilePhoto: photoUrl },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.json({
            success: true,
            message: "Profile photo uploaded successfully",
            profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const updateProfile = async (req, res) => {
    try {
        if (req.file) {
            req.body.profilePhoto = req.file.filename;
        }

        const profile = await Profile.findOneAndUpdate(
            { user: req.params.userId },
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            profile,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateProfileStatus = async (req, res) => {
    try {
        const { profileId } = req.params;
        const { status } = req.body;

        if (!["approved", "rejected", "pending"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid profile status",
            });
        }

        const profile = await Profile.findByIdAndUpdate(
            profileId,
            { status },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found",
            });
        }

        return res.json({
            success: true,
            message: `Profile ${status} successfully`,
            profile,
        });
    } catch (error) {
        console.error("UPDATE PROFILE STATUS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};
