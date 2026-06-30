import express from "express";
import {
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
