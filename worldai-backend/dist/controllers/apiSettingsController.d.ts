declare class ApiSettingsController {
    static getAllApiSettings(req: any, res: any): Promise<void>;
    static getOpenAISettings(req: any, res: any): Promise<any>;
    static getReplicateSettings(req: any, res: any): Promise<any>;
    static updateFalAISettings(req: any, res: any): Promise<void>;
    static updateReplicateSettings(req: any, res: any): Promise<void>;
    static updateOpenAISettings(req: any, res: any): Promise<void>;
    static getAnthropicSettings(req: any, res: any): Promise<any>;
    static updateAnthropicSettings(req: any, res: any): Promise<void>;
    static getGeminiSettings(req: any, res: any): Promise<any>;
    static updateGeminiSettings(req: any, res: any): Promise<void>;
    static getStripeSettings(req: any, res: any): Promise<any>;
    static updateStripeSettings(req: any, res: any): Promise<void>;
}
export default ApiSettingsController;
