import jwt from "jsonwebtoken";
import ActivityLog from "../models/ActivityLog.js";
import User from "../models/User.js";

const ignoredPaths = [
    "/api/health",
    "/api/admin/activity-logs",
    "/api/admin/audit-logs",
];

const getToken = (req) => {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) return "";

    const token = header.split(" ")[1];

    return token && token !== "null" && token !== "undefined" ? token : "";
};

const firstHeaderValue = (req, names) => {
    for (const name of names) {
        const value = req.headers[name];

        if (value) {
            return Array.isArray(value) ? value[0] : value;
        }
    }

    return "";
};

const cleanLocationValue = (value) => {
    if (!value) return "";

    try {
        return decodeURIComponent(String(value)).trim();
    } catch {
        return String(value).trim();
    }
};

const getRequestLocation = (req) => ({
    country: cleanLocationValue(firstHeaderValue(req, [
        "cf-ipcountry",
        "x-vercel-ip-country",
        "cloudfront-viewer-country",
    ])),
    region: cleanLocationValue(firstHeaderValue(req, [
        "x-vercel-ip-country-region",
        "x-appengine-region",
    ])),
    city: cleanLocationValue(firstHeaderValue(req, [
        "x-vercel-ip-city",
        "x-appengine-city",
    ])),
    timezone: cleanLocationValue(firstHeaderValue(req, [
        "x-client-timezone",
        "x-vercel-ip-timezone",
    ])),
    language: cleanLocationValue(firstHeaderValue(req, [
        "x-client-language",
        "accept-language",
    ])).split(",")[0],
});

export const activityLogger = (req, res, next) => {
    if (!req.originalUrl.startsWith("/api") || ignoredPaths.includes(req.path)) {
        return next();
    }

    res.on("finish", async () => {
        try {
            const token = getToken(req);
            let user = null;

            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    user = await User.findById(decoded.id).select("fullName email role").lean();
                } catch {
                    user = null;
                }
            }

            await ActivityLog.create({
                user: user?._id || null,
                userName: user?.fullName || "Guest",
                userEmail: user?.email || "",
                role: user?.role || "guest",
                method: req.method,
                path: req.originalUrl,
                statusCode: res.statusCode,
                ipAddress: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || "",
                location: getRequestLocation(req),
                userAgent: req.headers["user-agent"] || "",
            });
        } catch (error) {
            console.error("Activity log error:", error.message);
        }
    });

    next();
};
