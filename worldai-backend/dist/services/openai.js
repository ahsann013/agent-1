import { ChatOpenAI } from '@langchain/openai';
import dotenv from "dotenv";
import { fal } from '@fal-ai/client';
import { ApiSetting } from '../models/index.js';
import { downloadAndSaveFile } from '../utils/fileHandler.js';
dotenv.config();
let instance = null;
export class AppServiceOpenAI {
    constructor() {
        console.log('AppServiceOpenAI constructor called');
        if (instance) {
            console.log('Returning existing instance');
            return instance;
        }
        console.log('Creating new AppServiceOpenAI instance');
        this.openai = null;
        this.tools = null;
        this.isInitialized = false;
        instance = this;
        return instance;
    }
    async initialize() {
        console.log('Initializing AppServiceOpenAI...');
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
            if (!openaiSettings) {
                console.error('OpenAI settings not found in database');
                throw new Error('OpenAI settings not found in database');
            }
            if (!falSettings) {
                console.error('Fal AI settings not found in database');
                throw new Error('Fal AI settings not found in database');
            }
            console.log('Initializing OpenAI with model:', openaiSettings.model);
            this.openai = new ChatOpenAI({
                apiKey: openaiSettings.apiKey,
                modelName: openaiSettings.model || "gpt-4-turbo-preview",
            });
            console.log('Initializing Fal AI client...');
            console.log("FAL AI API KEY", falSettings.apiKey);
            fal.config({
                credentials: falSettings.apiKey
            });
            console.log('Setting up tools...');
            this.tools = this.setupTools();
            this.systemPrompt = openaiSettings.systemPrompt || this.getDefaultSystemPrompt();
            this.isInitialized = true;
            console.log('AppServiceOpenAI initialization completed successfully');
        }
        catch (error) {
            console.error('Error initializing services:', error);
            throw error;
        }
    }
    getSystemPrompt() {
        const dynamicPrompt = this.systemPrompt || '';
        const hardcodedPrompt = `
  You are an intelligent assistant capable of performing multiple tasks based on the user's natural language prompt. Analyze the input prompt carefully and select the appropriate tools to fulfill the request.
  
  The tools you can use are:
  1. 'generate_completions' for general text generation and coding help.
  2. 'prompt_generator' to improve and enhance image/video prompts.
  3. 'generate_image' to create images from text descriptions.
  4. 'generate_video' to create videos from text descriptions.
  5. 'image_to_image' to transform images based on text prompts.
  6. 'enhance_image' to improve image quality or apply artistic enhancements.
  
  You must always enhance image/video prompts before generation. For text-related requests, use 'generate_completions'. You should use multiple tools in combination to generate the best possible response.
  For Example for Image generation first enhance the prompt using 'prompt_generator' and then use 'generate_image' to generate the image.
  
  Please choose the correct tools, and the final response should be a JSON object containing:
  {
    message: <text response>,
    imageUrl: <image URL or empty string>,
    videoUrl: <video URL or empty string>,
    code: <code response or empty string>
  }
  
  In case of an error:
  1. Provide a clear explanation of why the task failed.
  2. Suggest alternative approaches where applicable.
  3. Always ensure the response is returned as a well-formed JSON object with the specified fields.
    `;
        return dynamicPrompt + hardcodedPrompt;
    }
    setupTools() {
        console.log('Setting up AI tools for OpenAI function calling...');
        const tools = [
            {
                type: "function",
                function: {
                    name: "prompt_generator",
                    description: "Enhances a text prompt to make it more suitable for image generation",
                    parameters: {
                        type: "object",
                        properties: {
                            prompt: {
                                type: "string",
                                description: "The original text prompt to enhance"
                            }
                        },
                        required: ["prompt"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "generate_completions",
                    description: "Generate text completions using GPT model. Use this for general text generation, questions, coding, and other text-based tasks. For image or video generation, use the specific tools instead.",
                    parameters: {
                        type: "object",
                        properties: {
                            prompt: {
                                type: "string",
                                description: "The text prompt to generate completion for"
                            }
                        },
                        required: ["prompt"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "generate_image",
                    description: "Generate an image based on a text prompt using Fal AI",
                    parameters: {
                        type: "object",
                        properties: {
                            prompt: {
                                type: "string",
                                description: "The text description of the image to generate"
                            },
                            width: {
                                type: "number",
                                description: "Image width in pixels"
                            },
                            height: {
                                type: "number",
                                description: "Image height in pixels"
                            },
                            steps: {
                                type: "number",
                                description: "Number of inference steps (higher = more detailed but slower)"
                            }
                        },
                        required: ["prompt"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "generate_video",
                    description: "Generate a video based on a text prompt using Fal AI's veo2 model",
                    parameters: {
                        type: "object",
                        properties: {
                            prompt: {
                                type: "string",
                                description: "The text description of the video to generate"
                            },
                            num_frames: {
                                type: "number",
                                description: "Number of frames to generate"
                            },
                            fps: {
                                type: "number",
                                description: "Frames per second for the output video"
                            },
                            width: {
                                type: "number",
                                description: "Video width in pixels"
                            },
                            height: {
                                type: "number",
                                description: "Video height in pixels"
                            }
                        },
                        required: ["prompt"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "image_to_image",
                    description: "Generate a new image based on an input image and text prompt using Fal AI",
                    parameters: {
                        type: "object",
                        properties: {
                            prompt: {
                                type: "string",
                                description: "The text description to guide the image transformation"
                            },
                            image_url: {
                                type: "string",
                                description: "URL of the input image to transform"
                            },
                            strength: {
                                type: "number",
                                description: "Strength of the transformation (0-1)"
                            },
                            width: {
                                type: "number",
                                description: "Output image width in pixels"
                            },
                            height: {
                                type: "number",
                                description: "Output image height in pixels"
                            },
                            steps: {
                                type: "number",
                                description: "Number of inference steps"
                            }
                        },
                        required: ["prompt", "image_url"]
                    }
                }
            },
            {
                type: "function",
                function: {
                    name: "enhance_image",
                    description: "Enhance an existing image using Fal AI",
                    parameters: {
                        type: "object",
                        properties: {
                            image_url: {
                                type: "string",
                                description: "URL of the image to enhance"
                            },
                            enhancement_type: {
                                type: "string",
                                enum: ["quality", "artistic"],
                                description: "Type of enhancement to apply"
                            },
                            width: {
                                type: "number",
                                description: "Output image width in pixels"
                            },
                            height: {
                                type: "number",
                                description: "Output image height in pixels"
                            }
                        },
                        required: ["image_url"]
                    }
                }
            }
        ];
        return tools;
    }
    async executeTool(toolName, args) {
        console.log(`Executing tool: ${toolName} with args:`, args);
        try {
            switch (toolName) {
                case "prompt_generator":
                    return await this.executePromptGenerator(args.prompt);
                case "generate_completions":
                    return await this.executeGenerateCompletions(args.prompt);
                case "generate_image":
                    return await this.executeGenerateImage(args.prompt, args.width, args.height, args.steps);
                case "generate_video":
                    return await this.executeGenerateVideo(args.prompt, args.num_frames, args.fps, args.width, args.height);
                case "image_to_image":
                    return await this.executeImageToImage(args.prompt, args.image_url, args.strength, args.width, args.height, args.steps);
                case "enhance_image":
                    return await this.executeEnhanceImage(args.image_url, args.enhancement_type, args.width, args.height);
                default:
                    throw new Error(`Unknown tool: ${toolName}`);
            }
        }
        catch (error) {
            console.error(`Error executing tool ${toolName}:`, error);
            return `Error executing ${toolName}: ${error.message}`;
        }
    }
    async executePromptGenerator(prompt) {
        console.log('Prompt generator tool called with prompt:', prompt);
        const enhancedPrompt = await this.openai.invoke([
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
    }
    async executeGenerateCompletions(prompt) {
        console.log('Generate completions tool called with prompt:', prompt);
        try {
            let response = "";
            console.log('Starting completion stream...');
            const stream = await this.openai.stream([
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
    }
    async executeGenerateImage(prompt, width = 1024, height = 1024, steps = 30) {
        console.log('Generate image tool called with:', { prompt, width, height, steps });
        try {
            console.log('Calling Fal AI stable-diffusion model...');
            const result = await fal.run('fal-ai/flux/dev', {
                input: {
                    prompt: prompt,
                    negative_prompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy",
                    width: width,
                    height: height,
                    num_inference_steps: steps,
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
    }
    async executeGenerateVideo(prompt, num_frames = 50, fps = 6, width = 1024, height = 576) {
        console.log('Generate video tool called with:', { prompt, num_frames, fps, width, height });
        try {
            console.log('Calling Fal AI veo2 model...');
            const result = await fal.subscribe('fal-ai/veo2', {
                input: {
                    prompt: prompt,
                    negative_prompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy",
                    num_frames: num_frames,
                    fps: fps,
                    width: width,
                    height: height,
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
    }
    async executeImageToImage(prompt, image_url, strength = 0.75, width = 1024, height = 1024, steps = 30) {
        console.log('Image to image tool called with:', { prompt, image_url, strength, width, height, steps });
        try {
            console.log('Calling Fal AI image-to-image model...');
            const result = await fal.run('fal-ai/flux/dev', {
                input: {
                    prompt: prompt,
                    image_url: image_url,
                    strength: strength,
                    negative_prompt: "low quality, blurry, distorted, deformed, ugly, bad anatomy",
                    width: width,
                    height: height,
                    num_inference_steps: steps,
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
    }
    async executeEnhanceImage(image_url, enhancement_type = "quality", width = 1024, height = 1024) {
        console.log('Enhance image tool called with:', { image_url, enhancement_type, width, height });
        try {
            console.log('Calling Fal AI image enhancement model...');
            const result = await fal.run('fal-ai/flux/dev', {
                input: {
                    image_url: image_url,
                    prompt: enhancement_type === "quality" ?
                        "enhance quality, sharp details, clear image, high resolution" :
                        "artistic enhancement, beautiful lighting, professional photography",
                    strength: 0.6,
                    negative_prompt: "low quality, blurry, distorted",
                    width: width,
                    height: height,
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
                const imageUrl = result.data.images[0].url;
                try {
                    const savedFile = await downloadAndSaveFile(imageUrl, 'image');
                    console.log('Enhanced image saved to local storage:', savedFile);
                    return `Image enhanced successfully. URL: ${savedFile.localUrl}`;
                }
                catch (downloadError) {
                    console.error('Failed to save enhanced image to local storage:', downloadError);
                    return `Image enhanced successfully. URL: ${imageUrl}`;
                }
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
    }
    async runAgent(message, fileInfo = null, userId) {
        console.log('Running OpenAI function calling agent with prompt:', message);
        await this.initialize();
        let systemPrompt = this.getSystemPrompt();
        if (fileInfo?.serverPath) {
            systemPrompt += `\nFile Url ${fileInfo.serverPath || ''}`;
        }
        systemPrompt += "\nProvide the JSON object directly without any backticks or formatting. I only need the raw JSON object as a response. Never use json keyword while sending the response. Do not wrap inside any codeblock.";
        try {
            console.log('Starting OpenAI function calling...');
            const initialResponse = await this.openai.chat.completions.create([
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ], {
                tools: this.tools,
                store: true,
                tool_choice: "auto"
            });
            let finalResponse = initialResponse;
            let responseContent = initialResponse.content || '';
            let imageUrl = null;
            let videoUrl = null;
            let toolResults = [];
            if (initialResponse.tool_calls && initialResponse.tool_calls.length > 0) {
                console.log(`Model requested ${initialResponse.tool_calls.length} tool calls`);
                for (const toolCall of initialResponse.tool_calls) {
                    const toolName = toolCall.function?.name || toolCall.name;
                    if (!toolName) {
                        console.error('Tool name is missing from tool call');
                        continue;
                    }
                    const args = typeof toolCall.function?.arguments === 'string'
                        ? JSON.parse(toolCall.function.arguments)
                        : toolCall.args || {};
                    console.log(`Executing tool ${toolName} with args:`, args);
                    const toolResult = await this.executeTool(toolName, args);
                    toolResults.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name: toolName,
                        content: toolResult
                    });
                    if (toolName === 'generate_image' || toolName === 'image_to_image' || toolName === 'enhance_image') {
                        const match = toolResult.match(/URL: (https?:\/\/[^\s]+)/);
                        if (match && match[1]) {
                            imageUrl = match[1];
                        }
                    }
                    else if (toolName === 'generate_video') {
                        const match = toolResult.match(/URL: (https?:\/\/[^\s]+)/);
                        if (match && match[1]) {
                            videoUrl = match[1];
                        }
                    }
                }
                if (toolResults.length > 0) {
                    const messagesForFinalResponse = [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: message },
                        initialResponse,
                        ...toolResults
                    ];
                    finalResponse = await this.openai.invoke(messagesForFinalResponse);
                    responseContent = finalResponse.content || '';
                }
            }
            let responseObject;
            try {
                responseObject = typeof responseContent === 'string' && responseContent.trim().startsWith('{') ?
                    JSON.parse(responseContent) : { message: responseContent };
            }
            catch (parseError) {
                console.log('Response is not valid JSON, creating standard response object');
                responseObject = { message: responseContent };
            }
            const finalResponseObject = {
                message: responseObject.message || responseContent,
                imageUrl: responseObject.imageUrl || imageUrl,
                videoUrl: responseObject.videoUrl || videoUrl,
                code: responseObject.code || null,
                timestamp: new Date().toISOString()
            };
            return JSON.stringify(finalResponseObject, null, 2);
        }
        catch (error) {
            console.error('Error running OpenAI function calling agent:', error);
            const errorResponse = {
                message: `I apologize, but I encountered an error while processing your request: ${error.message}. Please try again or rephrase your request.`,
                imageUrl: null,
                videoUrl: null,
                code: null,
                timestamp: new Date().toISOString()
            };
            return JSON.stringify(errorResponse, null, 2);
        }
    }
    async getChatTitle(message) {
        console.log('Getting chat title for message:', message);
        try {
            if (!this.isInitialized || !this.openai) {
                console.log('Services not initialized, initializing...');
                await this.initialize();
            }
            const systemPrompt = `Analyze the following message and generate a concise, meaningful title (maximum 6 words) that captures the essence of what the conversation will be about. The title should be descriptive but brief. Return only the title text, nothing else.

For example:
If message is "Can you help me build a weather app using React?" -> "React Weather App Development"
If message is "Write a poem about sunset" -> "Sunset Poetry Creation"
If message is "How do I implement authentication in Node.js?" -> "Node.js Authentication Implementation"`;
            console.log('Invoking OpenAI for chat title...');
            const response = await this.openai.invoke([
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
    async getSuggestions(systemPrompt) {
        console.log('Getting suggestions with system prompt:', systemPrompt);
        try {
            if (!this.isInitialized || !this.openai) {
                console.log('Services not initialized, initializing...');
                await this.initialize();
            }
            console.log('Invoking OpenAI for suggestions...');
            const response = await this.openai.invoke([
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
}
export const appServiceOpenAI = new AppServiceOpenAI();
