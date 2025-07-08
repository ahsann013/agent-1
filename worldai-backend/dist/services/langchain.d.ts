import { z } from 'zod';
export declare class AppService {
    constructor();
    initialize(): Promise<void>;
    setupTools(): (import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
        toolName: z.ZodString;
        params: z.ZodObject<{
            userId: z.ZodString;
            duration: z.ZodOptional<z.ZodNumber>;
            num_frames: z.ZodOptional<z.ZodNumber>;
            fps: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            userId?: string;
            duration?: number;
            num_frames?: number;
            fps?: number;
        }, {
            userId?: string;
            duration?: number;
            num_frames?: number;
            fps?: number;
        }>;
        tokenInfo: z.ZodOptional<z.ZodObject<{
            promptTokens: z.ZodOptional<z.ZodNumber>;
            completionTokens: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            promptTokens?: number;
            completionTokens?: number;
        }, {
            promptTokens?: number;
            completionTokens?: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        params?: {
            userId?: string;
            duration?: number;
            num_frames?: number;
            fps?: number;
        };
        toolName?: string;
        tokenInfo?: {
            promptTokens?: number;
            completionTokens?: number;
        };
    }, {
        params?: {
            userId?: string;
            duration?: number;
            num_frames?: number;
            fps?: number;
        };
        toolName?: string;
        tokenInfo?: {
            promptTokens?: number;
            completionTokens?: number;
        };
    }>> | import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
        prompt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        prompt?: string;
    }, {
        prompt?: string;
    }>> | import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
        image_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        image_url?: string;
    }, {
        image_url?: string;
    }>> | import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
        text: z.ZodString;
        speaker_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        text?: string;
        speaker_url?: string;
    }, {
        text?: string;
        speaker_url?: string;
    }>> | import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
        audio_url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        audio_url?: string;
    }, {
        audio_url?: string;
    }>>)[];
    llmCall(state: any): Promise<{
        messages: any[];
        usage: any;
    }>;
    toolNode(state: any): Promise<{
        messages: any[];
    }>;
    shouldContinue(state: any): "tools" | "__end__";
    buildAgent(): Promise<import("@langchain/langgraph").CompiledStateGraph<import("@langchain/langgraph").StateType<{
        messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/langgraph").Messages>;
    }>, import("@langchain/langgraph").UpdateType<{
        messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/langgraph").Messages>;
    }>, "tools" | "__start__" | "llmCall", {
        messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/langgraph").Messages>;
    }, {
        messages: import("@langchain/langgraph").BinaryOperatorAggregate<import("@langchain/core/messages").BaseMessage[], import("@langchain/langgraph").Messages>;
    }, import("@langchain/langgraph").StateDefinition>>;
    runAgent(message: any, fileInfo: any, userSettings: any, userId: any, chatId: any): Promise<any>;
    getChatTitle(message: any): Promise<any>;
    inPainting(imageBuffer: any, prompt: any, userId?: any, maskBuffer?: any): Promise<{
        data: {
            images: {
                url: string;
            }[];
        };
        requestId: string;
    }>;
    getSuggestions(systemPrompt: any): Promise<any>;
    getUserSettings(userId: any, category?: string): Promise<{
        image: any;
        video: any;
    }>;
}
export declare const appService: AppService;
