// routes/authRoutes.js
import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import UserController from '../controllers/userController.js';

const router = express.Router();

router.use(authMiddleware);
// Chat routes
router.get('/', UserController.getCredits);


export default router;