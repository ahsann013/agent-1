declare class AuthController {
    static sendConfirmationEmail(user: any): Promise<void>;
    static createStripeCustomer(name: any, email: any): Promise<string>;
    static signup(req: any, res: any): Promise<any>;
    static verifyEmail(req: any, res: any): Promise<any>;
    static signin(req: any, res: any): Promise<any>;
    static forgotPassword(req: any, res: any): Promise<any>;
    static resetPassword(req: any, res: any): Promise<any>;
    static resendVerification(req: any, res: any): Promise<any>;
    static changePassword(req: any, res: any): Promise<any>;
    static enable2FA(req: any, res: any): Promise<any>;
    static send2FACode(req: any, res: any): Promise<any>;
    static verify2FALogin(req: any, res: any): Promise<any>;
    static resend2FACode(req: any, res: any): Promise<any>;
    static disable2FA(req: any, res: any): Promise<any>;
    static refreshToken(req: any, res: any): Promise<any>;
    static logout(req: any, res: any): Promise<void>;
    static updateProfile(req: any, res: any): Promise<any>;
    static verifyPassword(req: any, res: any): Promise<any>;
    static googleAuth(req: any, res: any): Promise<void>;
    static getProfile(req: any, res: any): Promise<any>;
    static getIP(req: any): any;
}
export default AuthController;
