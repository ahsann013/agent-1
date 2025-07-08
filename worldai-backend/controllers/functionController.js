// controllers/     .js
import { appServiceOpenAI } from '../services/openai.js';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

class FunctionController {
    
    static async initializeService() {
        try {
            await appServiceOpenAI.initialize();
            return true;
        } catch (error) {
            console.error('Error initializing OpenAI service:', error);
            return false;
        }
    }

    static async chat(req, res) {
        try {
            const { message } = req.body;

            if (!message) {
                throw new Error('Message is required');
            }

            // Initialize service
            await FunctionController.initializeService();

            // Set headers for streaming with CORS support
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');

            // Get streaming response from the AI service
            const stream = await appServiceOpenAI.streamResponse(message);

            // Stream the response
            for await (const chunk of stream) {
                const content = chunk.content || '';
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
            const { message } = req.body;
            const userId = req.user?.id;
            const file = req.file;

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
                    serverPath: `${process.env.BACKEND_BASE_URL}/${file.path.replace(/\\/g, '/')}` // Convert to absolute path
                };
            }

            console.log("fileInfo", fileInfo);
            
            // Run the agent and get response
            const response = await appServiceOpenAI.runAgent(message, fileInfo, userId);

            // Send single response
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
        try {
            // Initialize service
            await FunctionController.initializeService();
            
            const systemPrompt = `Generate a list of 4 diverse, creative template suggestions for an AI-powered personal assistant chatbot. The suggestions should align with the features and categories the bot can handle, based on the user's natural language input. Each suggestion should include an emoji, a prompt for the user (describing the task or action they can take), and a category that aligns with the prompt (such as Development, Video, Audio, Image, etc.). The format of the output should be:
[
    {
        "emoji": "<emoji>",
        "prompt": "<description of the task or suggestion the bot can help with>",
        "category": "<category>"
    },
    ...
]
The AI bot should take user input in natural language and translate it into actionable tasks. These tasks should cater to users who are looking for creative, diverse, and useful outcomes. For example, a user might ask for help with coding, media creation, or even generating music. The bot should automatically select the best model and create the user's request based on their input.

The emoji should relate to the task or action suggested.
The prompt should be concise, no 'if' and 'but' and 'or', and clearly describe what the user can request or create using the AI bot.
The category should be one of the following: Development, Video, Audio, Image, or similar relevant categories.
It should be as if we are users and we are requesting something from AI.
Related texts are:
1. Build a minimalist weather app using React.
2. Create a video of a cyberpunk cityscape with a motorcycle gliding through the air.
3. Generate a relaxing lo-fi track with soft piano notes.
4. Create a fantasy portrait of an old sage meditating in a mystical forest.
It should be related to this, not always these similar.
The category can be same but the prompt itself can be different from actual prompts`;

            const suggestions = await appServiceOpenAI.getSuggestions(systemPrompt);
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

            // Initialize service
            await FunctionController.initializeService();

            const chatTitle = await appServiceOpenAI.getChatTitle(message);
            res.json({ title: chatTitle });
        } catch (error) {
            console.error('Error generating chat title:', error);
            res.status(500).json({ 
                error: true, 
                message: error.message || 'An error occurred while generating the chat title' 
            });
        }
    }

    static async generateImage(req, res) {
        try {
            const { prompt, width, height, steps } = req.body;
            if (!prompt) {
                throw new Error('Prompt is required');
            }

            // Initialize service
                await FunctionController.initializeService();

            // Call the image generation function from the service
            const result = await appServiceOpenAI.executeTool("generate_image", {
                prompt, 
                width: width || 1024, 
                height: height || 1024, 
                steps: steps || 30
            });

            // Extract image URL from result
            const match = result.match(/URL: (https?:\/\/[^\s]+)/);
            const imageUrl = match && match[1] ? match[1] : null;

            if (!imageUrl) {
                throw new Error('Failed to generate image');
            }

            res.json({ 
                success: true,
                message: 'Image generated successfully',
                imageUrl
            });
        } catch (error) {
            console.error('Error generating image:', error);
            res.status(500).json({ 
                error: true, 
                message: error.message || 'An error occurred while generating the image' 
            });
        }
    }

