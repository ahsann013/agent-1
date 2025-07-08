import express from 'express';
import { 
    getAllServicePricing, 
    getServicePricingById, 
    createServicePricing, 
    updateServicePricing, 
    updateBatchServicePricing,
    deleteServicePricing,
    initializeDefaultPricing
} from '../controllers/servicePricingController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);
// Get all service pricing (public route - no auth required)
router.get('/', getAllServicePricing);

// Get service pricing by ID (public route - no auth required)
router.get('/:id', getServicePricingById);

// Routes below require admin access
// Initialize default pricing
router.post('/initialize', initializeDefaultPricing);

// Create new service pricing
router.post('/', createServicePricing);

// Update service pricing
router.put('/:id', updateServicePricing);

// Batch update service pricing
router.put('/batch/update', updateBatchServicePricing);

// Delete service pricing
router.delete('/:id', deleteServicePricing);

export default router; 