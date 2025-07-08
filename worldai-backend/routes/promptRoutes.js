import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import PromptController from '../controllers/promptController.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authMiddleware);

// CRUD routes
router.get('/', PromptController.getAllPrompts);
router.get('/:id', PromptController.getPromptById);
router.post('/', PromptController.createPrompt);
router.put('/:id', PromptController.updatePrompt);
router.delete('/:id', PromptController.deletePrompt);



export default router;
