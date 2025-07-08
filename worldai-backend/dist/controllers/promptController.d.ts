declare class PromptController {
    static getAllPrompts(req: any, res: any): Promise<void>;
    static getActivePrompts(req: any, res: any): Promise<void>;
    static getPromptById(req: any, res: any): Promise<any>;
    static createPrompt(req: any, res: any): Promise<any>;
    static updatePrompt(req: any, res: any): Promise<any>;
    static deletePrompt(req: any, res: any): Promise<any>;
    static togglePromptStatus(req: any, res: any): Promise<any>;
}
export default PromptController;
