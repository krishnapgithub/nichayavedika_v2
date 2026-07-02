import crypto from "crypto";
import axios from "axios";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

const PLAN_DETAILS = {
    premium: {
        label: "Premium",
        amount: 1999,
        durationDays: 90,
        profileViews: 20,
    },
    elite: {
        label: "Elite",
        amount: 4999,
        durationDays: 180,
        profileViews: 40,
    },
};

const createReceiptNumber = () =>
    `NV-PAY-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const getPlanDetails = (plan) => PLAN_DETAILS[String(plan || "").toLowerCase()];

const getRazorpayConfig = () => ({
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
});

const ensureRazorpayConfig = () => {
    const { keyId, keySecret } = getRazorpayConfig();
    return Boolean(keyId && keySecret);
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
    const { keySecret } = getRazorpayConfig();
    const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature);
    const actualBuffer = Buffer.from(signature || "");

    return (
        expectedBuffer.length === actualBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, actualBuffer)
    );
};

const activateMembership = async (payment, verifiedBy = null) => {
    const planDetails = getPlanDetails(payment.plan);
    const startDate = payment.membershipStartDate || new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setDate(expiryDate.getDate() + planDetails.durationDays);

    payment.status = "success";
    payment.membershipStartDate = startDate;
    payment.membershipExpiryDate = expiryDate;
    payment.verifiedAt = new Date();

    if (verifiedBy) {
        payment.verifiedBy = verifiedBy;
    }

    await User.findByIdAndUpdate(payment.user, {
        membershipPlan: payment.plan,
        membershipExpiresAt: expiryDate,
        profileViewsRemaining: planDetails.profileViews,
        profileViewsUsed: 0,
    });

    await payment.save();
};

export const createPaymentRequest = async (req, res) => {
    try {
        const planKey = String(req.body.plan || "").toLowerCase();
        const planDetails = getPlanDetails(planKey);

        if (!planDetails) {
            return res.status(400).json({
                success: false,
                message: "Please choose a valid membership plan.",
            });
        }

        const payment = await Payment.create({
            user: req.user._id,
            plan: planKey,
            amount: planDetails.amount,
            durationDays: planDetails.durationDays,
            receiptNumber: createReceiptNumber(),
        });

        res.status(201).json({
            success: true,
            message: "Payment request created successfully.",
            payment,
            planDetails,
        });
    } catch (error) {
        console.error("Create payment request error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to create payment request.",
        });
    }
};

export const createRazorpayOrder = async (req, res) => {
    try {
        if (!ensureRazorpayConfig()) {
            return res.status(503).json({
                success: false,
                message: "Razorpay is not configured yet. Please add Razorpay keys on the server.",
            });
        }

        const planKey = String(req.body.plan || "").toLowerCase();
        const planDetails = getPlanDetails(planKey);

        if (!planDetails) {
            return res.status(400).json({
                success: false,
                message: "Please choose a valid membership plan.",
            });
        }

        const receiptNumber = createReceiptNumber();
        const { keyId, keySecret } = getRazorpayConfig();

        const orderRes = await axios.post(
            "https://api.razorpay.com/v1/orders",
            {
                amount: planDetails.amount * 100,
                currency: "INR",
                receipt: receiptNumber,
                notes: {
                    userId: req.user._id.toString(),
                    plan: planKey,
                    receiptNumber,
                },
            },
            {
                auth: {
                    username: keyId,
                    password: keySecret,
                },
            }
        );

        const payment = await Payment.create({
            user: req.user._id,
            plan: planKey,
            amount: planDetails.amount,
            durationDays: planDetails.durationDays,
            receiptNumber,
            provider: "razorpay",
            razorpayOrderId: orderRes.data.id,
        });

        res.status(201).json({
            success: true,
            message: "Razorpay order created successfully.",
            keyId,
            order: orderRes.data,
            payment,
            planDetails,
        });
    } catch (error) {
        console.error("Create Razorpay order error:", error.response?.data || error);
        res.status(500).json({
            success: false,
            message: "Unable to create Razorpay order.",
        });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        if (!ensureRazorpayConfig()) {
            return res.status(503).json({
                success: false,
                message: "Razorpay is not configured yet.",
            });
        }

        const {
            paymentRecordId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (!paymentRecordId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: "Missing Razorpay verification details.",
            });
        }

        const isValid = verifyRazorpaySignature({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            signature: razorpay_signature,
        });

        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed.",
            });
        }

        const payment = await Payment.findOne({
            _id: paymentRecordId,
            user: req.user._id,
            razorpayOrderId: razorpay_order_id,
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment request not found.",
            });
        }

        payment.provider = "razorpay";
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.paymentReference = razorpay_payment_id;

        await activateMembership(payment, req.user._id);

        res.json({
            success: true,
            message: "Payment verified and membership activated.",
            payment,
        });
    } catch (error) {
        console.error("Verify Razorpay payment error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to verify Razorpay payment.",
        });
    }
};

export const handleRazorpayWebhook = async (req, res) => {
    try {
        const { webhookSecret } = getRazorpayConfig();

        if (!webhookSecret) {
            return res.status(503).json({ success: false });
        }

        const signature = req.headers["x-razorpay-signature"];
        const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(rawBody)
            .digest("hex");

        const expectedBuffer = Buffer.from(expectedSignature);
        const actualBuffer = Buffer.from(signature || "");
        const validSignature =
            expectedBuffer.length === actualBuffer.length &&
            crypto.timingSafeEqual(expectedBuffer, actualBuffer);

        if (!validSignature) {
            return res.status(400).json({ success: false });
        }

        const event = req.body?.event;
        const paymentEntity = req.body?.payload?.payment?.entity;
        const orderEntity = req.body?.payload?.order?.entity;
        const orderId = paymentEntity?.order_id || orderEntity?.id;

        if (!orderId) {
            return res.json({ success: true });
        }

        const payment = await Payment.findOne({ razorpayOrderId: orderId });

        if (!payment) {
            return res.json({ success: true });
        }

        if (["payment.captured", "order.paid"].includes(event)) {
            payment.provider = "razorpay";
            payment.razorpayPaymentId = paymentEntity?.id || payment.razorpayPaymentId;
            payment.paymentReference = paymentEntity?.id || payment.paymentReference;

            if (payment.status !== "success") {
                await activateMembership(payment);
            }
        }

        if (event === "payment.failed" && payment.status !== "success") {
            payment.status = "failed";
            payment.razorpayPaymentId = paymentEntity?.id || payment.razorpayPaymentId;
            payment.paymentReference = paymentEntity?.id || payment.paymentReference;
            await payment.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Razorpay webhook error:", error);
        res.status(500).json({ success: false });
    }
};

export const submitPaymentReference = async (req, res) => {
    try {
        const { paymentReference, notes } = req.body;

        if (!paymentReference || paymentReference.trim().length < 4) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid payment reference.",
            });
        }

        const payment = await Payment.findOne({
            _id: req.params.id,
            user: req.user._id,
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment request not found.",
            });
        }

        if (!["pending", "submitted"].includes(payment.status)) {
            return res.status(400).json({
                success: false,
                message: "This payment request can no longer be updated.",
            });
        }

        payment.status = "submitted";
        payment.provider = "manual";
        payment.paymentReference = paymentReference.trim();
        payment.notes = notes?.trim() || "";

        await payment.save();

        res.json({
            success: true,
            message: "Payment details submitted for admin verification.",
            payment,
        });
    } catch (error) {
        console.error("Submit payment reference error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to submit payment details.",
        });
    }
};

export const getMyPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user._id }).sort({
            createdAt: -1,
        });

        res.json({ success: true, payments });
    } catch (error) {
        console.error("Get my payments error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load payment history.",
        });
    }
};

export const getAdminPayments = async (req, res) => {
    try {
        const { status = "all" } = req.query;
        const filter = {};

        if (status !== "all") {
            filter.status = status;
        }

        const payments = await Payment.find(filter)
            .populate("user", "fullName email mobile membershipPlan membershipExpiresAt")
            .populate("verifiedBy", "fullName email")
            .sort({ createdAt: -1 });

        res.json({ success: true, payments });
    } catch (error) {
        console.error("Get admin payments error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to load payment requests.",
        });
    }
};

export const updatePaymentStatus = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;

        if (!["success", "failed", "cancelled"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Please choose a valid payment status.",
            });
        }

        const payment = await Payment.findById(req.params.id);

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: "Payment request not found.",
            });
        }

        payment.status = status;
        payment.verifiedBy = req.user._id;
        payment.verifiedAt = new Date();
        payment.adminNotes = adminNotes?.trim() || "";

        if (status === "success") {
            await activateMembership(payment, req.user._id);
        } else {
            await payment.save();
        }

        const updatedPayment = await Payment.findById(payment._id)
            .populate("user", "fullName email mobile membershipPlan membershipExpiresAt")
            .populate("verifiedBy", "fullName email");

        res.json({
            success: true,
            message:
                status === "success"
                    ? "Payment approved and membership activated."
                    : "Payment status updated.",
            payment: updatedPayment,
        });
    } catch (error) {
        console.error("Update payment status error:", error);
        res.status(500).json({
            success: false,
            message: "Unable to update payment status.",
        });
    }
};
