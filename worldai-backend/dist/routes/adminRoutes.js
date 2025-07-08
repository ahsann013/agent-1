import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminController from "../controllers/adminController.js";
const router = express.Router();
router.get("/dashboard/stats", authMiddleware, adminController.getDashboardStats);
router.get("/dashboard/transactions", authMiddleware, adminController.getRecentTransactions);
export default router;
