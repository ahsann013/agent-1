import api from "./api";

const adminDashboardService = {
  getDashboardStats: async () => {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  },
  getRecentTransactions: async () => {
    const response = await api.get("/admin/dashboard/transactions");
    return response.data;
  },
};

export default adminDashboardService;
