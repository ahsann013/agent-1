import { z } from 'zod';
export declare class AppService {
    constructor();
    initialize(): Promise<void>;
    getUserSettings(userId: any, category?: string): Promise<{
        image: any;
        video: any;
    }>;
    setupTools(): (import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
        prompt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        prompt?: string;
    }, {
        prompt?: string;
    }>> | import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
        image_url: z.ZodString;
        enhancement_type: z.ZodOptional<z.ZodEnum<["quality", "artistic"]>>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        userId: z.ZodString;
        category: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        category?: string;
        userId?: string;
        width?: number;
        height?: number;
        image_url?: string;
        enhancement_type?: "quality" | "artistic";
    }, {
        category?: string;
        userId?: string;
        width?: number;
        height?: number;
        image_url?: string;
        enhancement_type?: "quality" | "artistic";
    }>>)[];
    llmCall(state: any): Promise<{
        messages: any[];
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
    runAgent(message: any, fileInfo: any, userSettings: any, userId: any, chatId: any): Promise<string | ReadableStream<any>>;
}
export declare const appService: AppService;
