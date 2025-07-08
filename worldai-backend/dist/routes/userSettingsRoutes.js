import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import SettingController from '../controllers/settingController.js';
const router = express.Router();
router.use(authMiddleware);
router.get('/', SettingController.getUserSettings);
router.put('/', SettingController.updateUserSettings);
export default router;
