declare const adminController: {
    getDashboardStats: (req: any, res: any) => Promise<void>;
    getRecentTransactions: (req: any, res: any) => Promise<void>;
};
export default adminController;
