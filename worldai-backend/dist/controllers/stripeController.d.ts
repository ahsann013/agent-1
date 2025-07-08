import Stripe from "stripe";
declare class StripeController {
    static initializeStripe(): Promise<Stripe>;
    static getProducts(req: any, res: any): Promise<void>;
    static createProduct(req: any, res: any): Promise<any>;
    static updateProduct(req: any, res: any): Promise<any>;
    static getSubscription(req: any, res: any): Promise<any>;
    static createCheckoutSession(req: any, res: any): Promise<any>;
    static handleWebhook(req: any, res: any): Promise<any>;
    static handleCheckoutSessionCompletedWebhook(eventObject: any): Promise<void>;
    static handleInvoicePaymentSucceededWebhook(eventObject: any): Promise<void>;
    static handleSuccessfulPayment(req: any, res: any): Promise<any>;
    static handleSubscriptionCancelled(req: any, res: any): Promise<any>;
    static createCustomerWithBalance(req: any, res: any): Promise<any>;
    static getTransactions(req: any, res: any): Promise<any>;
    static toggleProductStatus(req: any, res: any): Promise<any>;
    static handleSubscriptionRenewal(invoice: any): Promise<void>;
    static handlePaymentFailed(invoice: any): Promise<void>;
    static addFreeMonthlyCredits(): Promise<number>;
    static getTotalRevenue(): Promise<number>;
    static getMonthlyRevenue(): Promise<number>;
}
export default StripeController;
