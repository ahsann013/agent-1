import api from "./api";

interface CheckoutSessionResponse {
  url: string;
}

interface Product {
  id: string;
  name: string;
  unitAmount: number;
  unitAmountDecimal: number;
  description: string;
  features: string[];
  priceId: string;
  featured: boolean;
  stripeProductId?: string;
  metadata: {
    credits?: number;
  }
  stripePriceId?: string;
  interval?: string;
  active: boolean;
  credits?: number;
}

interface CreateCustomerWithBalanceResponse {
  customer: any;
  balanceTransaction: any;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customer: {
    id: string;
    email: string;
    name: string;
  };
  payment_method_details?: any;
  description?: string;
}

const stripeService = {
  // Create checkout session
  createCheckoutSession: async (priceId: string): Promise<CheckoutSessionResponse> => {
    try {
      const response = await api.post("/stripe/create-checkout-session", { priceId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create checkout session");
    }
  },

  // Get available products
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get("/stripe/products");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch products");
    }
  },

  // Get transactions
  getTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await api.get("/stripe/transactions");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch transactions");
    }
  },

  // Create a new product
  createProduct: async (product: {
    name: string;
    description: string;
    unitAmount: number;
    currency?: string;
    interval?: string;
    features: string[];
    featured: boolean;
    credits?: number;
  }): Promise<Product> => {
    try {
      const response = await api.post("/stripe/products", product);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create product");
    }
  },

  // Update an existing product
  updateProduct: async (
    productId: string,
    product: {
      name?: string;
      description?: string;
      unitAmount?: number;
      currency?: string;
      interval?: string;
      features?: string[];
      featured?: boolean;
      credits?: number;
    }
  ): Promise<Product> => {
    try {
      const response = await api.put(`/stripe/products/${productId}`, product);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update product");
    }
  },

  // Create customer with balance
  createCustomerWithBalance: async (
    email: string,
    name: string,
    amount: number,
    currency: string = 'usd'
  ): Promise<CreateCustomerWithBalanceResponse> => {
    try {
      const response = await api.post("/stripe/create-customer-with-balance", {
        email,
        name,
        amount,
        currency
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to create customer with balance");
    }
  },

  // Toggle product active status
  toggleProductStatus: async (productId: string): Promise<Product> => {
    try {
      const response = await api.patch(`/stripe/products/${productId}/toggle-status`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to toggle product status");
    }
  },

  getSubscription: async (customerId: string): Promise<any> => {
    try {
      const response = await api.get(`/stripe/sub/${customerId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to fetch subscription");
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId: string): Promise<void> => {
    try {
      await api.post(`/stripe/sub/${subscriptionId}/cancel`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to cancel subscription");
    }
  },
};

export default stripeService;
