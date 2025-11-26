// Authentication manager for handling login/logout
class AuthManager {
  constructor() {
    this.tokenKey = 'agaspay_token';
    this.userKey = 'agaspay_user';
    // Use relative URL - Vite proxy will forward to backend
     this.backendURL = import.meta.env.VITE_BACKEND_URL 
  }
 
  async login(credentials) {
    try {
      // Debug: Log the backend URL being used
      console.log('Attempting login to:', `${this.backendURL}/api/v1/auth/login`);

      // Try connecting to your MongoDB backend first
      const response = await fetch(`${this.backendURL}/api/v1/auth/login`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (response.ok) {
        const data = await response.json();

        // Handle your backend response format
        const userData = {
          token: data.userForm?.token || data.token,
          user: {
            id: data.userForm?.user_id || data.user_id,
            fullname: data.userForm?.fullname || data.fullname,
            username: data.userForm?.username || data.username,
            meter_no: data.userForm?.meter_no || data.meter_no,
            status: data.userForm?.status || data.status,
            purok: data.userForm?.purok || data.purok,
            type: data.userForm?.type || data.type,
            role: data.userForm?.role || data.role
          }
        };

        // Store token and user data
        //key ug value pair this tokenkey is equal sa userdata.token
        localStorage.setItem(this.tokenKey, userData.token);
        localStorage.setItem(this.userKey, JSON.stringify(userData.user));

        return userData;
      }

      // Handle error responses from backend
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.msg || errorData.message || errorData.error || 'Login failed';
        throw new Error(errorMessage);
      }

    } catch (error) {
      console.log('MongoDB backend error:', error.message);
      throw error;
      
      // try {
      //   // Try Replit server as fallback
      //   const fallbackResponse = await fetch('/api/auth/login', {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(credentials),
      //   });

      //   if (fallbackResponse.ok) {
      //     const data = await fallbackResponse.json();
          
      //     // Store token and user data
      //     localStorage.setItem(this.tokenKey, data.token);
      //     localStorage.setItem(this.userKey, JSON.stringify(data.user));
          
      //     return data;
      //   }
        
      //   throw new Error('Replit server failed');
      // } catch (fallbackError) {
      //   console.log('Replit server error:', fallbackError.message);
     
      // }
    }
  }

  //credentials is the data you want to send (e.g., { username, password, role }).
  async createAccount(credentials) {
    console.log('Creating account with data:', credentials);
    
    try {
      const response = await fetch(`${this.backendURL}/api/v1/auth/register-personnel`, {
        method: 'POST',
        mode: 'cors', // since ag backend run on port 3000 so i added a cors mode to allow cross origin request
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`, // Include auth token for admin-only operations
        },
        body: JSON.stringify(credentials),
      });

      console.log('Account creation response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Account created successfully:', data);
        return {
          success: true,
          message: 'Personnel account created successfully',
          data: data
        };
      }
      
      // Get error details from backend for all error statuses
      let errorMessage = 'Unknown error occurred';
      let errorData = {};
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Server error (${response.status})`;
        console.error('Backend error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response:', e);
        errorMessage = `Server error (${response.status})`;
      }
      
      if (response.status === 401) {
        throw new Error('Unauthorized: Admin access required to create personnel accounts');
      }
      
      if (response.status === 409) {
        throw new Error('Account already exists with this username or email');
      }

      if (response.status === 400) {
        const error = new Error(errorMessage);
        error.response = { data: errorData };
        throw error;
      }

      if (response.status === 500) {
        throw new Error(`Backend server error: ${errorMessage}`);
      }
      
      throw new Error(`Failed to create personnel account: ${errorMessage}`);
      
    } catch (error) {
      // Network error - backend server not running
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('Cannot connect to MongoDB backend server on port 3000. Please ensure your backend server is running.');
      }
      throw error;
    }
  }



