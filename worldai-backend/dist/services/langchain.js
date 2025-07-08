import { tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { ToolMessage, AIMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { fal, } from '@fal-ai/client';
import { ApiSetting, UserSetting, AiModel, User, Usage, ServicePricing } from '../models/index.js';
import { downloadAndSaveFile } from '../utils/fileHandler.js';
import Replicate from 'replicate';
import { writeFile } from "node:fs/promises";
import fs from 'fs';
import { GoogleGenAI, } from "@google/genai";
import { OpenAI, toFile } from 'openai';
dotenv.config();
let instance = null;
export class AppService {
    constructor() {
        console.log('AppService constructor called');
        if (instance) {
            console.log('Returning existing instance');
            return instance;
        }
        console.log('Creating new AppService instance');
        this.llm = null;
        this.tools = null;
        this.toolsByName = null;
        this.llmWithTools = null;
        this.isInitialized = false;
        instance = this;
        return instance;
    }
    async initialize() {
        console.log('Initializing AppService...');
        try {
            if (this.isInitialized) {
                console.log('Service already initialized, skipping initialization');
                return;
            }
            console.log('Fetching OpenAI settings from database...');
            const openaiSettings = await ApiSetting.findOne({
                where: { serviceName: 'Openai' }
            });
            console.log('Fetching Fal AI settings from database...');
            const falSettings = await ApiSetting.findOne({
                where: { serviceName: 'Fal' }
            });
            const replicateSettings = await ApiSetting.findOne({
                where: { serviceName: 'Replicate' }
            });
            const anthropicSettings = await ApiSetting.findOne({
                where: { serviceName: 'Anthropic' }
            });
            console.log("Replicate AI SETTINGS", replicateSettings);
            console.log("Anthropic AI SETTINGS", anthropicSettings);
            if (!openaiSettings) {
                console.error('OpenAI settings not found in database');
                throw new Error('OpenAI settings not found in database');
            }
            if (!falSettings) {
                console.error('Fal AI settings not found in database');
                throw new Error('Fal AI settings not found in database');
            }
            if (!replicateSettings) {
                console.error('Replicate AI settings not found in database');
                throw new Error('Replicate AI settings not found in database');
            }
            if (!anthropicSettings) {
                console.error('Anthropic AI settings not found in database');
                throw new Error('Anthropic AI settings not found in database');
            }
            console.log('Initializing OpenAI with model:', openaiSettings.model);
            this.llm = new ChatOpenAI({
                apiKey: openaiSettings.apiKey,
                modelName: openaiSettings.model || "gpt-4-turbo-preview",
            });
            console.log('Initializing Fal AI client...');
            console.log("FAL AI API KEY", falSettings.apiKey);
            fal.config({
                credentials: falSettings.apiKey
            });
            console.log('Initializing Replicate client...');
            console.log("REPLICATE API KEY", replicateSettings.apiKey);
            this.replicate = new Replicate({
                auth: replicateSettings.apiKey
            });
            console.log('Setting up tools...');
            this.tools = this.setupTools();
            this.toolsByName = Object.fromEntries(this.tools.map(tool => [tool.name, tool]));
            console.log('Binding tools to LLM...');
            this.llmWithTools = this.llm.bindTools(this.tools);
            this.isInitialized = true;
            console.log('AppService initialization completed successfully');
        }
        catch (error) {
            console.error('Error initializing services:', error);
            throw error;
        }
    }
    setupTools() {
        console.log('Setting up AI tools...');
        const deduct_credits = tool(async ({ toolName, params = {}, tokenInfo = null }) => {
            console.log('Deducting credits for tool:', toolName);
            try {
                if (toolName === 'generate_completions') {
                    console.log(`Skipping credit deduction for ${toolName}`);
                    return JSON.stringify({
                        success: true,
                        creditsDeducted: 0,
                        reason: 'No credits deducted for generate_completions'
                    });
                }
                const user = await User.findByPk(params.userId);
                if (!user) {
                    console.log(`User ${params.userId} not found`);
                    return JSON.stringify({
                        success: false,
                        reason: 'User not found'
                    });
                }
                const servicePricing = await ServicePricing.findOne({
                    where: {
                        serviceIdentifier: toolName,
                    }
                });
                if (!servicePricing) {
                    console.log(`No active pricing found for tool: ${toolName}`);
                    return JSON.stringify({
                        success: false,
                        reason: 'Service pricing not found'
                    });
                }
                let creditsToDeduct = 0;
                let usageDetails = [];
                if (tokenInfo && servicePricing.unit === 'per million tokens') {
                    const pricePerToken = servicePricing.price / 1000000;
                    const inputCredits = Math.ceil(tokenInfo.promptTokens * pricePerToken);
                    const outputCredits = Math.ceil(tokenInfo.completionTokens * pricePerToken);
                    creditsToDeduct = inputCredits + outputCredits;
                    usageDetails.push({
                        toolName: toolName,
                        credits: creditsToDeduct,
                        inputTokens: tokenInfo.promptTokens || 0,
                        outputTokens: tokenInfo.completionTokens || 0,
                        unit: 'tokens'
                    });
                }
                else if (servicePricing.unit.includes('per second')) {
                    let duration = 0;
                    if (params.duration) {
                        duration = Number(params.duration);
                    }
                    else if (params.num_frames && params.fps) {
                        duration = 5;
                    }
                    duration = Math.max(1, duration);
                    creditsToDeduct = servicePricing.price * duration;
                    usageDetails.push({
                        toolName: toolName,
                        credits: creditsToDeduct,
                        duration: duration,
                        unit: 'seconds'
                    });
                }
                else {
                    creditsToDeduct = servicePricing.price;
                    usageDetails.push({
                        toolName: toolName,
                        credits: creditsToDeduct,
                        unit: servicePricing.unit
                    });
                }
                if (creditsToDeduct <= 0) {
                    console.log('No credits to deduct');
                    return JSON.stringify({
                        success: true,
                        creditsDeducted: 0,
                        creditsRemaining: user.credits
                    });
                }
                if (user.credits < creditsToDeduct) {
                    console.log(`User ${params.userId} doesn't have enough credits (has ${user.credits}, needs ${creditsToDeduct})`);
                    return JSON.stringify({
                        success: false,
                        reason: 'Insufficient credits',
                        creditsRequired: creditsToDeduct,
                        creditsAvailable: user.credits
                    });
                }
                user.credits -= creditsToDeduct;
                await user.save();
                await Usage.create({
                    userId: params.userId,
                    promptTokens: tokenInfo?.promptTokens || 0,
                    completionTokens: tokenInfo?.completionTokens || 0,
                    totalTokens: (tokenInfo?.promptTokens || 0) + (tokenInfo?.completionTokens || 0),
                    toolCalls: toolName ? 1 : 0,
                    toolUsage: JSON.stringify(usageDetails),
                    creditsUsed: creditsToDeduct
                });
                console.log(`Successfully deducted ${creditsToDeduct} credits. User now has ${user.credits} credits.`);
                return JSON.stringify({
                    success: true,
                    creditsDeducted: creditsToDeduct,
                    creditsRemaining: user.credits,
                    usageDetails: usageDetails
                });
            }
            catch (error) {
                console.error('Error deducting user credits:', error);
                return { success: false, reason: 'Error deducting credits', error: error.message };
            }
        }, {
            name: "deduct_credits",
            description: "Deducts credits from a user's account based on tool usage and token consumption",
            schema: z.object({
                toolName: z.string().describe("Name of the tool being used"),
                params: z.object({
                    userId: z.string().describe("ID of the user to deduct credits from"),
                    duration: z.number().optional().describe("Duration for video tools"),
                    num_frames: z.number().optional().describe("Number of frames for video tools"),
                    fps: z.number().optional().describe("Frames per second for video tools")
                }),
                tokenInfo: z.object({
                    promptTokens: z.number().optional().describe("Number of prompt tokens used"),
                    completionTokens: z.number().optional().describe("Number of completion tokens used")
                }).optional()
            }),
        });
        const prompt_generator = tool(async ({ prompt }) => {
            console.log('Prompt generator tool called with prompt:', prompt);
            try {
                const model = await AiModel.findOne({
                    where: {
                        type: 'text-to-text',
                        isDefault: true
                    }
                });
                if (!model) {
                    throw new Error('No default text-to-text model found in database');
                }
                console.log(`Using ${model.name} model for prompt generation`);
                const output = await this.replicate.run(model.name, {
                    input: {
                        prompt: `Enhance this image generation prompt: "${prompt}"`,
                        system_prompt: "You are an expert at creating detailed, vivid prompts for text-to-image AI systems. Enhance the given prompt to include more details about lighting, style, composition, colors, and mood. Keep the core intent of the original prompt but make it more specific and visually descriptive."
                    }
                });
                console.log('Enhanced prompt generated:', output);
                return `Enhanced prompt: ${output}`;
            }
            catch (error) {
                console.error('Failed to generate enhanced prompt:', error);
                return `Failed to generate enhanced prompt: ${error.message}`;
            }
        }, {
            name: "prompt_generator",
            description: "Enhances a text prompt to make it more suitable for image generation",
            schema: z.object({
                prompt: z.string().describe("The original text prompt to enhance"),
            }),
        });
        const generate_completions = tool(async ({ prompt }) => {
            if (!this.isInitialized) {
                await this.initialize();
            }
            console.log('Generate completions tool called with prompt:', prompt);
            try {
                const model = await AiModel.findOne({
                    where: {
                        type: 'text-to-text',
                        isDefault: true
                    }
                });
                if (!model) {
                    throw new Error('No default text-to-text model found in database');
                }
                console.log(`Using ${model.name} model for text completion`);
                const output = await this.replicate.run(model.name, {
                    input: {
                        prompt: prompt,
                        system_prompt: "You are a helpful AI assistant that provides accurate and detailed responses to user queries."
                    }
                });
                console.log('Completion generation finished');
                if (Array.isArray(output)) {
                    return output.join('\n');
                }
                return output;
            }
            catch (error) {
                console.error('Failed to generate completion:', error);
                return `Failed to generate completion: ${error.message}`;
            }
        }, {
            name: "generate_completions",
            description: "Generate text completions using a text-to-text model. Use this for general text generation, questions, coding, and other text-based tasks. For image or video generation, use the specific tools instead.",
            schema: z.object({
                prompt: z.string().describe("The text prompt to generate completion for"),
            }),
        });
        const generate_image = tool(async ({ prompt, width, height, steps, userId = null }) => {
            console.log('Generate image tool called with:', { prompt, width, height, steps, userId });
            try {
                const settings = await this.getUserSettings(userId);
                const imageSettings = settings.image;
                console.log('Using image settings:', imageSettings);
                console.log('Base settings:', {
                    prompt: prompt,
                    negative_prompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy",
                    width: width,
                    height: height,
                    num_inference_steps: steps
                });
                console.log('Calling Fal AI stable-diffusion model...');
                const model = await AiModel.findOne({
                    where: {
                        type: 'text-to-image',
                        isDefault: true
                    }
                });
                console.log(`Calling ${model.name} model...`);
                const result = await fal.run(model.name, {
                    input: {
                        prompt: prompt,
                        negative_prompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy",
                        aspect_ratio: imageSettings.aspectRatio,
                        image_size: {
                            width: width || imageSettings.width,
                            height: height || imageSettings.height
                        },
                        num_inference_steps: steps || imageSettings.steps,
                    }, logs: true,
                    onQueueUpdate: (update) => {
                        if (update.status === "IN_PROGRESS") {
                            console.log('Image generation progress update:', update.status);
                            update.logs.map((log) => log.message).forEach(console.log);
                        }
                    }
                });
                if (result && result.data && result.data.images[0]) {
                    const imageUrl = result.data.images[0].url;
                    console.log('Image generated successfully, downloading to local storage...');
                    try {
                        const savedFile = await downloadAndSaveFile(imageUrl, 'image');
                        console.log('Image saved to local storage:', savedFile);
                        return `Image generated successfully. URL: ${savedFile.localUrl}`;
                    }
                    catch (downloadError) {
                        console.error('Failed to save image to local storage:', downloadError);
                        return `Image generated successfully. URL: ${imageUrl}`;
                    }
                }
                else {
                    console.error('No image data in response');
                    return "Failed to generate image: No image data in response";
                }
            }
            catch (error) {
                console.error('Failed to generate image:', error);
                return `Failed to generate image: ${error.message}`;
            }
        }, {
            name: "generate_image",
            description: "Generate an image based on a text prompt using Fal AI",
            schema: z.object({
                prompt: z.string().describe("The text description of the image to generate"),
                width: z.number().optional().describe("Image width in pixels"),
                height: z.number().optional().describe("Image height in pixels"),
                steps: z.number().optional().describe("Number of inference steps (higher = more detailed but slower)"),
                userId: z.string().optional().describe("User ID"),
            }),
        });
        const generate_video = tool(async ({ prompt, num_frames, fps, width, height, userId = null }) => {
            console.log('Generate video tool called with:', { prompt, num_frames, fps, width, height, userId });
            try {
                const model = await AiModel.findOne({
                    where: {
                        type: 'text-to-video',
                        isDefault: true
                    }
                });
                const settings = await this.getUserSettings(userId);
                const videoSettings = settings.video;
                console.log('Using video settings:', videoSettings);
                console.log("model", model);
                console.log(`Calling ${model.name} model...`);
                const result = await fal.subscribe(model.name, {
                    input: {
                        prompt: prompt,
                        negative_prompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy",
                        aspect_ratio: videoSettings.aspectRatio,
                        duration: videoSettings.duration,
                    },
                    logs: true,
                    onQueueUpdate: (update) => {
                        if (update.status === "IN_PROGRESS") {
                            console.log('Video generation progress update:', update.status);
                            update.logs.map((log) => log.message).forEach(console.log);
                        }
                    }
                });
                if (result && result.data && result.data.video.url) {
                    const videoUrl = result.data.video.url;
                    console.log('Video generated successfully, downloading to local storage...');
                    try {
                        const savedFile = await downloadAndSaveFile(videoUrl, 'video');
                        console.log('Video saved to local storage:', savedFile);
                        return `Video generated successfully. URL: ${savedFile.localUrl}`;
                    }
                    catch (downloadError) {
                        console.error('Failed to save video to local storage:', downloadError);
                        return `Video generated successfully. URL: ${videoUrl}`;
                    }
                }
                else {
                    console.error('No video data in response');
                    return "Failed to generate video: No video data in response";
                }
            }
            catch (error) {
                console.error('Failed to generate video:', error);
                return `Failed to generate video: ${error.message}`;
            }
        }, {
            name: "generate_video",
            description: "Generate a video based on a text prompt using Fal AI's veo2 model",
            schema: z.object({
                prompt: z.string().describe("The text description of the video to generate"),
                num_frames: z.number().optional().describe("Number of frames to generate"),
                fps: z.number().optional().describe("Frames per second for the output video"),
                width: z.number().optional().describe("Video width in pixels"),
                height: z.number().optional().describe("Video height in pixels"),
                userId: z.string().optional().describe("User ID"),
            }),
        });
        const image_to_image = tool(async ({ prompt, image_url }) => {
            console.log('Generate image with Gemini tool called with prompt:', prompt);
            const mdl = await ApiSetting.findOne({
                where: {
                    serviceName: 'Gemini',
                }
            });
            try {
                const genAI = new GoogleGenAI({ apiKey: mdl.apiKey });
                console.log('Generating product photography description...');
                const textPrompt = `You are an expert product photographer. Create a detailed, professional product photography description based on this request: "${prompt}". 
          Include details about:
          - Lighting setup
          - Camera angle
          - Background
          - Product positioning
          - Overall mood and style
          - Any specific product features to highlight
          
          Make the description vivid and specific enough to generate a high-quality product photo.`;
                const textResult = await genAI.models.generateContent({
                    contents: textPrompt,
                    model: "gemini-1.5-flash",
                    config: {
                        responseModalities: ["Text"],
                    },
                });
                const enhancedPrompt = textResult.candidates[0].content.parts[0].text;
                console.log('Generated product photography description:', enhancedPrompt);
                let contents;
                if (image_url) {
                    let imageData;
                    if (image_url.startsWith('http')) {
                        const response = await fetch(image_url);
                        imageData = await response.arrayBuffer();
                    }
                    else {
                        imageData = await fs.promises.readFile(image_url);
                    }
                    contents = [{ text: enhancedPrompt }, {
                            inlineData: {
                                mimeType: "image/png",
                                data: Buffer.from(imageData).toString('base64'),
                            },
                        }];
                }
                else {
                    contents = [{ text: enhancedPrompt }];
                }
                console.log('Calling Gemini image generation model...');
                const model = await AiModel.findOne({
                    where: {
                        type: 'gemini',
                        isDefault: true
                    }
                });
                const response = await genAI.models.generateContent({
                    contents: contents,
                    model: model.name,
                    config: {
                        responseModalities: ["Text", "Image"],
                    },
                });
                console.log('Gemini image generation result:', response);
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const fileName = `gemini-generated-${Date.now()}.png`;
                        const filePath = `./uploads/images/${fileName}`;
                        await fs.promises.mkdir('./uploads/images', { recursive: true });
                        await fs.promises.writeFile(filePath, Buffer.from(part.inlineData.data, 'base64'));
                        console.log('Image saved to local storage:', filePath);
                        const serverUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3001';
                        const imageUrl = `${serverUrl}/uploads/images/${fileName}`;
                        return `Image generated successfully with enhanced description. URL: ${imageUrl}\nGenerated Description: ${enhancedPrompt}`;
                    }
                    else if (part.text) {
                        return `Text response: ${part.text}`;
                    }
                }
                return "No image or text data in response";
            }
            catch (error) {
                console.error('Failed to generate with Gemini:', error);
                return `Failed to generate: ${error.message}`;
            }
        }, {
            name: "image_to_image",
            description: "Generate an image or modify an existing image using Google's Gemini model. Can be used for editing requests or image editing.",
            schema: z.object({
                prompt: z.string().describe("The text description or instruction for image editing"),
                image_url: z.string().optional().describe("Path to the input image file or URL (optional)")
            }),
        });
        const generate_music = tool(async ({ prompt, duration = 8, temperature = 1, model_version = "stereo-large" }) => {
            console.log('Generate music tool called with:', { prompt, duration, temperature, model_version });
            try {
                const replicate = this.replicate;
                const model = await AiModel.findOne({
                    where: {
                        type: 'text-to-music',
                        isDefault: true
                    }
                });
                console.log(`Calling ${model.name} model...`);
                const input = {
                    prompt: "Edo25 major g melodies that sound triumphant and cinematic. Leading up to a crescendo that resolves in a 9th harmonic",
                    model_version: "stereo-large",
                    output_format: "mp3",
                    normalization_strategy: "peak"
                };
                const output = await replicate.run(model.name, { input });
                console.log("output", output);
                const fileName = `audio-generated-${Date.now()}.wav`;
                const filePath = `./uploads/audio/${fileName}`;
                await writeFile(filePath, output);
                console.log("File written successfully");
                if (output) {
                    const serverUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3001';
                    const musicUrl = `${serverUrl}/uploads/audio/${fileName}`;
                    console.log('Music generated successfully');
                    return `Music generated successfully. URL: ${musicUrl}`;
                }
                else {
                    console.error('No music data in response');
                    return "Failed to generate music: No data in response";
                }
            }
            catch (error) {
                console.error('Failed to generate music:', error);
                return `Failed to generate music: ${error.message}`;
            }
        }, {
            name: "generate_music",
            description: "Generate music based on a text prompt using Meta's MusicGen model",
            schema: z.object({
                prompt: z.string().describe("Text description of the music to generate"),
                duration: z.number().optional().describe("Duration of the music in seconds (default: 8)"),
                temperature: z.number().optional().describe("Controls randomness in generation (0-1, default: 1)"),
                model_version: z.string().optional().describe("Model version to use (default: stereo-large)")
            }),
        });
        const image_to_3d = tool(async ({ image_url }) => {
            console.log('Image to 3D tool called with:', { image_url });
            try {
                const replicate = this.replicate;
                console.log('Calling Replicate HunYuan3D model...');
                const output = await replicate.run("ndreca/hunyuan3d-2:4ac0c7d1ef7e7dd58bf92364262597272dea79bfdb158b26027f54eb667f28b8", {
                    input: {
                        seed: 1234,
                        image: image_url,
                        steps: 50,
                        guidance_scale: 5.5,
                        octree_resolution: 512,
                        remove_background: true
                    }
                });
                if (output && output.mesh) {
                    console.log("3D model output URL:", output.mesh);
                    const fileName = `3d-model-${Date.now()}.glb`;
                    const filePath = `./uploads/models/${fileName}`;
                    await fs.promises.mkdir('./uploads/models', { recursive: true });
                    const response = await fetch(output.mesh);
                    const arrayBuffer = await response.arrayBuffer();
                    await fs.promises.writeFile(filePath, Buffer.from(arrayBuffer));
                    const serverUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3001';
                    const modelUrl = `${serverUrl}/uploads/models/${fileName}`;
                    console.log('3D model saved successfully');
                    return `3D model generated successfully. URL: ${modelUrl}`;
                }
                else {
                    console.error('No 3D model data in response');
                    return "Failed to generate 3D model: No data in response";
                }
            }
            catch (error) {
                console.error('Failed to generate 3D model:', error);
                return `Failed to generate 3D model: ${error.message}`;
            }
        }, {
            name: "image_to_3d",
            description: "Convert an image into a 3D model using HunYuan3D",
            schema: z.object({
                image_url: z.string().describe("URL of the image to convert to 3D"),
            }),
        });
        const voice_cloner = tool(async ({ text, speaker_url }) => {
            console.log('Voice cloner tool called with:', { text, speaker_url });
            try {
                const replicate = this.replicate;
                const model = await AiModel.findOne({
                    where: {
                        type: 'voice-cloner',
                        isDefault: true
                    }
                });
                console.log(`Calling ${model.name} model...`);
                const output = await replicate.run(model.name, {
                    input: {
                        text: text,
                        speaker: speaker_url,
                        language: "en",
                        cleanup_voice: false
                    }
                });
                console.log("Voice cloning output:", output);
                const fileName = `voice-cloned-${Date.now()}.wav`;
                const filePath = `./uploads/audio/${fileName}`;
                await writeFile(filePath, output);
                console.log("File written successfully");
                if (output) {
                    const serverUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3001';
                    const audioUrl = `${serverUrl}/uploads/audio/${fileName}`;
                    console.log('Voice cloned successfully');
                    return `Voice cloned successfully. URL: ${audioUrl}`;
                }
                else {
                    console.error('No audio data in response');
                    return "Failed to clone voice: No data in response";
                }
            }
            catch (error) {
                console.error('Failed to clone voice:', error);
                return `Failed to clone voice: ${error.message}`;
            }
        }, {
            name: "voice_cloner",
            description: "Clone a voice using XTTS-v2 model and generate speech with the cloned voice. ",
            schema: z.object({
                text: z.string().describe("The text to be converted to speech"),
                speaker_url: z.string().describe("URL of the speaker audio file to clone the voice from.")
            }),
        });
        const image_to_text = tool(async ({ image_url, prompt }) => {
            console.log('Image to text tool called with:', { image_url, prompt });
            try {
                const replicate = this.replicate;
                console.log('Calling Replicate LLaVA model...');
                const input = {
                    image: image_url,
                    prompt: prompt || "Describe what you see in this image in detail."
                };
                let fullResponse = '';
                for await (const event of replicate.stream("yorickvp/llava-13b:80537f9eead1a5bfa72d5ac6ea6414379be41d4d4f6679fd776e9535d1eb58bb", { input })) {
                    fullResponse += event;
                }
                console.log('Image to text analysis completed');
                return `Analysis of image: ${fullResponse}`;
            }
            catch (error) {
                console.error('Failed to analyze image:', error);
                return `Failed to analyze image: ${error.message}`;
            }
        }, {
            name: "image_to_text",
            description: "Analyze an image and provide textual description or answer questions about it using LLaVA model",
            schema: z.object({
                image_url: z.string().describe("URL of the image to analyze"),
                prompt: z.string().optional().describe("Specific question or instruction about the image (optional)")
            }),
        });
        const generate_code = tool(async ({ prompt, language = "javascript" }) => {
            console.log('Generate code tool called with prompt:', prompt, 'language:', language);
            try {
                const model = await AiModel.findOne({
                    where: {
                        type: 'text-to-text',
                        isDefault: true
                    }
                });
                if (!model) {
                    throw new Error('No default text-to-text model found in database');
                }
                console.log(`Using ${model.name} model for code generation`);
                const systemPrompt = "You are an expert programmer. Your task is to generate clean, efficient, and well-commented code based on the user's request. Return ONLY the code without any explanations, introductions, or markdown formatting.";
                const output = await this.replicate.run(model.name, {
                    input: {
                        prompt: prompt,
                        system_prompt: systemPrompt
                    }
                });
                console.log('Code generation finished');
                if (Array.isArray(output)) {
                    return output.join('\n');
                }
                return output;
            }
            catch (error) {
                console.error('Failed to generate code:', error);
                return `Failed to generate code: ${error.message}`;
            }
        }, {
            name: "generate_code",
            description: "Generate code based on a text prompt. Use this specifically for programming tasks when the output should be executable code. Returns only the code without explanations.",
            schema: z.object({
                prompt: z.string().describe("Description of the code to generate"),
                language: z.string().optional().describe("Programming language to use (e.g., javascript, python, java)")
            }),
        });
        const product_photography = tool(async ({ prompt, image_url }) => {
            console.log('Generate image with Gemini tool called with prompt:', prompt);
            const mdl = await ApiSetting.findOne({
                where: {
                    serviceName: 'Gemini',
                }
            });
            try {
                const genAI = new GoogleGenAI({ apiKey: mdl.apiKey });
                console.log('Generating product photography description...');
                const textPrompt = `You are an expert product photographer. Create a detailed, professional product photography description based on this request: "${prompt}". 
          Include details about:
          - Lighting setup
          - Camera angle
          - Background
          - Product positioning
          - Overall mood and style
          - Any specific product features to highlight
          
          Make the description vivid and specific enough to generate a high-quality product photo.`;
                const textResult = await genAI.models.generateContent({
                    contents: textPrompt,
                    model: "gemini-1.5-flash",
                    config: {
                        responseModalities: ["Text"],
                    },
                });
                const enhancedPrompt = textResult.candidates[0].content.parts[0].text;
                console.log('Generated product photography description:', enhancedPrompt);
                let contents;
                if (image_url) {
                    let imageData;
                    if (image_url.startsWith('http')) {
                        const response = await fetch(image_url);
                        imageData = await response.arrayBuffer();
                    }
                    else {
                        imageData = await fs.promises.readFile(image_url);
                    }
                    contents = [{ text: enhancedPrompt }, {
                            inlineData: {
                                mimeType: "image/png",
                                data: Buffer.from(imageData).toString('base64'),
                            },
                        }];
                }
                else {
                    contents = [{ text: enhancedPrompt }];
                }
                console.log('Calling Gemini image generation model...');
                const model = await AiModel.findOne({
                    where: {
                        type: 'gemini',
                        isDefault: true
                    }
                });
                const response = await genAI.models.generateContent({
                    contents: contents,
                    model: model.name,
                    config: {
                        responseModalities: ["Text", "Image"],
                    },
                });
                console.log('Gemini image generation result:', response);
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const fileName = `gemini-generated-${Date.now()}.png`;
                        const filePath = `./uploads/images/${fileName}`;
                        await fs.promises.mkdir('./uploads/images', { recursive: true });
                        await fs.promises.writeFile(filePath, Buffer.from(part.inlineData.data, 'base64'));
                        console.log('Image saved to local storage:', filePath);
                        const serverUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3001';
                        const imageUrl = `${serverUrl}/uploads/images/${fileName}`;
                        return `Image generated successfully with enhanced description. URL: ${imageUrl}\nGenerated Description: ${enhancedPrompt}`;
                    }
                    else if (part.text) {
                        return `Text response: ${part.text}`;
                    }
                }
                return "No image or text data in response";
            }
            catch (error) {
                console.error('Failed to generate with Gemini:', error);
                return `Failed to generate: ${error.message}`;
            }
        }, {
            name: "product_photography",
            description: "Generate an image or modify an existing image using Google's Gemini model. Can be used for product photography requests or image editing.",
            schema: z.object({
                prompt: z.string().describe("The text description or instruction for image generation/editing"),
                image_url: z.string().optional().describe("Path to the input image file or URL (optional)")
            }),
        });
        const speech_to_text = tool(async ({ audio_url }) => {
            console.log('Speech to text tool called with:', { audio_url });
            try {
                const replicate = this.replicate;
                const model = await AiModel.findOne({
                    where: {
                        type: 'audio-to-text',
                        isDefault: true
                    }
                });
                console.log(`Calling ${model.name} model...`);
                const output = await replicate.run(model.name, {
                    input: {
                        audio: audio_url
                    }
                });
                console.log('Speech to text conversion completed:', output);
                return `Transcription: ${output.transcription || output}`;
            }
            catch (error) {
                console.error('Failed to convert speech to text:', error);
                return `Failed to convert speech to text: ${error.message}`;
            }
        }, {
            name: "speech_to_text",
            description: "Convert speech audio to text using Whisper model. Supports various audio formats.",
            schema: z.object({
                audio_url: z.string().describe("URL of the audio file to transcribe")
            }),
        });
        const image_to_video = tool(async ({ image_url, prompt, motion_scale = 1, num_frames = 50, fps = 6, userId = null }) => {
            console.log('Image to video tool called with:', { image_url, motion_scale, num_frames, fps, userId });
            try {
                const model = await AiModel.findOne({
                    where: {
                        type: 'image-to-video',
                        isDefault: true
                    }
                });
                const settings = await this.getUserSettings(userId);
                const videoSettings = settings.video;
                console.log('Using video settings:', videoSettings);
                console.log("model", model);
                console.log(`Calling ${model.name} model...`);
                const result = await fal.subscribe(model.name, {
                    input: {
                        image_url: image_url,
                        duration: videoSettings.duration,
                        prompt: prompt,
                        aspect_ratio: videoSettings.aspectRatio,
                    },
                    logs: true,
                    onQueueUpdate: (update) => {
                        if (update.status === "IN_PROGRESS") {
                            console.log('Video generation progress update:', update.status);
                            update.logs.map((log) => log.message).forEach(console.log);
                        }
                    }
                });
                if (result && result.data && result.data.video.url) {
                    const videoUrl = result.data.video.url;
                    console.log('Video generated successfully, downloading to local storage...');
                    try {
                        const savedFile = await downloadAndSaveFile(videoUrl, 'video');
                        console.log('Video saved to local storage:', savedFile);
                        return `Video generated successfully. URL: ${savedFile.localUrl}`;
                    }
                    catch (downloadError) {
                        console.error('Failed to save video to local storage:', downloadError);
                        return `Video generated successfully. URL: ${videoUrl}`;
                    }
                }
                else {
                    console.error('No video data in response');
                    return "Failed to generate video: No video data in response";
                }
            }
            catch (error) {
                console.error('Failed to generate video:', error);
                return `Failed to generate video: ${error.message}`;
            }
        }, {
            name: "image_to_video",
            description: "Convert a still image into a video with motion using Fal AI. The model will animate the image to create a short video.",
            schema: z.object({
                image_url: z.string().describe("URL of the image to convert to video"),
                motion_scale: z.number().optional().describe("Scale of motion in the generated video (default: 1)"),
                num_frames: z.number().optional().describe("Number of frames to generate"),
                fps: z.number().optional().describe("Frames per second for the output video"),
                userId: z.string().optional().describe("User ID"),
                prompt: z.string().optional().describe("Prompt for the video generation")
            }),
        });
        console.log('All tools setup completed');
        return [
            deduct_credits,
            prompt_generator,
            generate_completions,
            generate_image,
            generate_video,
            image_to_image,
            generate_music,
            image_to_3d,
            voice_cloner,
            image_to_text,
            generate_code,
            product_photography,
            speech_to_text,
            image_to_video
        ];
    }
    async llmCall(state) {
        console.log('LLM call initiated with state:', JSON.stringify(state, null, 2));
        if (!this.isInitialized || !this.llmWithTools) {
            console.log('Services not initialized, initializing...');
            await this.initialize();
        }
        const systemPrompt = `You are a helpful AI assistant that can perform multiple tasks. 
For each user request, analyze it carefully and choose the most appropriate tool:
- Use 'generate_completions' for all text generation including long-form content, articles, stories, code, and explanations
- Use other tools only for their specific purposes (image/video/audio generation and transformations)
- Use 'product_photography' for product photography requests.

IMPORTANT: Before executing any tool, you MUST call the 'deduct_credits' tool with the following parameters:
1. toolName: The name of the tool you're about to use
2. params: {
   userId: The user's ID from state.metadata.userId
   duration: (for video tools) The duration in seconds
   num_frames: (for video tools) The number of frames
   fps: (for video tools) The frames per second
}
3. tokenInfo: (for text-based tools) {
   promptTokens: The number of prompt tokens used
   completionTokens: The number of completion tokens used
}

Only proceed with the tool execution if the credit deduction is successful (success: true).
If credit deduction fails (success: false), inform the user about the insufficient credits and stop execution.

Always return responses in JSON format: { message: <string>, imageUrl: <string>, videoUrl: <string>, audioUrl: <string>, code: <string> }`;
        console.log('Invoking LLM with tools...');
        const result = await this.llmWithTools.invoke([
            {
                role: "system",
                content: systemPrompt
            },
            ...state.messages,
        ]);
        const usage = result?.response_metadata?.usage || {
            prompt_tokens: result?.usage_metadata?.input_tokens || 0,
            completion_tokens: result?.usage_metadata?.output_tokens || 0,
            total_tokens: result?.usage_metadata?.total_tokens || 0,
            tool_calls: result?.tool_calls?.length || 0
        };
        console.log('LLM call completed');
        return {
            messages: [result],
            usage
        };
    }
    async toolNode(state) {
        console.log('Tool node execution started');
        if (!this.isInitialized) {
            console.log('Services not initialized, initializing...');
            await this.initialize();
        }
        const results = [];
        const lastMessage = state.messages.at(-1);
        const callbacks = state.callbacks?.[0];
        const userId = state.metadata?.userId;
        if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            console.log(`Processing ${lastMessage.tool_calls.length} tool calls`);
            for (const toolCall of lastMessage.tool_calls) {
                const toolCallId = String(toolCall.id);
                const tool = this.toolsByName[toolCall.name];
                if (!tool) {
                    console.error(`Tool "${toolCall.name}" not found`);
                    const errorMessage = `I apologize, but I encountered an error: The tool "${toolCall.name}" is not available. Please try a different approach.`;
                    const toolMessage = new ToolMessage({
                        content: errorMessage,
                        tool_call_id: toolCallId,
                    });
                    results.push(toolMessage);
                    continue;
                }
                console.log(`Executing tool: ${toolCall.name}`);
                if (callbacks?.handleToolStart) {
                    callbacks.handleToolStart({
                        name: toolCall.name,
                        input: toolCall.args
                    });
                }
                try {
                    console.log(`Invoking tool ${toolCall.name} with args:`, toolCall.args);
                    const observation = await tool.invoke(toolCall.args);
                    if (callbacks?.handleToolEnd) {
                        callbacks.handleToolEnd({
                            name: toolCall.name,
                            output: observation
                        });
                    }
                    console.log(`Tool ${toolCall.name} execution completed`);
                    const toolMessage = new ToolMessage({
                        content: observation,
                        tool_call_id: toolCallId,
                    });
                    results.push(toolMessage);
                }
                catch (error) {
                    console.error(`Tool ${toolCall.name} execution failed:`, error);
                    const errorDetails = {
                        toolName: toolCall.name,
                        errorType: error.name,
                        errorMessage: error.message,
                        errorStack: error.stack,
                        args: toolCall.args
                    };
                    if (callbacks?.handleToolError) {
                        callbacks.handleToolError({
                            name: toolCall.name,
                            error: error
                        });
                    }
                    const toolMessage = new ToolMessage({
                        content: JSON.stringify(errorDetails),
                        tool_call_id: toolCallId,
                    });
                    results.push(toolMessage);
                }
            }
        }
        console.log('Tool node execution completed');
        return { messages: results };
    }
    shouldContinue(state) {
        console.log('Checking if agent should continue...');
        const lastMessage = state.messages.at(-1);
        const callbacks = state.callbacks?.[0];
        if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            console.log('Agent has more tools to execute');
            if (callbacks?.handleAgentAction) {
                callbacks.handleAgentAction({
                    status: "executing_tools",
                    tools: lastMessage.tool_calls.map(call => call.name)
                });
            }
            return "tools";
        }
        console.log('Agent execution completed');
        if (callbacks?.handleAgentAction) {
            callbacks.handleAgentAction({
                status: "completed"
            });
        }
        return "__end__";
    }
    async buildAgent() {
        console.log('Building agent...');
        const agentBuilder = new StateGraph(MessagesAnnotation)
            .addNode("llmCall", async (state) => {
            console.log('Executing LLM call node');
            const result = await this.llmCall(state);
            if (state.callbacks?.[0]?.handleLLMEnd) {
                state.callbacks[0].handleLLMEnd({
                    output: result.messages[0].content
                });
            }
            return result;
        })
            .addNode("tools", this.toolNode.bind(this))
            .addEdge("__start__", "llmCall")
            .addConditionalEdges("llmCall", this.shouldContinue.bind(this), {
            tools: "tools",
            __end__: "__end__",
        })
            .addEdge("tools", "llmCall")
            .compile();
        console.log('Agent built successfully');
        return agentBuilder;
    }
    async runAgent(message, fileInfo, userSettings, userId, chatId) {
        console.log('Running agent with prompt:', message);
        await this.initialize();
        console.log('Building agent...');
        console.log('Fetching chat history for chatId:', chatId);
        let chatHistory = [];
        if (chatId) {
            try {
                const { Message } = await import('../models/index.js');
                chatHistory = await Message.findAll({
                    where: {
                        chatId: chatId
                    },
                    order: [['createdAt', 'ASC']],
                    attributes: ['content', 'role']
                });
                chatHistory = chatHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }));
                console.log(`Found ${chatHistory.length} previous messages in chat history`);
            }
            catch (error) {
                console.error('Error fetching chat history:', error);
            }
        }
        const openaiSettings = await ApiSetting.findOne({
            where: { serviceName: 'Openai' }
        });
        const baseSystemPrompt = openaiSettings.systemPrompt || '';
        const mandatoryPrompt = `You are a helpful AI assistant that can perform multiple tasks.
USER SETTINGS: ${JSON.stringify(userSettings)}
USER ID: ${userId}

Key instructions:
1. For all text generation (long-form content, articles, stories, code, explanations), use 'generate_completions'
2. For dedicated code generation, use 'generate_code' and the result will automatically be placed in the code field of your response
3. For image/video/audio generation and transformations, use the specific tools
4. Always enhance prompts before generating images or videos
5. When working with images, consider using image_to_image for creative transformations.

${baseSystemPrompt}

Provide the JSON object directly without any backticks or formatting. Response format: { message: <string>, imageUrl: <string>, videoUrl: <string>, audioUrl: <string>, modelUrl: <string>, code: <string> }`;
        const finalPrompt = fileInfo
            ? `${mandatoryPrompt}\nFILE CONTEXT: ${fileInfo.serverPath}`
            : mandatoryPrompt;
        const agent = await this.buildAgent();
        const messages = [
            {
                role: "system",
                content: finalPrompt
            },
            ...chatHistory,
            {
                role: "user",
                content: message
            }
        ];
        console.log(messages);
        try {
            console.log('Invoking agent with messages including chat history');
            const result = await agent.invoke({
                messages,
                metadata: { userId, chatId }
            });
            console.log('Agent execution completed, formatting final message');
            let finalMessage = result.messages[result.messages.length - 1].content;
            let responseObject;
            try {
                responseObject = typeof finalMessage === 'string' ? JSON.parse(finalMessage) : finalMessage;
            }
            catch (parseError) {
                responseObject = {
                    message: finalMessage,
                    imageUrl: null,
                    videoUrl: null,
                    audioUrl: null,
                    modelUrl: null,
                    code: null
                };
            }
            let totalPromptTokens = 0;
            let totalCompletionTokens = 0;
            let totalToolCalls = 0;
            result.messages.forEach(msg => {
                if (msg?.response_metadata?.usage) {
                    totalPromptTokens += msg.response_metadata.usage.prompt_tokens || 0;
                    totalCompletionTokens += msg.response_metadata.usage.completion_tokens || 0;
                }
                if (msg?.tool_calls) {
                    totalToolCalls += msg.tool_calls.length;
                }
            });
            responseObject = {
                message: responseObject.message || '',
                imageUrl: responseObject.imageUrl || null,
                videoUrl: responseObject.videoUrl || null,
                audioUrl: responseObject.audioUrl || null,
                modelUrl: responseObject.modelUrl || null,
                code: responseObject.code || null,
                timestamp: new Date().toISOString(),
                usage: {
                    prompt_tokens: totalPromptTokens,
                    completion_tokens: totalCompletionTokens,
                    total_tokens: totalPromptTokens + totalCompletionTokens,
                    tool_calls: totalToolCalls
                }
            };
            return responseObject;
        }
        catch (error) {
            console.error('Agent execution error:', error);
            const errorResponse = {
                message: `I apologize, but I encountered an error while processing your request: ${error.message}. Please try again or rephrase your request.`,
                imageUrl: null,
                videoUrl: null,
                audioUrl: null,
                modelUrl: null,
                code: null,
                timestamp: new Date().toISOString(),
                usage: {
                    prompt_tokens: 0,
                    completion_tokens: 0,
                    total_tokens: 0,
                    tool_calls: 0
                }
            };
            return JSON.stringify(errorResponse, null, 2);
        }
    }
    async getChatTitle(message) {
        console.log('Getting chat title for message:', message);
        try {
            if (!this.isInitialized || !this.llm) {
                console.log('Services not initialized, initializing...');
                await this.initialize();
            }
            const systemPrompt = `Analyze the following message and generate a concise, meaningful title (maximum 6 words) that captures the essence of what the conversation will be about. The title should be descriptive but brief. Return only the title text, nothing else.

For example:
If message is "Can you help me build a weather app using React?" -> "React Weather App Development"
If message is "Write a poem about sunset" -> "Sunset Poetry Creation"
If message is "How do I implement authentication in Node.js?" -> "Node.js Authentication Implementation"`;
            console.log('Invoking LLM for chat title...');
            const response = await this.llm.invoke([
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: "user",
                    content: message
                }
            ]);
            console.log('Chat title generated successfully');
            return response.content.trim();
        }
        catch (error) {
            console.error('Error getting chat title:', error);
            throw error;
        }
    }
    async inPainting(imageBuffer, prompt, userId = null, maskBuffer = null) {
        console.log('InPainting image with prompt:', prompt);
        try {
            if (!this.isInitialized || !this.llm) {
                console.log('Services not initialized, initializing...');
                await this.initialize();
            }
            const openaiSettings = await ApiSetting.findOne({
                where: { serviceName: 'Openai' }
            });
            if (!openaiSettings) {
                throw new Error('OpenAI settings not found in database');
            }
            const client = new OpenAI({
                apiKey: openaiSettings.apiKey
            });
            const image = await toFile(imageBuffer, null, {
                type: "image/png",
            });
            const model = await AiModel.findOne({
                where: {
                    name: "gpt-image-1"
                }
            });
            if (!model) {
                throw new Error('Model not found');
            }
            const requestParams = {
                model: model.name,
                image: image,
                prompt: prompt,
            };
            if (maskBuffer) {
                console.log('Using mask for inpainting');
                const mask = await toFile(maskBuffer, null, {
                    type: "image/png",
                });
            }
            const response = await client.images.edit(requestParams);
            if (!response.data || !response.data[0]?.b64_json) {
                throw new Error('No image data in response');
            }
            const imageBytes = Buffer.from(response.data[0].b64_json, 'base64');
            const fileName = `edited-${Date.now()}.png`;
            const filePath = `./uploads/images/${fileName}`;
            await fs.promises.mkdir('./uploads/images', { recursive: true });
            await fs.promises.writeFile(filePath, imageBytes);
            const serverUrl = process.env.BACKEND_BASE_URL || 'http://localhost:3001';
            const outputImageUrl = `${serverUrl}/uploads/images/${fileName}`;
            if (userId) {
                const servicePricing = await ServicePricing.findOne({
                    where: {
                        serviceIdentifier: 'inpaint_image',
                    }
                });
                if (!servicePricing) {
                    console.log('No active pricing found for inpainting');
                }
                else {
                    const user = await User.findByPk(userId);
                    if (!user) {
                        console.log(`User ${userId} not found`);
                    }
                    else {
                        const creditsToDeduct = servicePricing.price;
                        if (user.credits < creditsToDeduct) {
                            throw new Error('Insufficient credits');
                        }
                        user.credits -= creditsToDeduct;
                        await user.save();
                        await Usage.create({
                            userId: userId,
                            toolCalls: 1,
                            toolUsage: JSON.stringify([{
                                    toolName: 'inpaint_image',
                                    credits: creditsToDeduct,
                                    unit: servicePricing.unit
                                }]),
                            creditsUsed: creditsToDeduct
                        });
                        console.log(`Successfully deducted ${creditsToDeduct} credits. User now has ${user.credits} credits.`);
                    }
                }
            }
            console.log('Image editing completed successfully');
            return {
                data: {
                    images: [{
                            url: outputImageUrl
                        }]
                },
                requestId: Date.now().toString()
            };
        }
        catch (error) {
            console.error('Error editing image:', error);
            throw error;
        }
    }
    async getSuggestions(systemPrompt) {
        console.log('Getting suggestions with system prompt:', systemPrompt);
        try {
            if (!this.isInitialized || !this.llm) {
                console.log('Services not initialized, initializing...');
                await this.initialize();
            }
            console.log('Invoking LLM for suggestions...');
            const response = await this.llm.invoke([
                {
                    role: "system",
                    content: systemPrompt
                }
            ]);
            console.log('Suggestions generated successfully');
            return response.content;
        }
        catch (error) {
            console.error('Error getting suggestions:', error);
            throw error;
        }
    }
    async getUserSettings(userId, category = 'General') {
        console.log('Fetching user settings for userId:', userId, 'category:', category);
        try {
            const userSettings = await UserSetting.findOne({
                where: { userId, category }
            });
            console.log('User settings:', userSettings);
            if (!userSettings) {
                console.log('No user settings found, using defaults');
                return {
                    image: {
                        width: 1024,
                        height: 1024,
                        steps: 30
                    },
                    video: {
                        width: 1024,
                        height: 576,
                        numFrames: 50,
                        fps: 6
                    }
                };
            }
            return {
                image: userSettings.imageSetting,
                video: userSettings.videoSetting
            };
        }
        catch (error) {
            console.error('Error fetching user settings:', error);
            throw error;
        }
    }
}
export const appService = new AppService();
