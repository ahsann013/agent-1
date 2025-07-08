import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import UserController from '../controllers/userController.js';
const router = express.Router();
router.use(authMiddleware);
router.get('/', UserController.getCredits);
export default router;
