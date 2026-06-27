import express from "express";
import {
    getAllUsers,
    updateUserAccess,
    resetUserPassword,
} from "../controllers/adminUserController.js";

import {
    protect,
    superAdminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
    "/users",
    protect,
    superAdminOnly,
    getAllUsers
);

router.put(
    "/users/:id/access",
    protect,
    superAdminOnly,
    updateUserAccess
);

router.put(
    "/users/:id/reset-password",
    protect,
    superAdminOnly,
    resetUserPassword
);

export default router;