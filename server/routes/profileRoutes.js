import express from "express";
import fs from "fs";
import multer from "multer";
import path from "path";

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
    createAdminAssistedProfile,
    updateProfileStatus,
} from "../controllers/profileController.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ==========================================
// Multer Configuration
// ==========================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
        cb(null, `${Date.now()}-${safeName}`);
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
    searchProfiles
);

// ==========================================
// Free User Profile View Limit
// Premium/Admin = unlimited
// Free = max 5 profiles
// ==========================================
router.post(
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

router.post(
    "/admin/assisted-create",
    protect,
    adminOnly,
    upload.fields([
        { name: "profilePhoto", maxCount: 1 },
        { name: "stylishPhoto0", maxCount: 1 },
        { name: "stylishPhoto1", maxCount: 1 },
    ]),
    createAdminAssistedProfile
);

router.put(
    "/admin/:profileId/status",
    protect,
    adminOnly,
    upload.fields([
        { name: "profilePhoto", maxCount: 1 },
        { name: "stylishPhoto0", maxCount: 1 },
        { name: "stylishPhoto1", maxCount: 1 },
    ]),
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
