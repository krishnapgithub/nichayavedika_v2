
import express from "express";
import {
    createProfile,
    getProfiles,
    updateProfile,
} from "../controllers/profileController.js";

const router = express.Router();
router.post("/create", createProfile);
router.get("/", getProfiles);
router.put("/:id", updateProfile);
export default router;