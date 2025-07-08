import api from './api';

interface ServicePricingItem {
  id: number;
  name: string;
  description: string;
  price: number; // Price in credits
  unit: string;
  isActive?: boolean;
  serviceIdentifier?: string;
  categoryName?: string;
  lastUpdatedBy?: number;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

class PricingService {
  /**
   * Get all service pricing
   */
  static async getAllPricing(): Promise<ApiResponse> {
    try {
      const response = await api.get('/service-pricing');
     
      return response.data;
    } catch (error) {
      console.error('Error fetching service pricing:', error);
      throw error;
    }
  }

  /**
   * Get service pricing by ID
   */
  static async getPricingById(id: number): Promise<ApiResponse> {
    try {
      const response = await api.get(`/service-pricing/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching service pricing:', error);
      throw error;
    }
  }

  /**
   * Update service pricing (admin only)
   */
  static async updatePricing(id: number, pricingData: Partial<ServicePricingItem>): Promise<ApiResponse> {
    try {
      const response = await api.put(
        `/service-pricing/${id}`, 
        pricingData
      );
      return response.data;
    } catch (error) {
      console.error('Error updating service pricing:', error);
      throw error;
    }
  }

  /**
   * Update multiple service pricing items at once (admin only)
   */
  static async updateBatchPricing(pricingItems: Partial<ServicePricingItem>[]): Promise<ApiResponse> {
    try {
      const response = await api.put(
        `/service-pricing/batch/update`, 
        { pricingItems },

      );
      return response.data;
    } catch (error) {
      console.error('Error updating batch service pricing:', error);
      throw error;
    }
  }

  /**
   * Initialize default pricing (admin only)
   */
  static async initializeDefaultPricing(): Promise<ApiResponse> {
    try {
      const response = await api.post(
        `/service-pricing/initialize`,
      );
      return response.data;
    } catch (error) {
      console.error('Error initializing default pricing:', error);
      throw error;
    }
  }

  /**
   * Create new service pricing (admin only)
   */
  static async createPricing(pricingData: Omit<ServicePricingItem, 'id'>): Promise<ApiResponse> {
    try {
      const response = await api.post(
        `/service-pricing`,
        pricingData
      );
      return response.data;
    } catch (error) {
      console.error('Error creating service pricing:', error);
      throw error;
    }
  }
}

export default PricingService; 