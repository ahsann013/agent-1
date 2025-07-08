export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCredits: number;
  totalUsage: number;
}

export interface Transaction {
  id: string;
  amount: number;
  status: string;
  created: number;
  user: {
    name: string;
    email: string;
  };
}