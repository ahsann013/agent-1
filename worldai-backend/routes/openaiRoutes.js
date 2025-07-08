// routes/authRoutes.js
import express from 'express';
import OpenaiController from '../controllers/openaiController.js';
import upload from '../middlewares/uploadMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
// Chat routes
router.post('/chat', OpenaiController.chat);
router.post('/chat-with-agent/:chatId', upload.single('file'), OpenaiController.function_calling);
router.get('/suggestions', OpenaiController.getSuggestions);
router.post('/get-chat-title', OpenaiController.getChatTitle)
router.post('/inpaint/:chatId', OpenaiController.inPainting);

export default router;