// API utility functions for PayMongo integration

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com' 
  : 'http://localhost:3000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('agaspay_token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    //wrapper
    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
 

  // Payment related API calls
  async getCurrentBill() {
    return await this.request('/api/v1/billing');
  }

    async getPayment() {
    return await this.request('/api/v1/payment');
  }

  



  async createPayment(paymentData) {
    return await this.request('/api/v1/payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  
async getCurrentReading() {
    return await this.request(`/api/v1/meter-reader}`);
  }

  async getPaymentStatus(paymentIntentId) {
    return await this.request(`/api/v1/payment/status/${paymentIntentId}`);
  }

  async getTransactionHistory() {
    return await this.request('/api/v1/payments/history');
  }

  async getBillingHistory() {
    return await this.request('/api/v1/billing/history');
  }

  // Resident account related API calls
  async getUserAccount() {
    return await this.request('/api/v1/user');
  }

  async getWaterUsage() {
    return await this.request('/api/v1/residents/usage');
  }

  async submitServiceRequest(requestData) {
    return await this.request('/api/v1/service-requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async getServiceRequests() {
    return await this.request('/api/v1/service-requests');
  }

  async getAnnouncements() {
    return await this.request('/api/v1/announcements/resident');
  }
}



export const apiClient = new ApiClient();
export default apiClient;