import express from "express";
import {
    createPaymentRequest,
    createRazorpayOrder,
    getAdminPayments,
    getMyPayments,
    handleRazorpayWebhook,
    submitPaymentReference,
    updatePaymentStatus,
    verifyRazorpayPayment,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, createPaymentRequest);
router.post("/razorpay/order", protect, createRazorpayOrder);
router.post("/razorpay/verify", protect, verifyRazorpayPayment);
router.post("/razorpay/webhook", handleRazorpayWebhook);
router.get("/my", protect, getMyPayments);
router.put("/:id/reference", protect, submitPaymentReference);

router.get("/admin/all", protect, adminOnly, getAdminPayments);
router.put("/admin/:id/status", protect, adminOnly, updatePaymentStatus);

export default router;