  async createResidentAccount(credentials) {
    console.log('Creating account with data:', credentials);

    try {
      const response = await fetch(`${this.backendURL}/api/v1/auth/register-resident`, {
        method: 'POST',
        mode: 'cors', // since ag backend run on port 3000 so i added a cors mode to allow cross origin request
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`, // Include auth token for admin-only operations
        },
        body: JSON.stringify(credentials),
      });

      console.log('Account creation response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Account created successfully:', data);
        return {
          success: true,
          message: data.message || 'Resident account created successfully',
          data: data
        };
      }
      
      // Get error details from backend for all error statuses
      let errorMessage = 'Unknown error occurred';
      let errorData = {};
      try {
        errorData = await response.json();
        errorMessage = errorData.message || errorData.error || `Server error (${response.status})`;
        console.error('Backend error details:', errorData);
      } catch (e) {
        console.error('Could not parse error response:', e);
        errorMessage = `Server error (${response.status})`;
      }
      
      if (response.status === 401) {
        throw new Error('Unauthorized: Admin access required to create personnel accounts');
      }
      
      if (response.status === 409) {
        throw new Error('Account already exists with this username or email');
      }

      if (response.status === 400) {
        const error = new Error(errorMessage);
        error.response = { data: errorData };
        throw error;
      }

      if (response.status === 500) {
        throw new Error(`Backend server error: ${errorMessage}`);
      }
      
      throw new Error(`Failed to create personnel account: ${errorMessage}`);
      
    } catch (error) {
      // Network error - backend server not running
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        throw new Error('Cannot connect to MongoDB backend server on port 3000. Please ensure your backend server is running.');
      }
      throw error;
    }
  }


 
  // for getting the item in the localstorge

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  //in JavaScript parse means convert a JSON string back into a real JavaScript object.
  getUser() {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  // Check if user has admin role for dashboard access
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  }

  // Check if user has secretary role for dashboard access
  isSecretary() {
    const user = this.getUser();
    return user && user.role === 'secretary';
  }

   isTreasurer() {
    const user = this.getUser();
    return user && user.role === 'treasurer';
  }

    isMeterReader() {
    const user = this.getUser();
    return user && user.role === 'meter_reader';
  }

  isResident() {
    const user = this.getUser();
    return user && user.role === 'resident';
  }

   isMaintenance() {
    const user = this.getUser();
    return user && user.role === 'maintenance';
  }

  // Check if user can access admin dashboard
  canAccessAdminDashboard() {
    return this.isAuthenticated() && this.isAdmin();
  }

  // Check if user can access secretary dashboard
  canAccessSecretaryDashboard() {
    return this.isAuthenticated() && this.isSecretary();
  }

   // Check if user can access treasurer dashboard
  canAccessTreasurerDashboard() {
    return this.isAuthenticated() && this.isTreasurer();
  }

   // Check if user can access treasurer dashboard
  canAccessMeterReaderDashboard() {
    return this.isAuthenticated() && this.isMeterReader();
  }
   // Check if user can access secretary dashboard
  canAccessResidentDashboard() {
    return this.isAuthenticated() && this.isResident();
  }

  
  canAccessMaintenanceDashboard() {
    return this.isAuthenticated() && this.isMaintenance();
  }

  // Check if user can access any dashboard (admin or secretary)
  canAccessDashboard() {
  return this.canAccessAdminDashboard() || this.canAccessSecretaryDashboard() || this.canAccessResidentDashboard || this.canAccessTreasurerDashboard || this.canAccessMeterReaderDashboard || this.canAccessMaintenanceDashboard;
  }
  
   canAccessAnyDashboard() {
    return this.canAccessAdminDashboard() || this.canAccessSecretaryDashboard() || this.canAccessResidentDashboard || this.canAccessTreasurerDashboard || this.canAccessMeterReaderDashboard || this.canAccessMaintenanceDashboard;
  }
}

 
export const authManager = new AuthManager();
export { AuthManager };