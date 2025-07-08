export declare class AppServiceOpenAI {
    constructor();
    initialize(): Promise<void>;
    getSystemPrompt(): string;
    setupTools(): ({
        type: string;
        function: {
            name: string;
            description: string;
            parameters: {
                type: string;
                properties: {
                    prompt: {
                        type: string;
                        description: string;
                    };
                    width?: undefined;
                    height?: undefined;
                    steps?: undefined;
                    num_frames?: undefined;
                    fps?: undefined;
                    image_url?: undefined;
                    strength?: undefined;
                    enhancement_type?: undefined;
                };
                required: string[];
            };
        };
    } | {
        type: string;
        function: {
            name: string;
            description: string;
            parameters: {
                type: string;
                properties: {
                    prompt: {
                        type: string;
                        description: string;
                    };
                    width: {
                        type: string;
                        description: string;
                    };
                    height: {
                        type: string;
                        description: string;
                    };
                    steps: {
                        type: string;
                        description: string;
                    };
                    num_frames?: undefined;
                    fps?: undefined;
                    image_url?: undefined;
                    strength?: undefined;
                    enhancement_type?: undefined;
                };
                required: string[];
            };
        };
    } | {
        type: string;
        function: {
            name: string;
            description: string;
            parameters: {
                type: string;
                properties: {
                    prompt: {
                        type: string;
                        description: string;
                    };
                    num_frames: {
                        type: string;
                        description: string;
                    };
                    fps: {
                        type: string;
                        description: string;
                    };
                    width: {
                        type: string;
                        description: string;
                    };
                    height: {
                        type: string;
                        description: string;
                    };
                    steps?: undefined;
                    image_url?: undefined;
                    strength?: undefined;
                    enhancement_type?: undefined;
                };
                required: string[];
            };
        };
    } | {
        type: string;
        function: {
            name: string;
            description: string;
            parameters: {
                type: string;
                properties: {
                    prompt: {
                        type: string;
                        description: string;
                    };
                    image_url: {
                        type: string;
                        description: string;
                    };
                    strength: {
                        type: string;
                        description: string;
                    };
                    width: {
                        type: string;
                        description: string;
                    };
                    height: {
                        type: string;
                        description: string;
                    };
                    steps: {
                        type: string;
                        description: string;
                    };
                    num_frames?: undefined;
                    fps?: undefined;
                    enhancement_type?: undefined;
                };
                required: string[];
            };
        };
    } | {
        type: string;
        function: {
            name: string;
            description: string;
            parameters: {
                type: string;
                properties: {
                    image_url: {
                        type: string;
                        description: string;
                    };
                    enhancement_type: {
                        type: string;
                        enum: string[];
                        description: string;
                    };
                    width: {
                        type: string;
                        description: string;
                    };
                    height: {
                        type: string;
                        description: string;
                    };
                    prompt?: undefined;
                    steps?: undefined;
                    num_frames?: undefined;
                    fps?: undefined;
                    strength?: undefined;
                };
                required: string[];
            };
        };
    })[];
    executeTool(toolName: any, args: any): Promise<string>;
    executePromptGenerator(prompt: any): Promise<string>;
    executeGenerateCompletions(prompt: any): Promise<string>;
    executeGenerateImage(prompt: any, width?: number, height?: number, steps?: number): Promise<string>;
    executeGenerateVideo(prompt: any, num_frames?: number, fps?: number, width?: number, height?: number): Promise<string>;
    executeImageToImage(prompt: any, image_url: any, strength?: number, width?: number, height?: number, steps?: number): Promise<string>;
    executeEnhanceImage(image_url: any, enhancement_type?: string, width?: number, height?: number): Promise<string>;
    runAgent(message: any, fileInfo: any, userId: any): Promise<string>;
    getChatTitle(message: any): Promise<any>;
    getSuggestions(systemPrompt: any): Promise<any>;
}
export declare const appServiceOpenAI: AppServiceOpenAI;
