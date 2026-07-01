import express from "express";
import { getMuhurthaluApiContent } from "../controllers/panchangController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/admin/muhurthalu", protect, adminOnly, getMuhurthaluApiContent);

export default router;
