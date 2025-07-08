import { ApiSetting } from '../models/index.js';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
class ApiSettingsController {
    static async getAllApiSettings(req, res) {
        try {
            const settings = await ApiSetting.findAll({
                attributes: ['id', 'serviceName', 'isActive']
            });
            res.status(200).json(settings);
        }
        catch (error) {
            console.error('Error fetching API settings:', error);
            res.status(500).json({ message: 'Error fetching API settings' });
        }
    }
    static async getFalAISettings(req, res) {
        try {
            const setting = await ApiSetting.findOne({
                where: { serviceName: 'Fal' }
            });
            if (!setting) {
                return res.status(404).json({ message: 'Fal AI settings not found' });
            }
            res.status(200).json({ apiKey: setting.apiKey });
        }
        catch (error) {
            console.error('Error fetching Fal AI settings:', error);
            res.status(500).json({ message: 'Error fetching Fal AI settings' });
        }
    }
    static async getOpenAISettings(req, res) {
        try {
            const settings = await ApiSetting.findOne({
                where: { serviceName: 'Openai' }
            });
            const openai = new OpenAI({ apiKey: settings.apiKey });
            const models = await openai.models.list();
            const setting = await ApiSetting.findOne({
                where: { serviceName: 'Openai' }
            });
            const selectedModel = setting.model;
            if (!setting) {
                return res.status(404).json({ message: 'OpenAI settings not found' });
            }
            res.status(200).json({ apiKey: setting.apiKey, systemPrompt: setting.systemPrompt, models: models, selectedModel });
        }
        catch (error) {
            console.error('Error fetching OpenAI settings:', error);
            res.status(500).json({ message: 'Error fetching OpenAI settings' });
        }
    }
    static async getFalAISettings(req, res) {
        try {
            const setting = await ApiSetting.findOne({
                where: { serviceName: 'Fal' }
            });
            if (!setting) {
                return res.status(404).json({ message: 'Fal AI settings not found' });
            }
            res.status(200).json({ apiKey: setting.apiKey });
        }
        catch (error) {
            console.error('Error fetching Fal AI settings:', error);
            res.status(500).json({ message: 'Error fetching Fal AI settings' });
        }
    }
    static async getReplicateSettings(req, res) {
        try {
            const setting = await ApiSetting.findOne({
                where: { serviceName: 'Replicate' }
            });
            if (!setting) {
                return res.status(404).json({ message: 'Fal AI settings not found' });
            }
            res.status(200).json({ apiKey: setting.apiKey });
        }
        catch (error) {
            console.error('Error fetching Fal AI settings:', error);
            res.status(500).json({ message: 'Error fetching Fal AI settings' });
        }
    }
    static async updateFalAISettings(req, res) {
        try {
            const { apiKey } = req.body;
            let setting = await ApiSetting.findOne({
                where: { serviceName: 'Fal' }
            });
            if (setting) {
                await setting.update({ apiKey });
            }
            else {
                setting = await ApiSetting.create({
                    serviceName: 'Fal',
                    apiKey,
                    isActive: true
                });
            }
            res.status(200).json({ message: 'Fal AI settings updated successfully' });
        }
        catch (error) {
            console.error('Error updating Fal AI settings:', error);
            res.status(500).json({ message: 'Error updating Fal AI settings' });
        }
    }
    static async updateReplicateSettings(req, res) {
        try {
            const { apiKey } = req.body;
            let setting = await ApiSetting.findOne({
                where: { serviceName: 'Replicate' }
            });
            if (setting) {
                await setting.update({ apiKey });
            }
            else {
                setting = await ApiSetting.create({
                    serviceName: 'Replicate',
                    apiKey,
                    isActive: true
                });
            }
            res.status(200).json({ message: 'Replicate settings updated successfully' });
        }
        catch (error) {
            console.error('Error updating Replicate settings:', error);
            res.status(500).json({ message: 'Error updating Replicate settings' });
        }
    }
    static async updateOpenAISettings(req, res) {
        try {
            const { apiKey, systemPrompt, model } = req.body;
            let setting = await ApiSetting.findOne({
                where: { serviceName: 'Openai' }
            });
            if (setting) {
                await setting.update({ apiKey, systemPrompt, model });
            }
            else {
                setting = await ApiSetting.create({
                    serviceName: 'Openai',
                    apiKey,
                    systemPrompt,
                    model,
                    isActive: true
                });
            }
            res.status(200).json({ message: 'OpenAI settings updated successfully' });
        }
        catch (error) {
            console.error('Error updating OpenAI settings:', error);
            res.status(500).json({ message: 'Error updating OpenAI settings' });
        }
    }
    static async getAnthropicSettings(req, res) {
        try {
            const setting = await ApiSetting.findOne({
                where: { serviceName: 'Anthropic' }
            });
            if (!setting) {
                return res.status(404).json({ message: 'Anthropic settings not found' });
            }
            const anthropic = new Anthropic({ apiKey: setting.apiKey });
            const models = await anthropic.models.list({
                limit: 20,
            });
            res.status(200).json({
                apiKey: setting.apiKey,
                models: models.data,
                selectedModel: setting.model
            });
        }
        catch (error) {
            console.error('Error fetching Anthropic settings:', error);
            res.status(500).json({ message: 'Error fetching Anthropic settings' });
        }
    }
    static async updateAnthropicSettings(req, res) {
        try {
            const { apiKey, model } = req.body;
            let setting = await ApiSetting.findOne({
                where: { serviceName: 'Anthropic' }
            });
            if (setting) {
                await setting.update({ apiKey, model });
            }
            else {
                setting = await ApiSetting.create({
                    serviceName: 'Anthropic',
                    apiKey,
                    model,
                    isActive: true
                });
            }
            res.status(200).json({ message: 'Anthropic settings updated successfully' });
        }
        catch (error) {
            console.error('Error updating Anthropic settings:', error);
            res.status(500).json({ message: 'Error updating Anthropic settings' });
        }
    }
    static async getGeminiSettings(req, res) {
        try {
            const setting = await ApiSetting.findOne({
                where: { serviceName: 'Gemini' }
            });
            if (!setting) {
                return res.status(404).json({ message: 'Gemini settings not found' });
            }
            res.status(200).json({ apiKey: setting.apiKey });
        }
        catch (error) {
            console.error('Error fetching Gemini settings:', error);
            res.status(500).json({ message: 'Error fetching Gemini settings' });
        }
    }
    static async updateGeminiSettings(req, res) {
        try {
            const { apiKey } = req.body;
            let setting = await ApiSetting.findOne({
                where: { serviceName: 'Gemini' }
            });
            if (setting) {
                await setting.update({ apiKey });
            }
            else {
                setting = await ApiSetting.create({
                    serviceName: 'Gemini',
                    apiKey,
                    isActive: true
                });
            }
            res.status(200).json({ message: 'Gemini settings updated successfully' });
        }
        catch (error) {
            console.error('Error updating Gemini settings:', error);
            res.status(500).json({ message: 'Error updating Gemini settings' });
        }
    }
    static async getStripeSettings(req, res) {
        try {
            const setting = await ApiSetting.findOne({
                where: { serviceName: 'Stripe' }
            });
            if (!setting) {
                return res.status(404).json({ message: 'Stripe settings not found' });
            }
            res.status(200).json({
                apiKey: setting.apiKey,
                webhookSecret: setting.webhookSecret
            });
        }
        catch (error) {
            console.error('Error fetching Stripe settings:', error);
            res.status(500).json({ message: 'Error fetching Stripe settings' });
        }
    }
    static async updateStripeSettings(req, res) {
        try {
            const { apiKey, webhookSecret } = req.body;
            let setting = await ApiSetting.findOne({
                where: { serviceName: 'Stripe' }
            });
            if (setting) {
                await setting.update({ apiKey, webhookSecret });
            }
            else {
                setting = await ApiSetting.create({
                    serviceName: 'Stripe',
                    apiKey,
                    webhookSecret,
                    isActive: true
                });
            }
            res.status(200).json({ message: 'Stripe settings updated successfully' });
        }
        catch (error) {
            console.error('Error updating Stripe settings:', error);
            res.status(500).json({ message: 'Error updating Stripe settings' });
        }
    }
}
export default ApiSettingsController;
