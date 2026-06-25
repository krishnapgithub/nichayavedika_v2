import express from "express";
import {
    sendInterest,
    getSentInterests,
    getReceivedInterests,
    updateInterestStatus,
} from "../controllers/interestController.js";


const router = express.Router();

router.post("/send", sendInterest);
router.get("/sent/:userId", getSentInterests);
router.get("/received/:userId", getReceivedInterests);
router.put("/:id/status", updateInterestStatus);
export default router;