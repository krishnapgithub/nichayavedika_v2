export const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: "Not authorized",
        });
    }

    if (!["admin", "oper_admin", "super_admin"].includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Admin access only",
        });
    }

    next();
};
