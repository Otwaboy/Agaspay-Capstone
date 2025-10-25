// ======================================================
// 📦 API Client Utility for AGASPAY System
// ======================================================

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-domain.com'
  : 'http://localhost:3000';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // ======================================================
  // 🧱 Base Request Handler (used by all API calls)
  // ======================================================
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

  // ======================================================
  // 💧 WATER CONNECTION (Secretary / Admin)
  // ======================================================
  async getWaterConnections() {
    return await this.request('/api/v1/water-connection');
  }

  async updateResidentAccount(connectionId, updateData) {
    return await this.request(`/api/v1/water-connection/${connectionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // ======================================================
  // 🧾 BILLING (Treasurer / Admin)
  // ======================================================
  async createBilling(billData) {
    try {
      return await this.request('/api/v1/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billData),
      });
    } catch (error) {
      console.error("Billing creation failed:", error);
      throw error;
    }
  }

  async getOverdueBilling() {
    try {
      return await this.request('/api/v1/billing/overdue-billing');
    } catch (error) {
      console.log("Fetching overdue billing:", error);
      throw error;
    }
  }

  async getCurrentBill() {
    return await this.request('/api/v1/billing');
  }

  async sendOverdueReminder(billingId) {
    return await this.request('/api/v1/billing/send-reminder', {
      method: 'POST',
      body: JSON.stringify({ billingId }),
    });
  }

  // ======================================================
  // 💳 PAYMENT (Treasurer / Resident)
  // ======================================================
  async createPayment(paymentData) {
    return await this.request('/api/v1/payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getRecentPayment() {
    try {
      return await this.request('/api/v1/payment');
    } catch (error) {
      console.log("Fetching getRecentPayment:", error);
      throw error;
    }
  }

  async updatePaymentStatus(paymentId) {
    try {
      return await this.request(`/api/v1/payment/${paymentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error("❌ Payment status update failed:", error);
      throw error;
    }
  }

  // ======================================================
  // 📏 RATE MANAGEMENT (Treasurer / Admin)
  // ======================================================
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
      console.error("Adding rate amount failed:", error);
      throw error;
    }
  }

  // ======================================================
  // 🔧 METER READER MODULE (Meter Reader)
  // ======================================================
  async inputReading(requestData) {
    try {
      return await this.request('/api/v1/meter-reader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });
    } catch (error) {
      console.error("Inputting reading failed:", error);
      throw error;
    }
  }

  async getLatestReadings() {
    return await this.request('/api/v1/meter-reader/latest-readings');
  }

  async getCurrentReading() {
    return await this.request(`/api/v1/meter-reader}`);
  }

  // ======================================================
  // 🚨 INCIDENT REPORTS (Resident / Meter Reader)
  // ======================================================
  async createIncidentReport(reportData) {
    return await this.request('/api/v1/incident-report', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async getIncidentReports(){
    return await this.request('/api/v1/incident-report')
  }

  

  // ======================================================
  // 👤 USER MANAGEMENT (Resident / Personnel)
  // ======================================================
  async getUserAccount() {
    return await this.request('/api/v1/user');
  }



  // ======================================================
  // 🚨 SCHEDULE TASK (Resident / Meter Reader)
  // ======================================================
  async createScheduleTask(taskData) {
    return await this.request('/api/v1/schedule-task', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  } 

   

  // ======================================================
  // 🚨 SCHEDULE TASK (Resident / Meter Reader)
  // ======================================================

  async createAssignment(assignmentData) {
    return await this.request('/api/v1/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }
  async getAssignments() {
    return await this.request('/api/v1/assignments');
  }

}

export const apiClient = new ApiClient();
export default apiClient;
