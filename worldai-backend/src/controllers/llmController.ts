import { AiModel } from '../models/index.js';
import { Op } from 'sequelize';

class LLMController {
    // Get all models
    static async getAllModels(req, res) {
        try {
            const models = await AiModel.findAll();
            res.status(200).json(models);
        } catch (error) {
            console.error('Error fetching models:', error);
            res.status(500).json({ message: 'Error fetching AI models' });
        }
    }

    // Get model by ID
    static async getModelById(req, res) {
        const { id } = req.params;
        try {
            const model = await AiModel.findByPk(id);

            if (!model) {
                return res.status(404).json({ message: 'AI Model not found' });
            }

            res.status(200).json(model);
        } catch (error) {
            console.error('Error fetching model:', error);
            res.status(500).json({ message: 'Error fetching AI model' });
        }
    }

    // Create new model
    static async createModel(req, res) {
        try {
            const { name, type, isDefault = false, isPremium = false, provider } = req.body;

            // Check if model with the same name already exists
            const existingModel = await AiModel.findOne({
                where: { name }
            });

            if (existingModel) {
                return res.status(409).json({
                    message: 'AI Model with this name already exists',
                    existingModel
                });
            }

            // Check if this is the first model of its type
            const existingModelsOfType = await AiModel.findAll({
                where: { type }
            });

            // If it's the first model of its type, set it as default
            const shouldBeDefault = existingModelsOfType.length === 0 || isDefault;

            const model = await AiModel.create({
                name,
                type,
                isDefault: shouldBeDefault,
                isPremium,
                provider
            });

            res.status(201).json({
                message: 'AI Model created successfully',
                model
            });
        } catch (error) {
            console.error('Error creating model:', error);
            res.status(500).json({
                message: 'Error creating AI model',
                error: error.message
            });
        }
    }

    // Update model
    static async updateModel(req, res) {
        const { id } = req.params;
        try {
            const model = await AiModel.findByPk(id);
            if (!model) {
                return res.status(404).json({ message: 'AI Model not found' });
            }

            // If changing name, check for duplicates
            if (req.body.name && req.body.name !== model.name) {
                const existingModel = await AiModel.findOne({
                    where: { name: req.body.name }
                });

                if (existingModel) {
                    return res.status(400).json({ message: 'Model with this name already exists' });
                }
            }

            await model.update(req.body);

            const updatedModel = await AiModel.findByPk(id);

            res.status(200).json({
                message: 'AI Model updated successfully',
                model: updatedModel
            });
        } catch (error) {
            console.error('Error updating model:', error);
            res.status(500).json({
                message: 'Error updating AI model',
                error: error.message
            });
        }
    }

    // Set default model for a type
    static async setDefaultModel(req, res) {
        const { id } = req.params;
        try {
            const model = await AiModel.findByPk(id);
            if (!model) {
                return res.status(404).json({ message: 'AI Model not found' });
            }

            // Check if there are other models of the same type
            const otherModels = await AiModel.findAll({
                where: {
                    type: model.type,
                    id: { [Op.ne]: id } // Exclude current model
                }
            });

            if (otherModels.length === 0) {
                return res.status(400).json({
                    message: 'Cannot unset default status - this is the only model of its type'
                });
            }

            // Find and unset any existing default model of the same type
            await AiModel.update(
                { isDefault: false },
                {
                    where: {
                        type: model.type,
                        isDefault: true
                    }
                }
            );

            // Set this model as default
            await model.update({ isDefault: true });

            const updatedModel = await AiModel.findByPk(id);

            res.status(200).json({
                message: 'Default AI Model set successfully',
                model: updatedModel
            });
        } catch (error) {
            console.error('Error setting default model:', error);
            res.status(500).json({
                message: 'Error setting default AI model',
                error: error.message
            });
        }
    }

    // Delete model
    static async deleteModel(req, res) {
        const { id } = req.params;
        try {
            const model = await AiModel.findByPk(id);
            if (!model) {
                return res.status(404).json({ message: 'AI Model not found' });
            }

            await model.destroy();
            res.status(200).json({ message: 'AI Model deleted successfully' });
        } catch (error) {
            console.error('Error deleting model:', error);
            res.status(500).json({ message: 'Error deleting AI model' });
        }
    }

    // Toggle model status
    static async toggleModelStatus(req, res) {
        try {
            const { id } = req.params;
            
            const model = await AiModel.findByPk(id);
            if (!model) {
                return res.status(404).json({ message: 'AI Model not found' });
            }

            // Toggle between 'active' and 'inactive'
            const newStatus = model.status === 'active' ? 'inactive' : 'active';

            // If setting to inactive and it's the only default model of its type, prevent the change
            if (newStatus === 'inactive' && model.isDefault) {
                const otherActiveDefaultModel = await AiModel.findOne({
                    where: {
                        type: model.type,
                        id: { [Op.ne]: id },
                        status: 'active'
                    }
                });

         
            }

            await model.update({ status: newStatus });
            res.status(200).json(model);
        } catch (error) {
            console.error('Error toggling model status:', error);
            res.status(500).json({ message: 'Failed to toggle model status' });
        }
    }
}

export default LLMController; 