import express from "express";
import multer from "multer";



import {
    createProfile,
    getProfiles,
    updateProfile,
    getProfileByUser,
    uploadProfilePhoto,
    checkProfileViewAccess
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

const upload = multer({ storage });

router.post("/create", createProfile);

router.get("/user/:userId", getProfileByUser);
router.put("/user/:userId", updateProfile);

router.put(
    "/user/:userId/photo",
    upload.single("profilePhoto"),
    uploadProfilePhoto
);

// 5 profile view restriction
router.put("/users/:userId/profile-view", checkProfileViewAccess);

router.get("/", getProfiles);

// comment this for now
// router.get("/:id", getProfileById);


export default router;