declare class UsageController {
    static getAllUsage(req: any, res: any): Promise<any>;
    static getUsageByUserId(req: any, res: any): Promise<any>;
    static getUsageById(req: any, res: any): Promise<any>;
    static getTotalCredits(): Promise<number>;
    static getTotalUsage(): Promise<number>;
}
export default UsageController;
