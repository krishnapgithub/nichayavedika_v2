import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

import {
    createProfile,
    updateProfile,
    getProfiles,
    getProfileByUser,
    checkProfileViewAccess,
    searchProfiles,
    getProfileById,
    getPendingProfiles,
    updateProfileStatus,
} from "../controllers/profileController.js";



const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

{/*export const getPendingProfiles = async (req, res) => {
    try {
        const profiles = await Profile.find({
            status: "pending",
        }).populate("user", "fullName email mobile");

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
};*/}

const upload = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error("Only JPG, JPEG and PNG files are allowed"));
        }

        cb(null, true);
    },
});

router.post(
    "/create", protect,
    upload.single("profilePhoto"),
    createProfile
);

router.put(
    "/user/:userId", protect,
    upload.single("profilePhoto"),
    updateProfile
);

// Order should be like this

router.get("/user/:userId", protect, getProfileByUser);

router.get("/search", protect, searchProfiles);

router.put("/users/:userId/profile-view", protect, checkProfileViewAccess);

router.get("/", protect, getProfiles);

router.put("/admin/:profileId/status", protect, adminOnly, updateProfileStatus);

router.get("/:id", protect, getProfileById);

router.get("/admin/pending", protect, adminOnly, getPendingProfiles);




// comment this for now
// router.get("/:id", getProfileById);

export default router;