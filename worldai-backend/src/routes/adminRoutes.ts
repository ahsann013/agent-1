import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import UserController from "../controllers/userController.js";
import UsageController from "../controllers/usageController.js";
import StripeController from "../controllers/stripeController.js";
import adminController from "../controllers/adminController.js";
const router = express.Router();

// Get dashboard statistics
router.get("/dashboard/stats", authMiddleware, adminController.getDashboardStats);

// Get recent transactions
router.get("/dashboard/transactions", authMiddleware, adminController.getRecentTransactions);

export default router;
