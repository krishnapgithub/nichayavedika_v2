import Profile from "../models/Profile.js";

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

export const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const profile = await Profile.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

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