// ==========================================
// Imports
// ==========================================
import express from "express";
import {
    getPendingUsers,
    approveUser,
    rejectUser,
} from "../controllers/adminController.js";

// ==========================================
// Router
// ==========================================
const router = express.Router();

// ==========================================
// Admin Approval Routes
// ==========================================
router.get("/pending-users", getPendingUsers);
router.put("/users/:id/approve", approveUser);
router.put("/users/:id/reject", rejectUser);

export default router;