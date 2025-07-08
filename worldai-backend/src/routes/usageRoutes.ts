// ... existing code ...
import UsageController from '../controllers/usageController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import express from 'express';


const router = express.Router();
// Apply authentication middleware to all chat routes
router.use(authMiddleware);

// Usage routes
router.get('/', UsageController.getAllUsage);
router.get('/:id', UsageController.getUsageById);
router.get('/:userId/usage', UsageController.getUsageByUserId);
// ... existing code ...

export default router;
