import express from 'express';
import ApiSettingsController from '../controllers/apiSettingsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication and admin privileges
router.use(authMiddleware);

// CRUD routes
router.get('/', ApiSettingsController.getAllApiSettings);
router.get('/fal-ai', ApiSettingsController.getFalAISettings);
router.get('/open-ai', ApiSettingsController.getOpenAISettings);
router.put('/fal-ai', ApiSettingsController.updateFalAISettings);
router.put('/open-ai', ApiSettingsController.updateOpenAISettings);
router.get('/replicate', ApiSettingsController.getReplicateSettings);
router.put('/replicate', ApiSettingsController.updateReplicateSettings);
router.get('/anthropic', ApiSettingsController.getAnthropicSettings);
router.put('/anthropic', ApiSettingsController.updateAnthropicSettings);
router.get('/gemini', ApiSettingsController.getGeminiSettings);
router.put('/gemini', ApiSettingsController.updateGeminiSettings);
router.get('/stripe', ApiSettingsController.getStripeSettings);
router.put('/stripe', ApiSettingsController.updateStripeSettings);

export default router;
