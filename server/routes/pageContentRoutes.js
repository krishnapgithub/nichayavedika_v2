import express from "express";
import {
    createPageContent,
    deletePageContent,
    getAllPageContent,
    getPublicPageContent,
    updatePageContent,
} from "../controllers/pageContentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/public/:pageType", getPublicPageContent);
router.get("/admin/all", protect, adminOnly, getAllPageContent);
router.post("/admin", protect, adminOnly, createPageContent);
router.put("/admin/:id", protect, adminOnly, updatePageContent);
router.delete("/admin/:id", protect, adminOnly, deletePageContent);

export default router;
