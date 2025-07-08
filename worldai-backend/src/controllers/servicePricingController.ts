import { ServicePricing, User, sequelize } from '../models/index.js';

/**
 * Get all service pricing
 */
export const getAllServicePricing = async (req, res) => {
    try {
        const servicePricing = await ServicePricing.findAll({
            order: [['id', 'ASC']]
        });
        return res.status(200).json({
            success: true,
            data: servicePricing
        });
    } catch (error) {
        console.error('Error fetching service pricing:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch service pricing',
            error: error.message
        });
    }
};

/**
 * Get service pricing by ID
 */
export const getServicePricingById = async (req, res) => {
    try {
        const { id } = req.params;
        const servicePricing = await ServicePricing.findByPk(id);

        if (!servicePricing) {
            return res.status(404).json({
                success: false,
                message: 'Service pricing not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: servicePricing
        });
    } catch (error) {
        console.error('Error fetching service pricing:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch service pricing',
            error: error.message
        });
    }
};

/**
 * Create new service pricing
 */
export const createServicePricing = async (req, res) => {
    try {
        const { name, description, price, unit, serviceIdentifier, categoryName } = req.body;

        // Check if service pricing with same name or identifier already exists
        const existingPricing = await ServicePricing.findOne({
            where: { name }
        });

        if (existingPricing) {
            return res.status(400).json({
                success: false,
                message: 'Service pricing with this name or identifier already exists'
            });
        }

        const newServicePricing = await ServicePricing.create({
            name,
            description,
            price,
            unit,
            serviceIdentifier,
            categoryName,
        });

        return res.status(201).json({
            success: true,
            message: 'Service pricing created successfully',
            data: newServicePricing
        });
    } catch (error) {
        console.error('Error creating service pricing:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create service pricing',
            error: error.message
        });
    }
};

/**
 * Update service pricing
 */
export const updateServicePricing = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, unit, isActive, categoryName } = req.body;

        const servicePricing = await ServicePricing.findByPk(id);

        if (!servicePricing) {
            return res.status(404).json({
                success: false,
                message: 'Service pricing not found'
            });
        }

        // Check if name is being changed and if it conflicts with existing names
        if (name && name !== servicePricing.name) {
            const existingWithName = await ServicePricing.findOne({
                where: { name }
            });

            if (existingWithName) {
                return res.status(400).json({
                    success: false,
                    message: 'Service pricing with this name already exists'
                });
            }
        }

        // Update fields
        await servicePricing.update({
            name: name || servicePricing.name,
            description: description !== undefined ? description : servicePricing.description,
            price: price !== undefined ? price : servicePricing.price,
            unit: unit || servicePricing.unit,
            isActive: isActive !== undefined ? isActive : servicePricing.isActive,
            categoryName: categoryName !== undefined ? categoryName : servicePricing.categoryName,
            lastUpdatedBy: req.user.id
        });

        return res.status(200).json({
            success: true,
            message: 'Service pricing updated successfully',
            data: servicePricing
        });
    } catch (error) {
        console.error('Error updating service pricing:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update service pricing',
            error: error.message
        });
    }
};

/**
 * Update multiple service pricing items at once
 */
export const updateBatchServicePricing = async (req, res) => {
    try {
        const { pricingItems } = req.body;

        if (!Array.isArray(pricingItems) || pricingItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or empty pricing items array'
            });
        }

        const results = [];
        const errors = [];

        // Process each pricing item
        for (const item of pricingItems) {
            try {
                if (!item.id) {
                    errors.push({ item, error: 'Missing ID' });
                    continue;
                }

                const servicePricing = await ServicePricing.findByPk(item.id);

                if (!servicePricing) {
                    errors.push({ item, error: 'Service pricing not found' });
                    continue;
                }

                // Update the pricing
                await servicePricing.update({
                    price: item.price !== undefined ? item.price : servicePricing.price,
                    lastUpdatedBy: req.user.id
                });

                results.push(servicePricing);
            } catch (error) {
                errors.push({ item, error: error.message });
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Batch service pricing update completed',
            data: {
                updated: results,
                errors: errors
            }
        });
    } catch (error) {
        console.error('Error updating batch service pricing:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update batch service pricing',
            error: error.message
        });
    }
};

