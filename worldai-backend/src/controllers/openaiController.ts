// controllers/authController.js
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { AiModel, ApiSetting, Usage, User,Message } from '../models/index.js';  // Import the Settings model
import { appService } from '../services/langchain.js';  // Import the singleton instance
import fs from 'fs';
import path from 'path';  // Add this import at the top with other imports
dotenv.config();

let openaiClient = null;

class OpenaiController {

    static extractJSON(responseText) {
        const jsonMatch = responseText.match(/```json([\s\S]*?)```/);
        return jsonMatch ? JSON.parse(jsonMatch[1].trim()) : JSON.parse(responseText);
    }

    static async initializeModel() {
        try {
            // Get settings from database
            const settings = await ApiSetting.findOne({
                where: { serviceName: 'Openai' },
                include: [
                    {
                        model: AiModel,
                        as: 'models',
                        attributes: ['name', 'provider', 'maxTokens']
                    }
                ],

            });


            if (!settings) {
                throw new Error('OpenAI settings not found in database');
            }

            // Initialize OpenAI client with database settings
            openaiClient = new OpenAI({
                apiKey: settings.apiKey || process.env.OPENAI_API_KEY // Fallback to env if not in DB
            });

            return {
                model: settings.model || 'gpt-3.5-turbo',
                temperature: settings.temperature || 0.7,
                maxTokens: settings.maxTokens || 1000
            };
        } catch (error) {
            console.error('Error initializing OpenAI model:', error);
            // Fallback to default settings if database fetch fails
            openaiClient = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
            return {
                model: 'gpt-3.5-turbo',
                temperature: 0.7,
                maxTokens: 1000
            };
        }
    }

