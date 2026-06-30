import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided. Please login again.",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please login again.",
            });
        }

        next();
    } catch (error) {
        console.error("AUTH ERROR:", error);

        return res.status(401).json({
            success: false,
            message: "Session expired. Please login again.",
        });
    }
};

export const optionalProtect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : "";

        if (!token || token === "null" || token === "undefined") {
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        return next();
    } catch {
        return next();
    }
};



export const superAdminOnly = (req, res, next) => {
    if (req.user?.role !== "super_admin") {
        return res.status(403).json({
            success: false,
            message: "Super Admin access only",
        });
    }

    next();
};

export const adminUserManagerOnly = (req, res, next) => {
    if (!["admin", "super_admin"].includes(req.user?.role)) {
        return res.status(403).json({
            success: false,
            message: "Admin access only",
        });
    }

    next();
};

export const adminOnly = (req, res, next) => {
    if (!["admin", "super_admin"].includes(req.user?.role)) {
        return res.status(403).json({
            success: false,
            message: "Admin access only",
        });
    }

    next();
};
