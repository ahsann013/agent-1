declare class SettingController {
    static getUserSettings(req: any, res: any): Promise<void>;
    static updateUserSettings(req: any, res: any): Promise<any>;
}
export default SettingController;
