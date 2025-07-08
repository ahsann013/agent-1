import { tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { ToolMessage, AIMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
import { fal, } from '@fal-ai/client';
import { ApiSetting, UserSetting, AiModel } from '../models/index.js';
import { downloadAndSaveFile } from '../utils/fileHandler.js';
import Replicate from 'replicate';
import { writeFile } from "node:fs/promises";
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
            console.log("Replicate AI SETTINGS", replicateSettings);
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
    setupTools() {
        console.log('Setting up AI tools...');
        const prompt_generator = tool(async ({ prompt }) => {
            console.log('Prompt generator tool called with prompt:', prompt);
            const enhancedPrompt = await this.llm.invoke([
                {
                    role: "system",
                    content: "You are an expert at creating detailed, vivid prompts for text-to-image AI systems. Enhance the given prompt to include more details about lighting, style, composition, colors, and mood. Keep the core intent of the original prompt but make it more specific and visually descriptive."
                },
                {
                    role: "user",
                    content: `Enhance this image generation prompt: "${prompt}"`
                }
            ]);
            console.log('Enhanced prompt generated:', enhancedPrompt.content);
            return `Enhanced prompt: ${enhancedPrompt.content}`;
        }, {
            name: "prompt_generator",
            description: "Enhances a text prompt to make it more suitable for image generation",
            schema: z.object({
                prompt: z.string().describe("The original text prompt to enhance"),
            }),
        });
        const generate_completions = tool(async ({ prompt }) => {
            console.log('Generate completions tool called with prompt:', prompt);
            try {
                if (!this.llm) {
                    console.log('LLM not initialized, initializing...');
                    await this.initialize();
                }
                let response = "";
                console.log('Starting completion stream...');
                const stream = await this.llm.stream([
                    {
                        role: "user",
                        content: prompt
                    }
                ]);
                console.log('Processing stream chunks...');
                for await (const chunk of stream) {
                    if (chunk.content) {
                        response += chunk.content;
                    }
                }
                console.log('Completion generation finished');
                return response;
            }
            catch (error) {
                console.error('Failed to generate completion:', error);
                return `Failed to generate completion: ${error.message}`;
            }
        }, {
            name: "generate_completions",
            description: "Generate text completions using GPT model. Use this for general text generation, questions, coding, and other text-based tasks. For image or video generation, use the specific tools instead.",
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
                        aspect_ratio: videoSettings.aspectRatio.toString(),
                        duration: videoSettings.duration + "s",
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
        const image_to_image = tool(async ({ prompt, image_url, strength = 0.75, width, height, steps, userId = null }) => {
            console.log('Image to image tool called with:', { prompt, image_url, strength, width, height, steps, userId });
            try {
                const settings = await this.getUserSettings(userId);
                const imageSettings = settings.image;
                console.log('Using image settings:', imageSettings);
                console.log('Calling Fal AI image-to-image model...');
                const result = await fal.run('fal-ai/flux/dev', {
                    input: {
                        prompt: prompt,
                        image_url: image_url,
                        strength: strength,
                        negative_prompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy",
                        width: width || imageSettings.width,
                        height: height || imageSettings.height,
                        num_inference_steps: steps || imageSettings.steps,
                    },
                    logs: true,
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
            name: "image_to_image",
            description: "Generate a new image based on an input image and text prompt using Fal AI",
            schema: z.object({
                prompt: z.string().describe("The text description to guide the image transformation"),
                image_url: z.string().describe("URL of the input image to transform"),
                strength: z.number().optional().describe("Strength of the transformation (0-1)"),
                width: z.number().optional().describe("Output image width in pixels"),
                height: z.number().optional().describe("Output image height in pixels"),
                steps: z.number().optional().describe("Number of inference steps"),
            }),
        });
        const enhance_image = tool(async ({ image_url, enhancement_type = "quality", width, height }) => {
            console.log('Enhance image tool called with:', { image_url, enhancement_type, width, height });
            try {
                const settings = await this.getUserSettings(userId, category);
                const imageSettings = settings.image;
                console.log('Using image settings:', imageSettings);
                console.log('Calling Fal AI image enhancement model...');
                const result = await fal.run('fal-ai/flux/dev', {
                    input: {
                        image_url: image_url,
                        prompt: enhancement_type === "quality" ?
                            "enhance quality, sharp details, clear image, high resolution" :
                            "artistic enhancement, beautiful lighting, professional photography",
                        strength: 0.6,
                        negative_prompt: "low quality, blurry, distorted",
                        width: width || imageSettings.width,
                        height: height || imageSettings.height,
                    },
                    logs: true,
                    onQueueUpdate: (update) => {
                        if (update.status === "IN_PROGRESS") {
                            console.log('Image enhancement progress update:', update.status);
                            update.logs.map((log) => log.message).forEach(console.log);
                        }
                    }
                });
                console.log('Image enhancement completed');
                if (result && result.data && result.data.images[0]) {
                    return `Image enhanced successfully. URL: ${result.data.images[0].url}`;
                }
                else {
                    console.error('No image data in response');
                    return "Failed to enhance image: No image data in response";
                }
            }
            catch (error) {
                console.error('Failed to enhance image:', error);
                return `Failed to enhance image: ${error.message}`;
            }
        }, {
            name: "enhance_image",
            description: "Enhance an existing image using Fal AI",
            schema: z.object({
                image_url: z.string().describe("URL of the image to enhance"),
                enhancement_type: z.enum(["quality", "artistic"]).optional().describe("Type of enhancement to apply"),
                width: z.number().optional().describe("Output image width in pixels"),
                height: z.number().optional().describe("Output image height in pixels"),
                userId: z.string().describe("User ID"),
                category: z.string().describe("Category"),
            }),
        });
        const generate_music = tool(async ({ prompt, duration = 8, temperature = 1, model_version = "stereo-large" }) => {
            console.log('Generate music tool called with:', { prompt, duration, temperature, model_version });
            try {
                const replicate = this.replicate;
                console.log('Calling Replicate MusicGen model...');
                const input = {
                    prompt: "Edo25 major g melodies that sound triumphant and cinematic. Leading up to a crescendo that resolves in a 9th harmonic",
                    model_version: "stereo-large",
                    output_format: "mp3",
                    normalization_strategy: "peak"
                };
                const output = await replicate.run("meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb", { input });
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
                const input = {
                    image: image_url
                };
                const output = await replicate.run("ndreca/hunyuan3d-2:a8cd3fb14fa42dd2d0160f33717ea7850074b742afd36d861f41d44ca916cec0", { input });
                console.log("3D model output:", output);
                if (output) {
                    console.log('3D model generated successfully');
                    return `3D model generated successfully. URL: ${output}`;
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
                console.log('Calling Replicate XTTS-v2 model...');
                const output = await replicate.run("lucataco/xtts-v2:684bc3855b37866c0c65add2ff39c78f3dea3f4ff103a436465326e0f438d55e", {
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
        console.log('All tools setup completed');
        return [
            prompt_generator,
            generate_completions,
            generate_image,
            generate_video,
            image_to_image,
            enhance_image,
            generate_music,
            image_to_3d,
            voice_cloner,
            image_to_text
        ];
    }
    async llmCall(state) {
        console.log('LLM call initiated with state:', JSON.stringify(state, null, 2));
        if (!this.isInitialized || !this.llmWithTools) {
            console.log('Services not initialized, initializing...');
            await this.initialize();
        }
        console.log('Invoking LLM with tools...');
        const result = await this.llmWithTools.invoke([
            {
                role: "system",
                content: `You are a helpful AI assistant that can perform multiple tasks:
1. Generate text completions using GPT for general questions, coding, and text-based tasks
2. Generate and enhance image prompts
3. Create images from text descriptions
4. Create videos from text descriptions
5. Transform images using image-to-image generation
6. Enhance image quality or apply artistic improvements
7. Convert images to 3D models
8. Analyze images and answer questions about them

For each user request, analyze it carefully and choose the most appropriate tool:
- Use 'generate_completions' for general questions, text generation, coding help, and other text-based tasks
- Use 'prompt_generator' to enhance image/video prompts before generation
- Use 'generate_image' for creating images from text descriptions
- Use 'generate_video' for creating videos from text descriptions
- Use 'image_to_image' for transforming existing images based on text prompts
- Use 'enhance_image' for improving image quality or applying artistic enhancements
- Use 'generate_music' for creating music based on text prompts
- Use 'image_to_3d' for converting images into 3D models
- Use 'voice_cloner' for cloning a voice and generating speech with the cloned voice
- Use 'image_to_text' for analyzing images and answering questions about them

Always enhance prompts before generating images or videos. For text-based queries, use generate_completions directly.
When working with images, consider using enhance_image for quality improvements or image_to_image for creative transformations.

The final message you send should be in json object only, ALWAYS even in the cases you cant help the response should be like this. JSON should be in the following format: { message: <string>, imageUrl: <string>, videoUrl: <string>, audioUrl: <string>, code: <string> }
`
            },
            ...state.messages,
        ]);
        console.log('LLM call completed');
        return { messages: [result] };
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
        const mandatoryPrompt = `
You are a helpful AI assistant that can perform multiple tasks:
1. Generate text completions using GPT for general questions, coding, and text-based tasks
2. Generate and enhance image prompts
3. Create images from text descriptions
4. Create videos from text descriptions
5. Transform images using image-to-image generation
6. Enhance image quality or apply artistic improvements
7. Convert images to 3D models
8. Analyze images and answer questions about them

For each user request, analyze it carefully and choose the most appropriate tool:
- Use 'generate_completions' for general questions, text generation, coding help, and other text-based tasks
- Use 'prompt_generator' to enhance image/video prompts before generation
- Use 'generate_image' for creating images from text descriptions
- Use 'generate_video' for creating videos from text descriptions
- Use 'image_to_image' for transforming existing images based on text prompts
- Use 'enhance_image' for improving image quality or applying artistic enhancements
- Use 'generate_music' for creating music based on text prompts
- Use 'image_to_3d' for converting images into 3D models
- Use 'voice_cloner' for cloning a voice and generating speech with the cloned voice
- Use 'image_to_text' for analyzing images and answering questions about them

USER SETTINGS: ${JSON.stringify(userSettings)}
USER ID: ${userId}

When using image or video generation tools, always pass the userId parameter to ensure proper user settings are applied.

${baseSystemPrompt}

Provide the JSON object directly without any backticks or formatting. Response format: { message: <string>, imageUrl: <string>, videoUrl: <string>, audioUrl: <string>, code: <string> }`;
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
                    code: null
                };
            }
            responseObject = {
                message: responseObject.message || '',
                imageUrl: responseObject.imageUrl || null,
                videoUrl: responseObject.videoUrl || null,
                audioUrl: responseObject.audioUrl || null,
                code: responseObject.code || null,
                timestamp: new Date().toISOString()
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
                code: null,
                timestamp: new Date().toISOString()
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
    async inPainting(imageUrl, maskUrl, prompt) {
        console.log('InPainting image:', imageUrl, 'with mask:', maskUrl, 'with prompt:', prompt);
        try {
            if (!this.isInitialized || !this.llm) {
                console.log('Services not initialized, initializing...');
                await this.initialize();
            }
            const falSettings = await ApiSetting.findOne({
                where: { serviceName: 'Fal' }
            });
            const falai = fal.config({
                credentials: falSettings.apiKey
            });
            const result = await fal.subscribe("fal-ai/flux-pro/v1/fill", {
                input: {
                    prompt: prompt,
                    image_url: imageUrl,
                    mask_url: maskUrl
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        update.logs.map((log) => log.message).forEach(console.log);
                    }
                },
            });
            console.log(result.data);
            console.log(result.requestId);
            console.log('InPainting completed successfully');
            return result;
        }
        catch (error) {
            console.error('Error inPainting:', error);
            throw error;
        }
    }
}
export const appService = new AppService();
