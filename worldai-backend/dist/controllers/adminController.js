import UserController from "./userController.js";
import StripeController from "./stripeController.js";
import UsageController from "./usageController.js";
const adminController = {
    getDashboardStats: async (req, res) => {
        try {
            const [totalUsers, activeUsers, totalRevenue, monthlyRevenue, totalCredits, totalUsage,] = await Promise.all([
                UserController.getTotalUsers(),
                UserController.getActiveUsers(),
                StripeController.getTotalRevenue(),
                StripeController.getMonthlyRevenue(),
                UsageController.getTotalCredits(),
                UsageController.getTotalUsage(),
            ]);
            res.json({
                success: true,
                data: {
                    totalUsers,
                    activeUsers,
                    totalRevenue,
                    monthlyRevenue,
                    totalCredits,
                    totalUsage,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
    getRecentTransactions: async (req, res) => {
        try {
            const transactions = await StripeController.getTransactions();
            res.json({
                success: true,
                data: transactions,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    },
};
export default adminController;
