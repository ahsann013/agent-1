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
    }>>)[];
    llmCall(state: any): Promise<{
        messages: any[];
    }>;
    toolNode(state: any): Promise<{
        messages: any[];
    }>;
    shouldContinue(state: any): "tools" | "__end__";
    getSuggestions(systemPrompt: any): Promise<any>;
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
    inPainting(imageUrl: any, maskUrl: any, prompt: any): Promise<import("@fal-ai/client").Result<import("@fal-ai/client/endpoints").FluxProV1FillOutput>>;
}
export declare const appService: AppService;
