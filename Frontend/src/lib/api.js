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
    return await this.request(`/api/v1/payment/${paymentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      // no body needed unless you want to send extra data
    });
  } catch (error) {
    console.error("❌ Payment status update failed:", error);
    throw error;
  }
}

 // Incident Reports API
  async createIncidentReport(reportData) {
    return await this.request('/api/v1/incident-report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
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

 async getOverdueBilling() {
   try {
    return await this.request('/api/v1/billing/overdue-billing');
   } catch (error) {
    console.log("fetching overdue billing:", error);
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

async sendOverdueReminder(billingId) {
  return await this.request('/api/v1/billing/send-reminder', {
    method: 'POST',
    body: JSON.stringify({ billingId }),
  });
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

// Update resident account (edit)
async updateResidentAccount(connectionId, updateData) {
  return await this.request(`/api/v1/water-connection/${connectionId}`, {
    method: 'PUT',
    body: JSON.stringify(updateData),
  });
}

  //getlatestReading
    async getLatestReadings() {
    return await this.request('/api/v1/meter-reader/latest-readings');
  }

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

  
}



export const apiClient = new ApiClient();
export default apiClient;