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
  // 📊 DASHBOARD API (Admin)
  // ======================================================
  async getDashboardStats() {
    return await this.request('/api/v1/dashboard/stats');
  }

  async getSecretaryFinancialStats() {
    return await this.request('/api/v1/dashboard/financial-stats');
  }


 async getResidentByDate(selectedDate) {
  const url = `/api/v1/auth/residents/by-date?startDate=${encodeURIComponent(selectedDate)}`;
  return await this.request(url);
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

  async updateOfficialReceiptStatus(paymentId) {
    try {
      return await this.request(`/api/v1/payment/${paymentId}/update-receipt-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error("❌ Official receipt status update failed:", error);
      throw error;
    }
  }

  async getRecentPayment(connectionId = null) {
    try {
      const url = connectionId
        ? `/api/v1/payment?connection_id=${connectionId}`
        : '/api/v1/payment';
      return await this.request(url);
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

  async getAllPayments(params = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );
    const queryString = new URLSearchParams(filteredParams).toString();
    return await this.request(`/api/v1/payment${queryString ? `?${queryString}` : ''}`);
  }

  async getPaymentById(id) {
    return await this.request(`/api/v1/payment/${id}`);
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

  async getCurrentBill(connectionId = null) {
    const url = connectionId
      ? `/api/v1/billing?connection_id=${connectionId}`
      : '/api/v1/billing';
    return await this.request(url);
  }

  async getAllBilling(params = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );
    const queryString = new URLSearchParams(filteredParams).toString();
    return await this.request(`/api/v1/billing${queryString ? `?${queryString}` : ''}`);
  }

  async getBillingById(id) {
    return await this.request(`/api/v1/billing/${id}`);
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

  // ✅ Record manual/walk-in payment
  async recordManualPayment(paymentData) {
    try {
      return await this.request('/api/v1/payment/record-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      });
    } catch (error) {
      console.error("Failed to record manual payment:", error);
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

  async getReadingHistory() {
    return await this.request('/api/v1/meter-reader/reading-history');
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
  // 👷 PERSONNEL API (Admin)
  // ======================================================
  async getAllPersonnel(params = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );
    const queryString = new URLSearchParams(filteredParams).toString();
    return await this.request(`/api/v1/personnel${queryString ? `?${queryString}` : ''}`);
  }

  async getPersonnelById(id) {
    return await this.request(`/api/v1/personnel/${id}`);
  }

  async createPersonnel(data) {
    return await this.request('/api/v1/personnel', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePersonnel(id, data) {
    return await this.request(`/api/v1/personnel/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePersonnel(id) {
    return await this.request(`/api/v1/personnel/${id}`, {
      method: 'DELETE',
    });
  }

  async getPersonnelProfile() {
    return await this.request('/api/v1/personnel/me');
  }

  async updatePersonnelContact(updateData) {
    return await this.request(`/api/v1/personnel/contacts-update`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  }

  // ======================================================
  // 💧 WATER CONNECTION (Secretary / Admin)
  // ======================================================

    async getAllWaterConnections(params = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );
    const queryString = new URLSearchParams(filteredParams).toString();
    return await this.request(`/api/v1/water-connection${queryString ? `?${queryString}` : ''}`);
  }

  async getWaterConnectionById(id) {
    return await this.request(`/api/v1/water-connection/${id}`);
  }

  async getActiveWaterConnections() {
    return await this.request('/api/v1/water-connection/active');
  }

   async getInactiveWaterConnections() {
    return await this.request('/api/v1/water-connection/inactive');
  }

  async getConnectionsForDisconnection() {
    return await this.request('/api/v1/water-connection/for-disconnection');
  }

  async getConnectionsForReconnection() {
    return await this.request('/api/v1/water-connection/for-reconnection');
  }

  async getDisconnectedConnections() {
    return await this.request('/api/v1/water-connection/disconnected');
  }

  async getResidentMeters() {
    return await this.request('/api/v1/water-connection/resident-meters');
  }

  async addMeterToResident(data) {
    return await this.request('/api/v1/water-connection/add-meter', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDelinquentAccounts() {
    return await this.request('/api/v1/connection-management/delinquent');
  }

  async updateConnectionStatus(id, status) {
    return await this.request(`/api/v1/connection-management/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async markConnectionForDisconnection(id) {
    return await this.request(`/api/v1/connection-management/${id}/mark-disconnection`, {
      method: 'POST',
    });
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
  // 👤 USER MANAGEMENT (Admin)
  // ======================================================
  async getUserAccount() {
    return await this.request('/api/v1/user');
  }

  async getAllUsers(params = {}) {
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );
    const queryString = new URLSearchParams(filteredParams).toString();
    return await this.request(`/api/v1/user/all${queryString ? `?${queryString}` : ''}`);
  }

  async getUserById(id) {
    return await this.request(`/api/v1/user/${id}`);
  }

  async updateUser(id, data) {
    return await this.request(`/api/v1/user/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id) {
    return await this.request(`/api/v1/user/${id}`, {
      method: 'DELETE',
    });
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

  async getAllIncidentReports() {
    return await this.request('/api/v1/incident-report/all');
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

  async updateIncidentStatus(id, status, resolution_notes = '') {
    return await this.request(`/api/v1/incident-report/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        reported_issue_status: status,
        resolution_notes
      }),
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

  async updateScheduleTask(id, data) {
    return await this.request(`/api/v1/schedule-task/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
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

    async getAnnouncements(params = {}) {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );
      const queryString = new URLSearchParams(filteredParams).toString();
      return await this.request(`/api/v1/announcements${queryString ? `?${queryString}` : ''}`);
    }

    async getPendingAnnouncements() {
      return await this.request('/api/v1/announcements/pending');
    }

    async approveAnnouncement(id) {
      return await this.request(`/api/v1/announcements/${id}/approve`, {
        method: 'PATCH',
      });
    }

    async rejectAnnouncement(id, rejection_reason) {
      return await this.request(`/api/v1/announcements/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ rejection_reason }),
      });
    }

    async archiveAnnouncement(id) {
      return await this.request(`/api/v1/announcements/${id}/archive`, {
        method: 'PATCH',
      });
    }

    async incrementAnnouncementViews(id) {
      return await this.request(`/api/v1/announcements/${id}/view`, {
        method: 'PATCH',
      });
    }

    // // ======================================================
    // // 💧 WATER SCHEDULES (Secretary / Admin)
    // // ======================================================
    // async createWaterSchedule(data) {
    //   return await this.request('/api/v1/water-schedules', {
    //     method: 'POST',
    //     body: JSON.stringify(data),
    //   });
    // }

    // async getWaterSchedules(params = {}) {
    //   const filteredParams = Object.fromEntries(
    //     Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
    //   );
    //   const queryString = new URLSearchParams(filteredParams).toString();
    //   return await this.request(`/api/v1/water-schedules${queryString ? `?${queryString}` : ''}`);
    // }

    // async getPendingWaterSchedules() {
    //   return await this.request('/api/v1/water-schedules/pending');
    // }

    // async approveWaterSchedule(id) {
    //   return await this.request(`/api/v1/water-schedules/${id}/approve`, {
    //     method: 'PATCH',
    //   });
    // }

    // async rejectWaterSchedule(id) {
    //   return await this.request(`/api/v1/water-schedules/${id}/reject`, {
    //     method: 'PATCH',
    //   });
    // }


  
    

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
    async requestDisconnection(connectionIds = null) {
      return await this.request('/api/v1/disconnection/request', {
        method: 'POST',
        body: connectionIds ? JSON.stringify({ connectionIds }) : undefined
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

    // ======================================================
    // 📦 PERSONNEL ARCHIVE REQUEST
    // ======================================================
    async requestPersonnelArchive(data) {
      return await this.request('/api/v1/personnel/archive-request', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }

    async getPersonnelArchiveStatus() {
      return await this.request('/api/v1/personnel/archive-status');
    }

    async cancelPersonnelArchiveRequest() {
      return await this.request('/api/v1/personnel/archive-request', {
        method: 'DELETE',
      });
    }

    async approvePersonnelArchive(personnelId) {
      return await this.request(`/api/v1/personnel/${personnelId}/approve-archive`, {
        method: 'PATCH',
      });
    }

    async rejectPersonnelArchive(personnelId, reason) {
      return await this.request(`/api/v1/personnel/${personnelId}/reject-archive`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
    }

    async unarchiveResident(connectionId) {
      return await this.request(`/api/v1/archive-request/unarchive/${connectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          archive_status: null,
          archive_approved_date: null,
          archive_requested_date: null,
          archive_reason: null
        })
      });
    }

    async unarchivePersonnel(personnelId) {
      return await this.request(`/api/v1/personnel/${personnelId}/unarchive`, {
        method: 'PATCH',
      });
    }

    async archivePersonnel(personnelId) {
      return await this.request(`/api/v1/personnel/${personnelId}/archive`, {
        method: 'PATCH',
      });
    }

    // ======================================================
    // 📊 REPORTS API (Admin)
    // ======================================================
    async generateRevenueReport(params = {}) {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );
      const queryString = new URLSearchParams(filteredParams).toString();
      return await this.request(`/api/v1/reports/revenue${queryString ? `?${queryString}` : ''}`);
    }

    async generateConsumptionReport(params = {}) {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );
      const queryString = new URLSearchParams(filteredParams).toString();
      return await this.request(`/api/v1/reports/consumption${queryString ? `?${queryString}` : ''}`);
    }

    async generateBillingReport(params = {}) {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );
      const queryString = new URLSearchParams(filteredParams).toString();
      return await this.request(`/api/v1/reports/billing${queryString ? `?${queryString}` : ''}`);
    }

    async generateUsersReport(params = {}) {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );
      const queryString = new URLSearchParams(filteredParams).toString();
      return await this.request(`/api/v1/reports/users${queryString ? `?${queryString}` : ''}`);
    }

    async generateIncidentsReport(params = {}) {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );
      const queryString = new URLSearchParams(filteredParams).toString();
      return await this.request(`/api/v1/reports/incidents${queryString ? `?${queryString}` : ''}`);
    }

  // ======================================================
  // 🔧 METER READER ISSUE API (now part of Incident Reports)
  // ======================================================
  async createMeterIssue(issueData) {
    // Meter issues are now created as incident reports with type "Meter Issue"
    return await this.request('/api/v1/incident-report', {
      method: 'POST',
      body: JSON.stringify(issueData)
    });
  }

  async getAllMeterIssues(status = null) {
    // Get all incidents of type "Meter Issue"
    const url = status && status !== 'all'
      ? `/api/v1/incident-report/all?status=${status}`
      : '/api/v1/incident-report/all';
    return await this.request(url);
  }

  async getMyMeterIssues() {
    // Get incident reports created by current meter reader
    return await this.request('/api/v1/incident-report');
  }

  async getMeterIssueById(id) {
    return await this.request(`/api/v1/incident-report/${id}`);
  }

  async assignMeterIssue(id, maintenancePersonnelId) {
    // For now, assign via task creation
    // This creates a schedule task that connects the maintenance personnel to the incident
    return await this.request('/api/v1/schedule-task', {
      method: 'POST',
      body: JSON.stringify({
        report_id: id,
        assigned_personnel: maintenancePersonnelId,
        description: 'Meter issue repair'
      })
    });
  }

  async startMeterRepair(id) {
    // Update incident status to "In Progress"
    return await this.request(`/api/v1/incident-report/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ reported_issue_status: 'In Progress' })
    });
  }

  async completeMeterRepair(id, completionNotes = '') {
    // Update incident status to "Resolved" and connection back to active
    return await this.request(`/api/v1/incident-report/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({
        reported_issue_status: 'Resolved',
        resolution_notes: completionNotes
      })
    });
  }
}




export const apiClient = new ApiClient();
export default apiClient;