    static async generateVideo(req, res) {
        try {
            const { prompt, num_frames, fps, width, height } = req.body;
            if (!prompt) {
                throw new Error('Prompt is required');
            }

            // Initialize service
            await FunctionController.initializeService();

            // Call the video generation function from the service
            const result = await appServiceOpenAI.executeTool("generate_video", {
                prompt, 
                num_frames: num_frames || 50, 
                fps: fps || 6, 
                width: width || 1024, 
                height: height || 576
            });

            // Extract video URL from result
            const match = result.match(/URL: (https?:\/\/[^\s]+)/);
            const videoUrl = match && match[1] ? match[1] : null;

            if (!videoUrl) {
                throw new Error('Failed to generate video');
            }

            res.json({ 
                success: true,
                message: 'Video generated successfully',
                videoUrl
            });
        } catch (error) {
            console.error('Error generating video:', error);
            res.status(500).json({ 
                error: true, 
                message: error.message || 'An error occurred while generating the video' 
            });
        }
    }

    static async enhanceImage(req, res) {
        try {
            const { image_url, enhancement_type, width, height } = req.body;
            if (!image_url) {
                throw new Error('Image URL is required');
            }

            // Initialize service
            await FunctionController.initializeService();

            // Call the image enhancement function from the service
            const result = await appServiceOpenAI.executeTool("enhance_image", {
                image_url,
                enhancement_type: enhancement_type || "quality",
                width: width || 1024,
                height: height || 1024
            });

            // Extract enhanced image URL from result
            const match = result.match(/URL: (https?:\/\/[^\s]+)/);
            const enhancedImageUrl = match && match[1] ? match[1] : null;

            if (!enhancedImageUrl) {
                throw new Error('Failed to enhance image');
            }

            res.json({ 
                success: true,
                message: 'Image enhanced successfully',
                imageUrl: enhancedImageUrl
            });
        } catch (error) {
            console.error('Error enhancing image:', error);
            res.status(500).json({ 
                error: true, 
                message: error.message || 'An error occurred while enhancing the image' 
            });
        }
    }

    static async transformImage(req, res) {
        try {
            const { prompt, image_url, strength, width, height, steps } = req.body;
            if (!prompt || !image_url) {
                throw new Error('Both prompt and image URL are required');
            }

            // Initialize service
            await FunctionController.initializeService();

            // Call the image-to-image function from the service
            const result = await appServiceOpenAI.executeTool("image_to_image", {
                prompt,
                image_url,
                strength: strength || 0.75,
                width: width || 1024,
                height: height || 1024,
                steps: steps || 30
            });

            // Extract transformed image URL from result
            const match = result.match(/URL: (https?:\/\/[^\s]+)/);
            const transformedImageUrl = match && match[1] ? match[1] : null;

            if (!transformedImageUrl) {
                throw new Error('Failed to transform image');
            }

            res.json({ 
                success: true,
                message: 'Image transformed successfully',
                imageUrl: transformedImageUrl
            });
        } catch (error) {
            console.error('Error transforming image:', error);
            res.status(500).json({ 
                error: true, 
                message: error.message || 'An error occurred while transforming the image' 
            });
        }
    }

    static async enhancePrompt(req, res) {
        try {
            const { prompt } = req.body;
            if (!prompt) {
                throw new Error('Prompt is required');
            }

            // Initialize service
            await FunctionController.initializeService();

            // Call the prompt enhancement function from the service
            const result = await appServiceOpenAI.executeTool("prompt_generator", { prompt });
            
            // Extract enhanced prompt from result
            const enhancedPrompt = result.replace('Enhanced prompt: ', '').trim();

            res.json({ 
                success: true,
                originalPrompt: prompt,
                enhancedPrompt: enhancedPrompt
            });
        } catch (error) {
            console.error('Error enhancing prompt:', error);
            res.status(500).json({ 
                error: true, 
                message: error.message || 'An error occurred while enhancing the prompt' 
            });
        }
    }
}

export default FunctionController;