/**
 * Delete service pricing
 */
export const deleteServicePricing = async (req, res) => {
    try {
        const { id } = req.params;

        const servicePricing = await ServicePricing.findByPk(id);

        if (!servicePricing) {
            return res.status(404).json({
                success: false,
                message: 'Service pricing not found'
            });
        }

        await servicePricing.destroy();

        return res.status(200).json({
            success: true,
            message: 'Service pricing deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting service pricing:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete service pricing',
            error: error.message
        });
    }
};

/**
 * Initialize default service pricing
 * This can be used to seed the database with default pricing
 */
export const initializeDefaultPricing = async (req, res) => {
    try {
        const defaultPricing = [
            {
                name: "generate_image",
                description: "Generate images from text prompts",
                price: 10,
                unit: "per image",
                categoryName: "image",
                serviceIdentifier: "generate_image"
            },
            {
                name: "generate_video",
                description: "Generate videos from text prompts",
                price: 20,
                unit: "per second",
                categoryName: "video",
                serviceIdentifier: "generate_video"
            },
            {
                name: "image_to_video",
                description: "Convert images to videos with motion",
                price: 20,
                unit: "per second",
                categoryName: "video",
                serviceIdentifier: "image_to_video"
            },
            {
                name: "image_to_3d",
                description: "Convert images to 3D models",
                price: 50,
                unit: "per run",
                categoryName: "3d",
                serviceIdentifier: "image_to_3d"
            },
            {
                name: "generate_music",
                description: "Generate music from text prompts",
                price: 15,
                unit: "per run",
                categoryName: "audio",
                serviceIdentifier: "generate_music"
            },
            {
                name: "voice_cloner",
                description: "Clone voices and generate speech",
                price: 2,
                unit: "per run",
                categoryName: "voice",
                serviceIdentifier: "voice_cloner"
            },
            {
                name: "image_to_text",
                description: "Analyze images and provide descriptions",
                price: 2,
                unit: "per run",
                categoryName: "vision",
                serviceIdentifier: "image_to_text"
            },
            {
                name: "generate_code",
                description: "Generate code from text prompts",
                price: 5,
                unit: "per run",
                categoryName: "code",
                serviceIdentifier: "generate_code"
            },
            {
                name: "product_photography",
                description: "Generate product photography images",
                price: 10,
                unit: "per image",
                categoryName: "image",
                serviceIdentifier: "product_photography"
            },
            {
                name: "speech_to_text",
                description: "Convert speech to text",
                price: 2,
                unit: "per run",
                categoryName: "voice",
                serviceIdentifier: "speech_to_text"
            },
            {
                name: "image_to_image",
                description: "Generate an image or modify an existing image using Google's Gemini model. Can be used for editing requests or image editing.",
                price: 2,
                unit: "per run",
                categoryName: "image",
                serviceIdentifier: "image_to_image"
            },
            {
                name: "inpaint_image",
                description: "Generate an image or modify an existing image using Google's Gemini model. Can be used for editing requests or image editing.",
                price: 10,
                unit: "per run",
                categoryName: "image",
                serviceIdentifier: "inpaint_image"
            }
        ];

        // Find admin user to set as last updater
        const adminUser = await User.findOne({
            where: { role: 'admin' }
        });

        const lastUpdatedBy = adminUser ? adminUser.id : null;

        // Create or update each pricing item
        const results = [];
        for (const item of defaultPricing) {
            const [pricing, created] = await ServicePricing.findOrCreate({
                where: { serviceIdentifier: item.serviceIdentifier },
                defaults: {
                    ...item,
                    lastUpdatedBy
                }
            });

            if (!created) {
                // Update existing item
                await pricing.update({
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    unit: item.unit,
                    categoryName: item.categoryName,
                    serviceIdentifier: item.serviceIdentifier,
                    lastUpdatedBy
                });
            }

            results.push(pricing);
        }

        return res.status(200).json({
            success: true,
            message: 'Default service pricing initialized successfully',
            data: results
        });
    } catch (error) {
        console.error('Error initializing default service pricing:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to initialize default service pricing',
            error: error.message
        });
    }
}; 