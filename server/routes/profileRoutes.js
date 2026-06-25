import express from "express";
import multer from "multer";

import {
    createProfile,
    updateProfile,
    getProfiles,
    getProfileByUser,
    checkProfileViewAccess,
    searchProfiles,
    getProfileById,
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
    "/create",
    upload.single("profilePhoto"),
    createProfile
);

router.put(
    "/user/:userId",
    upload.single("profilePhoto"),
    updateProfile
);

// Order should be like this

router.get("/user/:userId", getProfileByUser);

router.get("/search", searchProfiles);

router.put("/users/:userId/profile-view", checkProfileViewAccess);

router.get("/", getProfiles);

router.get("/:id", getProfileById);



// comment this for now
// router.get("/:id", getProfileById);

export default router;