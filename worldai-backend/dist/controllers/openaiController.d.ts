declare class OpenaiController {
    static extractJSON(responseText: any): any;
    static initializeModel(): Promise<{
        model: any;
        temperature: any;
        maxTokens: any;
    }>;
    static chat(req: any, res: any): Promise<void>;
    static function_calling(req: any, res: any): Promise<void>;
    static getSuggestions(req: any, res: any): Promise<void>;
    static getChatTitle(req: any, res: any): Promise<void>;
    static inPainting(req: any, res: any): Promise<void>;
}
export default OpenaiController;
