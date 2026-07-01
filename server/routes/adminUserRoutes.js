import express from "express";
import {
    getActivityLogs,
    getAdminAuditLogs,
    getAllUsers,
    updateUserAccess,
    resetUserPassword,
} from "../controllers/adminUserController.js";

import {
    adminUserManagerOnly,
    protect,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/users",
    protect,
    adminUserManagerOnly,
    getAllUsers
);

router.get(
    "/activity-logs",
    protect,
    adminUserManagerOnly,
    getActivityLogs
);

router.get(
    "/audit-logs",
    protect,
    adminUserManagerOnly,
    getAdminAuditLogs
);

router.put(
    "/users/:id/access",
    protect,
    adminUserManagerOnly,
    updateUserAccess
);

router.put(
    "/users/:id/reset-password",
    protect,
    adminUserManagerOnly,
    resetUserPassword
);

export default router;
