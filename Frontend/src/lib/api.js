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
 


async updatePaymentStatus(paymentId) {
  try {
    return await this.request(`/api/v1/payments/${paymentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      // no body needed unless you want to send extra data
    });
  } catch (error) {
    console.error("❌ Payment status update failed:", error);
    throw error;
  }
}


  //create billing api
  //send this api to the backend
async createBilling(billData) {
  try {
    return await this.request('/api/v1/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(billData),
    });
  } catch (error) {
    console.error("YAWA RA Billing creation failed:", error);
    throw error;
  }
}

async inputReading(requestData) {
  try {
    return await this.request('/api/v1/meter-reader', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });
  } catch (error) {
    console.error("YAWA RA inputing reading is failed failed:", error);
    throw error;
  }
}



async getRate() {
  try {
    return await this.request('/api/v1/rate');
  } catch (error) {
    console.error("Fetching rate failed:", error);
    throw error;
  }
}


async addRatingAmount(rateAmount) {
  try {
    return await this.request('/api/v1/rate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rateAmount),
    });
  } catch (error) {
    console.error("Billing creation failed:", error);
    throw error;
  }
}

  // Payment related API calls
  async getCurrentBill() {
    return await this.request('/api/v1/billing');
  }

  async getRecentPayment() {
   try {
    return await this.request('/api/v1/payment');
   } catch (error) {
    console.log("fetching getrecentpayment:", error);
    throw error;
   }
  }



//getwaterconnecitons
     async getWaterConnections() {
    return await this.request('/api/v1/water-connection');
  }

  //getlatestReading
    async getLatestReadings() {
    return await this.request('/api/v1/meter-reader/latest-readings');
  }

  // async inputReading(requestData) {
  //    return await this.request('/api/v1/meter-reader', {
  //     method: 'POST',
  //     body: JSON.stringify(requestData),
  //   });
  // } 
  


  async createPayment(paymentData) {
    return await this.request('/api/v1/payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }


 async getUserAccount() {
    return await this.request('/api/v1/user');
  }
  
async getCurrentReading() {
    return await this.request(`/api/v1/meter-reader}`);
  }

  // async getPaymentStatus(paymentIntentId) {
  //   return await this.request(`/api/v1/payment/status/${paymentIntentId}`);
  // }

  // async getTransactionHistory() {
  //   return await this.request('/api/v1/payments/history');
  // }

  // async getBillingHistory() {
  //   return await this.request('/api/v1/billing/history');
  // }

  // Resident account related API calls
 

  // async getWaterUsage() {
  //   return await this.request('/api/v1/residents/usage');
  // }

  // async submitServiceRequest(requestData) {
  //   return await this.request('/api/v1/service-requests', {
  //     method: 'POST',
  //     body: JSON.stringify(requestData),
  //   });
  // }

  // async getServiceRequests() {
  //   return await this.request('/api/v1/service-requests');
  // }

  // async getAnnouncements() {
  //   return await this.request('/api/v1/announcements/resident');
  // }
}



export const apiClient = new ApiClient();
export default apiClient;