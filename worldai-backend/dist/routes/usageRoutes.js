import UsageController from '../controllers/usageController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import express from 'express';
const router = express.Router();
router.use(authMiddleware);
router.get('/', UsageController.getAllUsage);
router.get('/:id', UsageController.getUsageById);
router.get('/:userId/usage', UsageController.getUsageByUserId);
export default router;
