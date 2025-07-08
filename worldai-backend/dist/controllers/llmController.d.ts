declare class LLMController {
    static getAllModels(req: any, res: any): Promise<void>;
    static getModelById(req: any, res: any): Promise<any>;
    static createModel(req: any, res: any): Promise<any>;
    static updateModel(req: any, res: any): Promise<any>;
    static setDefaultModel(req: any, res: any): Promise<any>;
    static deleteModel(req: any, res: any): Promise<any>;
    static toggleModelStatus(req: any, res: any): Promise<any>;
}
export default LLMController;
