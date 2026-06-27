

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import path from "path";

import interestRoutes from "./routes/interestRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";

dotenv.config({ path: "./.env" });

//console.log("ENV CHECK:", process.env.MONGO_URI);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/profiles", profileRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/interests", interestRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin", adminUserRoutes);

import mongoose from "mongoose";



app.get("/", (req, res) => {
    res.send("NichayaVedika API is running");
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "Server is healthy",
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});