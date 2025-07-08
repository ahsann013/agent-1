import { SystemPrompt } from '../models/index.js';
import { Op } from 'sequelize';
class PromptController {
    static async getAllPrompts(req, res) {
        try {
            const prompts = await SystemPrompt.findAll({
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json(prompts);
        }
        catch (error) {
            console.error('Error fetching prompts:', error);
            res.status(500).json({ message: 'Failed to fetch prompts' });
        }
    }
    static async getActivePrompts(req, res) {
        try {
            const prompts = await SystemPrompt.findAll({
                where: { status: true },
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json(prompts);
        }
        catch (error) {
            console.error('Error fetching active prompts:', error);
            res.status(500).json({ message: 'Failed to fetch active prompts' });
        }
    }
    static async getPromptById(req, res) {
        try {
            const { id } = req.params;
            const prompt = await SystemPrompt.findByPk(id);
            if (!prompt) {
                return res.status(404).json({ message: 'Prompt not found' });
            }
            res.status(200).json(prompt);
        }
        catch (error) {
            console.error('Error fetching prompt:', error);
            res.status(500).json({ message: 'Failed to fetch prompt' });
        }
    }
    static async createPrompt(req, res) {
        try {
            const { name, prompt, status, category = 'General', isDefault = false } = req.body;
            if (!name || !prompt) {
                return res.status(400).json({ message: 'Name and prompt are required' });
            }
            const existingPrompt = await SystemPrompt.findOne({ where: { name } });
            if (existingPrompt) {
                return res.status(400).json({ message: 'A prompt with this name already exists' });
            }
            if (isDefault) {
                await SystemPrompt.update({ isDefault: false }, { where: { category, isDefault: true } });
            }
            const newPrompt = await SystemPrompt.create({
                name,
                prompt,
                status,
                category,
                isDefault
            });
            res.status(201).json(newPrompt);
        }
        catch (error) {
            console.error('Error creating prompt:', error);
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to create prompt' });
        }
    }
    static async updatePrompt(req, res) {
        try {
            const { id } = req.params;
            const { name, prompt, status, category, isDefault } = req.body;
            const existingPrompt = await SystemPrompt.findByPk(id);
            if (!existingPrompt) {
                return res.status(404).json({ message: 'Prompt not found' });
            }
            if (name && name !== existingPrompt.name) {
                const promptWithName = await SystemPrompt.findOne({ where: { name } });
                if (promptWithName) {
                    return res.status(400).json({ message: 'A prompt with this name already exists' });
                }
            }
            const targetCategory = category || existingPrompt.category;
            if (isDefault && (!existingPrompt.isDefault || targetCategory !== existingPrompt.category)) {
                await SystemPrompt.update({ isDefault: false }, {
                    where: {
                        category: targetCategory,
                        isDefault: true,
                        id: { [Op.ne]: id }
                    }
                });
            }
            const updates = {};
            if (name)
                updates.name = name;
            if (prompt)
                updates.prompt = prompt;
            if (status !== undefined)
                updates.status = status;
            if (category)
                updates.category = category;
            if (isDefault !== undefined)
                updates.isDefault = isDefault;
            await existingPrompt.update(updates);
            res.status(200).json(existingPrompt);
        }
        catch (error) {
            console.error('Error updating prompt:', error);
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to update prompt' });
        }
    }
    static async deletePrompt(req, res) {
        try {
            const { id } = req.params;
            const prompt = await SystemPrompt.findByPk(id);
            if (!prompt) {
                return res.status(404).json({ message: 'Prompt not found' });
            }
            await prompt.destroy();
            res.status(200).json({ message: 'Prompt deleted successfully' });
        }
        catch (error) {
            console.error('Error deleting prompt:', error);
            res.status(500).json({ message: 'Failed to delete prompt' });
        }
    }
    static async togglePromptStatus(req, res) {
        try {
            const { id } = req.params;
            const prompt = await SystemPrompt.findByPk(id);
            if (!prompt) {
                return res.status(404).json({ message: 'Prompt not found' });
            }
            const newStatus = !prompt.status;
            if (newStatus && prompt.isDefault) {
                await SystemPrompt.update({ isDefault: false }, {
                    where: {
                        category: prompt.category,
                        isDefault: true,
                        id: { [Op.ne]: id }
                    }
                });
            }
            await prompt.update({ status: newStatus });
            res.status(200).json(prompt);
        }
        catch (error) {
            console.error('Error toggling prompt status:', error);
            res.status(500).json({ message: 'Failed to toggle prompt status' });
        }
    }
}
export default PromptController;
