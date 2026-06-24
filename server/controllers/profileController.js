import Profile from "../models/Profile.js";
import User from "../models/User.js";


export const checkProfileViewAccess = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

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

        if (user.profileViewsRemaining <= 0) {
            return res.json({
                success: false,
                allowed: false,
                message: "Free profile view limit reached. Please upgrade membership.",
            });
        }

        user.profileViewsRemaining -= 1;
        await user.save();

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

export const createProfile = async (req, res) => {
    try {
        const existingProfile = await Profile.findOne({ user: req.body.user });

        if (existingProfile) {
            return res.status(409).json({
                success: false,
                message: "Profile already exists for this user",
            });
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

export const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No photo uploaded",
            });
        }

        const photoUrl = `http://localhost:5000/uploads/${req.file.filename}`;

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
        const profile = await Profile.findOneAndUpdate(
            { user: req.params.userId },
            req.body,
            {
                returnOriginal: false,
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