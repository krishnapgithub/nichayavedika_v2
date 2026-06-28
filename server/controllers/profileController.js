import Profile from "../models/Profile.js";
import User from "../models/User.js";
import Counter from "../models/Counter.js";

import { getSafeProfile } from "../utils/profilePrivacy.js";

const getUploadedPhotoPath = (file) => (file ? `uploads/${file.filename}` : "");

export const getPendingProfiles = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const currentPage = Math.max(Number(page) || 1, 1);
        const pageLimit = Math.max(Number(limit) || 10, 1);
        const filter = {
            status: "pending",
        };

        if (search.trim()) {
            filter.profileNumber = new RegExp(search.trim(), "i");
        }

        const skip = (currentPage - 1) * pageLimit;
        const [profiles, total] = await Promise.all([
            Profile.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageLimit),
            Profile.countDocuments(filter),
        ]);

        res.json({
            success: true,
            profiles,
            total,
            page: currentPage,
            totalPages: Math.ceil(total / pageLimit) || 1,
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
            profileNumber,
            search,
            page = 1,
            limit = 10,
        } = req.query;

        const filter = {
            $and: [
                {
                    status: "approved",
                },
            ],
        };

        if (gender) {
            const normalizedGender = gender.trim().toLowerCase();
            const genderPattern =
                normalizedGender === "groom"
                    ? "^\\s*(groom|male)\\s*$"
                    : normalizedGender === "bride"
                        ? "^\\s*(bride|female)\\s*$"
                        : `^\\s*${gender.trim()}\\s*$`;

            filter.$and.push({
                gender: new RegExp(genderPattern, "i"),
            });
        }
        if (caste) filter.caste = new RegExp(caste, "i");
        if (subCaste) filter.subCaste = new RegExp(subCaste, "i");
        if (education) filter.education = new RegExp(education, "i");
        if (occupation) filter.occupation = new RegExp(occupation, "i");
        if (city) filter.city = new RegExp(city, "i");
        if (state) filter.state = new RegExp(state, "i");
        if (profileNumber) filter.profileNumber = new RegExp(profileNumber, "i");

        if (search?.trim()?.length >= 3) {
            const searchRegex = new RegExp(search.trim(), "i");

            filter.$and.push({
                $or: [
                    { profileNumber: searchRegex },
                    { fullName: searchRegex },
                    { caste: searchRegex },
                    { city: searchRegex },
                    { education: searchRegex },
                    { occupation: searchRegex },
                ],
            });
        }

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
            .select(
                "profileNumber fullName age gender height education occupation city state caste subCaste profilePhoto aboutMe status"
            )
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
        const isOwnProfile =
            profile.user?.toString() === currentUser?._id?.toString() ||
            profile.user?.toString() === currentUser?.id?.toString();
        const isAdmin =
            currentUser?.role === "admin" || currentUser?.role === "super_admin";
        const isPaidMember = ["premium", "elite"].includes(
            currentUser?.membershipPlan
        );

        // Admin / Premium see full details
        if (isOwnProfile || isAdmin || isPaidMember) {
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
        const userId = req.user?._id || req.user?.id || req.body.user;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Please login again.",
            });
        }

        const profileData = {
            ...req.body,
            user: userId,
        };

        if (req.file) {
            profileData.profilePhoto = getUploadedPhotoPath(req.file);
        }

        const existingProfile = await Profile.findOne({ user: userId });

        if (existingProfile) {
            delete profileData.profileNumber;
            profileData.status = "pending";

            const updatedProfile = await Profile.findOneAndUpdate(
                { user: userId },
                profileData,
                {
                    new: true,
                    runValidators: true,
                }
            );

            return res.status(200).json({
                success: true,
                message: "Your profile updates have been submitted and are under admin review. Once approved, your profile will be visible in search again.",
                profile: updatedProfile,
            });
        }

        const counter = await Counter.findOneAndUpdate(
            { _id: "profileNumber" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        const profileNumber = `PN${String(counter.seq).padStart(6, "0")}`;

        const profile = await Profile.create({
            ...profileData,
            profileNumber,
        });

        return res.status(201).json({
            success: true,
            message: "Your profile has been submitted and is under admin review. Once approved, your profile will be activated and visible in search.",
            profile,
        });
    } catch (error) {
        console.error("Create/Update Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to save profile",
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
        const profiles = await Profile.find({ status: "approved" })
            .select(
                "profileNumber fullName age gender education occupation city state caste profilePhoto"
            )
            .sort({
                createdAt: -1,
            });

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

        const photoPath = getUploadedPhotoPath(req.file);

        const profile = await Profile.findOneAndUpdate(
            { user: req.params.userId },
            { profilePhoto: photoPath },
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
            req.body.profilePhoto = getUploadedPhotoPath(req.file);
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
