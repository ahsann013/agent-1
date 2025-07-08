declare class UserController {
    static getAllUsers(req: any, res: any): Promise<void>;
    static getUserById(req: any, res: any): Promise<any>;
    static createUser(req: any, res: any): Promise<any>;
    static updateUser(req: any, res: any): Promise<any>;
    static deleteUser(req: any, res: any): Promise<any>;
    static restoreUser(req: any, res: any): Promise<any>;
    static sendContactEmail(req: any, res: any): Promise<void>;
    static getCredits(req: any, res: any): Promise<any>;
    static getTotalUsers(): Promise<number>;
    static getActiveUsers(): Promise<number>;
}
export default UserController;
