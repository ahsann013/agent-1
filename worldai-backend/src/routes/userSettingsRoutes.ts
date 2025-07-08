import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import SettingController from '../controllers/settingController.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authMiddleware);

// CRUD routes
router.get('/', SettingController.getUserSettings);
router.put('/', SettingController.updateUserSettings);




export default router;
