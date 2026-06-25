import Profile from "../models/Profile.js";
import User from "../models/User.js";

export const getPendingProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find({ status: "pending" })
            .populate("user", "fullName email mobile");

        return res.json({
            success: true,
            profiles,
        });
    } catch (error) {
        console.error("GET PENDING PROFILES ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
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

        //const filter = {
          //  status: "approved",
        //};

        const filter = {};

        if (gender) filter.gender = gender;
        if (caste) filter.caste = new RegExp(caste, "i");
        if (subCaste) filter.subCaste = new RegExp(subCaste, "i");
        if (education) filter.education = new RegExp(education, "i");
        if (occupation) filter.occupation = new RegExp(occupation, "i");
        if (city) filter.city = new RegExp(city, "i");
        if (state) filter.state = new RegExp(state, "i");

        if (ageFrom || ageTo) {
            filter.age = {};
            if (ageFrom) filter.age.$gte = Number(ageFrom);
            if (ageTo) filter.age.$lte = Number(ageTo);
        }

        const skip = (Number(page) - 1) * Number(limit);

        const profiles = await Profile.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Profile.countDocuments(filter);

        res.json({
            success: true,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            profiles,
        });
    } catch (error) {
        console.error("Search profiles error:", error);

        res.status(500).json({
            success: false,
            message: "Search failed",
        });
    }
};

export const getProfileById = async (req, res) => {
    try {
        const profile = await Profile.findById(req.params.id);

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
        console.error("Get profile by id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch profile",
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
        const profiles = await Profile.find().populate(
            "user",
            "fullName mobile email gender"
        );

        res.json({
            success: true,
            count: profiles.length,
            profiles,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};



export const 
ProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No photo uploaded",
            });
        }

        const photoUrl = `${ API_URL }/uploads/${req.file.filename}`;

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


export const checkProfileViewAccess = async (req, res) => {
    try {
        const { userId } = req.params;

        //const user = await User.findById(userId);
        const user = await Profile.findOne({ user: userId });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.membershipPlan !== "free") {
            return res.json({
                success: true,
                allowed: true,
                message: "Premium user allowed",
            });
        }

        if (user.membershipPlan === "premium" || user.membershipPlan === "elite") {
            return res.json({
                success: true,
                allowed: true,
                message: `${user.membershipPlan} member`,
            });
        }

        if (user.profileViewsRemaining <= 0) {
            return res.json({
                success: false,
                allowed: false,
                message: "Free profile view limit reached. Please upgrade membership.",
            });
        }

        const { profileId } = req.body;

        // Elite users
        if (user.membershipPlan === "elite") {
            return res.json({
                success: true,
                allowed: true,
                message: "Elite member",
            });
        }

        // Already unlocked?
        if (user.unlockedProfiles.includes(profileId)) {
            return res.json({
                success: true,
                allowed: true,
                message: "Already unlocked",
            });
        }

        // No unlocks left?
        if (user.profileUnlocksRemaining <= 0) {
            return res.json({
                success: false,
                allowed: false,
                message: "Unlock limit reached. Upgrade your membership.",
            });
        }

        // Unlock new profile
        user.unlockedProfiles.push(profileId);
        user.profileUnlockLimit --;

        await user.save();

        return res.json({
            success: true,
            allowed: true,
            remainingUnlocks: user.profileUnlocksRemaining,
        });

        res.json({
            success: true,
            allowed: true,
            remainingViews: user.profileViewsRemaining,
            message: `${user.profileViewsRemaining} profile views remaining`,
        });

    } catch (error) {
        console.error("Profile view access error:", error);

        res.status(500).json({
            success: false,
            allowed: false,
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

