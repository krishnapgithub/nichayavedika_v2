
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

        console.log("TOKEN:", token);
        console.log("JWT_SECRET:", process.env.JWT_SECRET);

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("DECODED:", decoded);

        req.user = await User.findById(decoded.id).select("-password");

        console.log("USER:", req.user?.email);

        next();

    } catch (error) {
        console.error("AUTH ERROR:", error);

        return res.status(401).json({
            success: false,
            message: "Session expired. Please login again."
        });
    }
};