    static async chat(req, res) {
        try {
            const { message } = req.body;

            // Initialize or get model settings
            if (!openaiClient) {
                await OpenaiController.initializeModel();
            }

            // Get current model settings
            const modelSettings = await OpenaiController.initializeModel();

            // Set headers for streaming with CORS support
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');

            if (!message) {
                throw new Error('Message is required');
            }

            const stream = await openaiClient.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    { role: 'system', content: 'You are a helpful AI assistant.' },
                    { role: 'user', content: message }
                ],
                stream: true,
                max_tokens: modelSettings.maxTokens
            });

            // Stream the response
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    res.write(`data: ${JSON.stringify({ content })}\n\n`);
                }
            }

            // End the stream
            res.write('data: [DONE]\n\n');
            res.end();
        } catch (error) {
            console.error('OpenAI Stream Error:', error);
            const errorMessage = {
                error: true,
                message: error.message || 'An error occurred while processing your request'
            };
            res.write(`data: ${JSON.stringify(errorMessage)}\n\n`);
            res.end();
        }
    }

    static async function_calling(req, res) {
        try {
            const { chatId } = req.params;
            const { message } = req.body;
            const userId = req.user.id;
            const file = req.file;

            // Initialize the app service
            await appService.initialize();

            // Process file if present
            let fileInfo = null;
            if (file) {
                const uploadDir = 'uploads/request';
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }
                fileInfo = {
                    filename: file.filename,
                    path: file.path,
                    mimetype: file.mimetype,
                    serverPath: `${process.env.BACKEND_BASE_URL}/${file.path.replace(/\\/g, '/')}`
                };
            }

            // Run the agent and get response
            const userSettings = await appService.getUserSettings(userId);
            const response = await appService.runAgent(message, fileInfo, userSettings, userId, chatId);

            // Store usage data
            if (response.usage) {
                const { prompt_tokens, completion_tokens, total_tokens, tool_calls } = response.usage;

                // Create new usage record for each API hit
                await Usage.create({
                    userId,
                    promptTokens: prompt_tokens,
                    completionTokens: completion_tokens,
                    totalTokens: total_tokens,
                    toolCalls: tool_calls,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            // Send response
            res.json({
                content: response,
                fileInfo,
                timestamp: new Date().toISOString(),
                role: 'assistant'
            });

        } catch (error) {
            console.error('Agent Error:', error);
            res.status(500).json({
                error: true,
                message: error.message || 'An error occurred while processing your request'
            });
        }
    }

    static async getSuggestions(req, res) {
        const systemPrompt = `Generate a list of 4 diverse, creative template suggestions for an AI-powered personal assistant chatbot. The suggestions should align with the features and categories the bot can handle, based on the user's natural language input. Each suggestion should include an emoji, a prompt for the user (describing the task or action they can take), and a category that aligns with the prompt (such as Development, Video, Audio, Image, etc.). The format of the output should be:
[
    {{
        "emoji": "<emoji>",
        "prompt": "<description of the task or suggestion the bot can help with>",
        "category": "<category>"
    }},
    ...
]
The AI bot should take user input in natural language and translate it into actionable tasks. These tasks should cater to users who are looking for creative, diverse, and useful outcomes. For example, a user might ask for help with coding, media creation, or even generating music. The bot should automatically select the best model and create the user's request based on their input.

The emoji should relate to the task or action suggested.
The prompt should be consice no 'if' and 'but' and 'or' clearly describe what the user can request or create using the AI bot.
The category should be one of the following: Development, Video, Audio, Image, or similar relevant categories.
It should be as if we are users and we are requesting something from AI.
relatd texts are:
1. Build a minimalist weather app using React.
2. Create a video of a cyberpunk cityscape with a motorcycle gliding through the air.
3. Generate a relaxing lo-fi track with soft piano notes.
4. Create a fantasy portrait of an old sage meditating in a mystical forest.
It should be related to this not always these similar.
The category can be same but the prompt itself can be differnet from actual prompts
`
        try {
            const suggestions = await appService.getSuggestions(systemPrompt);
            const parsedSuggestions = JSON.parse(suggestions);
            res.json({ suggestions: parsedSuggestions });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: error.message || 'An error occurred while processing your request' });
        }
    }

    static async getChatTitle(req, res) {
        try {
            const { message } = req.body;
            if (!message) {
                throw new Error('Message is required');
            }

            const chatTitle = await appService.getChatTitle(message);
            res.json({ title: chatTitle });
        } catch (error) {
            console.error('Error generating chat title:', error);
            res.status(500).json({
                error: true,
                message: error.message || 'An error occurred while generating the chat title'
            });
        }
    }

    static async inPainting(req, res) {
        try {
            const { chatId } = req.params;
            const { image, prompt, mask } = req.body;
            const userId = req.user?.id; // Get userId from authenticated user

            if (!image || !prompt) {
                throw new Error('Image and prompt are required');
            }

            // Helper function to safely convert base64 to buffer
            const base64ToBuffer = (base64String) => {
                // Remove data URL prefix if it exists
                const base64Data = base64String.includes('base64,')
                    ? base64String.split('base64,')[1]
                    : base64String;

                try {
                    return Buffer.from(base64Data, 'base64');
                } catch (error) {
                    throw new Error('Invalid base64 string provided');
                }
            };

            // Convert base64 to buffer
            const imageBuffer = base64ToBuffer(image);

            // Convert mask to buffer if provided
            let maskBuffer = null;
            if (mask) {
                console.log('Mask received, converting to buffer');
                maskBuffer = base64ToBuffer(mask);
            }

            // Call inPainting with buffer, prompt, userId and maskBuffer
            const output = await appService.inPainting(imageBuffer, prompt, userId, maskBuffer);


            await Message.create({
                chatId,
                content: JSON.stringify({message: "Inpainted image", imageUrl: output.data.images[0].url }),
                role: 'assistant',
                timestamp: new Date().toISOString(),
                userId
            });

            res.json({ output });
        } catch (error) {
            console.error('Error inPainting:', error);
            res.status(500).json({
                error: true,
                message: error.message || 'An error occurred while inPainting'
            });
        }
    }

}


export default OpenaiController;