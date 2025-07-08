declare class FunctionController {
    static initializeService(): Promise<boolean>;
    static chat(req: any, res: any): Promise<void>;
    static function_calling(req: any, res: any): Promise<void>;
    static getSuggestions(req: any, res: any): Promise<void>;
    static getChatTitle(req: any, res: any): Promise<void>;
    static generateImage(req: any, res: any): Promise<void>;
    static generateVideo(req: any, res: any): Promise<void>;
    static enhanceImage(req: any, res: any): Promise<void>;
    static transformImage(req: any, res: any): Promise<void>;
    static enhancePrompt(req: any, res: any): Promise<void>;
}
export default FunctionController;
