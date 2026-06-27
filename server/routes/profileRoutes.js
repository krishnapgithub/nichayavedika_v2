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

// ==========================================
// Multer Configuration
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({
    storage,

    limits: {
        fileSize: 2 * 1024 * 1024, // 2 MB
    },

    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return cb(
                new Error("Only JPG, JPEG and PNG files are allowed")
            );
        }

        cb(null, true);
    },
});

// ==========================================
// Create Profile
// ==========================================
router.post(
    "/create",
    protect,
    upload.single("profilePhoto"),
    createProfile
);

// ==========================================
// Update Profile
// ==========================================
router.put(
    "/user/:userId",
    protect,
    upload.single("profilePhoto"),
    updateProfile
);

// ==========================================
// Get Profile By User
// ==========================================
router.get(
    "/user/:userId",
    protect,
    getProfileByUser
);

// ==========================================
// Search Profiles
// ==========================================
router.get(
    "/search",
    protect,
    searchProfiles
);

// ==========================================
// Free User Profile View Limit
// Premium/Admin = unlimited
// Free = max 5 profiles
// ==========================================
router.put(
    "/profile-view",
    protect,
    checkProfileViewAccess
);

// ==========================================
// Home Page Profiles (Public)
// ==========================================
router.get(
    "/",
    getProfiles
);

// ==========================================
// Admin Routes
// ==========================================
router.get(
    "/admin/pending",
    protect,
    adminOnly,
    getPendingProfiles
);

router.put(
    "/admin/:profileId/status",
    protect,
    adminOnly,
    updateProfileStatus
);

// ==========================================
// Single Profile Details
// ==========================================
router.get(
    "/:id",
    protect,
    getProfileById
);

export default router;