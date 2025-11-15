// ======================================================
// 📦 API Client Utility for AGASPAY System
// ======================================================

// Use relative URL - Vite proxy will forward to backend in development
// In production, update this to your actual backend domain
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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
  // 💳 PAYMENT API
  // ======================================================
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

  async getRecentPayment() {
    try {
      return await this.request('/api/v1/payment');
    } catch (error) {
      console.log("fetching getrecentpayment:", error);
      throw error;
    }
  }

  async createPayment(paymentData) {
    return await this.request('/api/v1/payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  } 

  // ======================================================
  // 🧾 BILLING API (Treasurer / Admin)
  // ======================================================
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

  async getCurrentBill() {
    return await this.request('/api/v1/billing');
  }

  async getOverdueBilling() {
    return await this.request('/api/v1/billing/overdue-billing');
  }

  async sendOverdueReminder(billingId) {
    return await this.request('/api/v1/billing/send-reminder', {
      method: 'POST',
      body: JSON.stringify({ billingId }),
    });
  }

  async markForDisconnection(connection_id) {
  try {
    return await this.request('/api/v1/billing/update-connection-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ connection_id }),
    });
  } catch (error) {
    console.error("Failed to mark connection for disconnection:", error);
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
      console.error("Billing creation failed:", error);
      throw error; 
    }
  }

  // ======================================================
  // 🔧 METER READER MODULE
  // ======================================================
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

  async getLatestReadings() {
    return await this.request('/api/v1/meter-reader/latest-readings');
  }

  async getCurrentReading() {
    return await this.request(`/api/v1/meter-reader}`);
  }

async bulkSubmitReadings(readingIds = []) {
  return this.request('/api/v1/meter-reader/submit-readings', {
    method: 'POST',
    body: JSON.stringify({ reading_ids: readingIds }),
  });
}
async updateReadings(reading_id, data) {
  try {
    return await this.request(`/api/v1/meter-reader/${reading_id}/update-readings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("Updating reading failed:", error);
    throw error;
  }
}

// ✅ Approve multiple readings
async approveAllReadings(readingIds = []) {
  try {
    return await this.request('/api/v1/meter-reader/approve-readings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reading_ids: readingIds }),
    });
  } catch (error) {
    console.error("Approving readings failed:", error);
    throw error;
  }
}

async getSubmittedReadings() {
  try {
    return await this.request('/api/v1/meter-reader/submitted-readings', {
      method: 'GET',
    });
  } catch (error) {
    console.error("Fetching submitted readings failed:", error);
    throw error;
  }
}

// ✅ Get approval statistics (for dashboard overview)
async getApprovalStats() {
  try {
    return await this.request('/api/v1/meter-reader/approval-stats', {
      method: 'GET',
    });
  } catch (error) {
    console.error("Fetching approval stats failed:", error);
    throw error;
  }
}



  // ======================================================
  // 💧 WATER CONNECTION (Secretary / Admin)
  // ======================================================

    async getAllWaterConnections() {
    return await this.request('/api/v1/water-connection');
  }
  async getActiveWaterConnections() {
    return await this.request('/api/v1/water-connection/active');
  }

   async getInactiveWaterConnections() {
    return await this.request('/api/v1/water-connection/inactive');
  }

  async updateResidentAccount(connectionId, updateData) {
    return await this.request(`/api/v1/water-connection/${connectionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

 async updateUserContact(updateData) {
  return await this.request(`/api/v1/water-connection/contacts-update`, {
    method: 'PATCH',
    body: JSON.stringify(updateData),
  });
}



  // ======================================================
  // 👤 USER MANAGEMENT
  // ======================================================
  async getUserAccount() {
    return await this.request('/api/v1/user');
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

  async getIncidentReports() {
    return await this.request('/api/v1/incident-report');
  }

  async getIncidentReportById(reportId) {
    return await this.request(`/api/v1/incident-report/${reportId}`);
  }

  async updateIncidentReport(reportId, updateData) {
    return await this.request(`/api/v1/incident-report/${reportId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // ======================================================
  // 📅 SCHEDULE TASK (Secretary / Admin)
  // ======================================================
  async createScheduleTask(taskData) {
    return await this.request('/api/v1/schedule-task', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }); 
  }

  async getScheduleTasks() {
    return await this.request('/api/v1/schedule-task');
  }

  async updateTaskStatus(taskId, statusData) {
    return await this.request(`/api/v1/schedule-task/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  }

  async deleteScheduleTask(taskId) {
    return await this.request(`/api/v1/schedule-task/${taskId}`, {
      method: 'DELETE',
    });
  }

  // ======================================================
  // 📋 ASSIGNMENT API (Secretary / Admin)
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

  async getUnassignedTasks() {
    return await this.request('/api/v1/assignments/unassigned-tasks');
  }

  async getMaintenancePersonnel(scheduleDate = null, scheduleTime = null) {
    let url = '/api/v1/assignments/maintenance-personnel';
    
    // Add query parameters if date and time are provided for availability checking
    if (scheduleDate && scheduleTime) {
      const params = new URLSearchParams({
        schedule_date: scheduleDate,
        schedule_time: scheduleTime,
      });
      url += `?${params.toString()}`;
    }
    
    return await this.request(url);
  }

  async updateAssignment(assignmentId, updateData) {
    return await this.request(`/api/v1/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  async deleteAssignment(assignmentId) {
    return await this.request(`/api/v1/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  }

  async getPersonnelAvailability(date, time) {
    return await this.request(`/api/v1/assignments/availability/check?date=${date}&time=${time}`, {
      method: 'GET',
    });
  }

  async rescheduleAssignment(assignmentId, newDate, newTime, newPersonnelId = null) {
    return await this.request(`/api/v1/assignments/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({
        assignment_id: assignmentId,
        new_date: newDate,
        new_time: newTime,
        new_personnel_id: newPersonnelId,
      }),
    });
  }


   // ======================================================
  // 📋 ANNOOUNCEMENT (Secretary / Admin)
  // ======================================================
  async createAnnouncements(data) {
      return await this.request('/api/v1/announcements', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    async getAnnouncements() {
      return await this.request('/api/v1/announcements');
    }

    async getPendingAnnouncements() {
      return await this.request('/api/v1/announcements/pending');
    }

    // ======================================================
    // 🔐 CHANGE PASSWORD (Resident)
    // ======================================================
    async requestPasswordChange(data) {
      return await this.request('/api/v1/change-password/request', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    async verifyPasswordChange(data) {
      return await this.request('/api/v1/change-password/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    // ======================================================
    // 🔌 DISCONNECTION REQUEST (Resident)
    // ======================================================
    async requestDisconnection() {
      return await this.request('/api/v1/disconnection/request', {
        method: 'POST',
      });
    }

    async getDisconnectionStatus() {
      return await this.request('/api/v1/disconnection/status');
    }

    async cancelDisconnectionRequest() {
      return await this.request('/api/v1/disconnection/cancel', {
        method: 'POST',
      });
    }

  async approveDisconnection(connectionId) {
  return await this.request(`/api/v1/disconnection/approve/${connectionId}`, {
    method: 'PATCH',
    })
  };

    // ======================================================
    // 📦 ARCHIVE REQUEST (Resident)
    // ======================================================
    async requestArchive(data) {
      return await this.request('/api/v1/archive-request/request', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    async getArchiveStatus() {
      return await this.request('/api/v1/archive-request/status');
    }

    async cancelArchiveRequest() {
      return await this.request('/api/v1/archive-request/cancel', {
        method: 'POST',
      });
    }

    async approveArchive(connectionId) {
      return await this.request(`/api/v1/archive-request/approve/${connectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          archive_status: "archived",
          archive_approved_date: new Date()
        })
      });
    }

    async rejectDisconnection(connectionId, reason) {
      return await this.request(`/api/v1/disconnection/reject/${connectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    }

    async rejectArchive(connectionId, reason) {
      return await this.request(`/api/v1/archive-request/reject/${connectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    }
}




export const apiClient = new ApiClient();
export default apiClient;