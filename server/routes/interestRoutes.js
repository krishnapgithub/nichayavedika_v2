import express from "express";
import { sendInterest } from "../controllers/interestController.js";

const router = express.Router();

router.post("/send", sendInterest);

export default router;