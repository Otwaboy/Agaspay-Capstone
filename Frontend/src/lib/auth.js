// Authentication manager for handling login/logout
class AuthManager {
  constructor() {
    this.tokenKey = 'agaspay_token';
    this.userKey = 'agaspay_user';
  }

  async login(credentials) {
    try {
      // Try connecting to your MongoDB backend first
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
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
      
      throw new Error('MongoDB backend connection failed');
      
    } catch (error) {
      console.log('MongoDB backend error:', error.message);
      
      try {
        // Try Replit server as fallback
        const fallbackResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });

        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          
          // Store token and user data
          localStorage.setItem(this.tokenKey, data.token);
          localStorage.setItem(this.userKey, JSON.stringify(data.user));
          
          return data;
        }
        
        throw new Error('Replit server failed');
      } catch (fallbackError) {
        console.log('Replit server error:', fallbackError.message);
      // Final fallback: mock authentication for testing
      const { username, password } = credentials;
      
      // Check demo credentials
      if (username === 'admin' && password === 'admin123') {
        const mockData = {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 'mock-admin-id',
            username: 'admin',
            role: 'admin'
          },
          personnel: {
            first_name: 'System',
            last_name: 'Administrator',
            role: 'admin'
          }
        };
        
        // Store token and user data
        localStorage.setItem(this.tokenKey, mockData.token);
        localStorage.setItem(this.userKey, JSON.stringify(mockData.user));
        
        return mockData;
      } else if (username === 'secretary' && password === 'secretary123') {
        const mockData = {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            id: 'mock-secretary-id',
            username: 'secretary',
            role: 'secretary'
          },
          personnel: {
            first_name: 'Barangay',
            last_name: 'Secretary',
            role: 'secretary'
          }
        };
        
        // Store token and user data
        localStorage.setItem(this.tokenKey, mockData.token);
        localStorage.setItem(this.userKey, JSON.stringify(mockData.user));
        
        return mockData;
      } else {
        throw new Error('Invalid credentials. Please check your username and password or ensure your backend server is running on port 3000.');
      }
      }
    }
  }

  async createAccount(credentials) {
    console.log('Creating account with data:', credentials);
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/auth/register-personnel', {
        method: 'POST',
        mode: 'cors',
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
      try {
        const errorData = await response.json();
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
        throw new Error(errorMessage);
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

  // async createPersonnel(personnelData) {
  //   console.log('Creating personnel with data:', personnelData);
    
  //   try {
  //     const response = await fetch('http://localhost:3000/api/v1/personnel', {
  //       method: 'POST',
  //       mode: 'cors',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json',
  //         'Authorization': `Bearer ${this.getToken()}`, // Include auth token for admin-only operations
  //       },
  //       body: JSON.stringify(personnelData),
  //     });

  //     console.log('Personnel creation response status:', response.status);

  //     if (response.ok) {
  //       const data = await response.json();
  //       console.log('Personnel created successfully:', data);
  //       return {
  //         success: true,
  //         message: 'Personnel created successfully',
  //         data: data
  //       };
  //     }
      
  //     // Get error details from backend for all error statuses
  //     let errorMessage = 'Unknown error occurred';
  //     try {
  //       const errorData = await response.json();
  //       errorMessage = errorData.message || errorData.error || `Server error (${response.status})`;
  //       console.error('Backend error details:', errorData);
  //     } catch (e) {
  //       console.error('Could not parse error response:', e);
  //       errorMessage = `Server error (${response.status})`;
  //     }
      
  //     if (response.status === 401) {
  //       throw new Error('Unauthorized: Admin access required to create personnel');
  //     }
      
  //     if (response.status === 409) {
  //       throw new Error('Personnel with this email already exists');
  //     }

  //     if (response.status === 400) {
  //       throw new Error(errorMessage);
  //     }

  //     if (response.status === 500) {
  //       throw new Error(`Backend server error: ${errorMessage}`);
  //     }
      
  //     throw new Error(`Failed to create personnel: ${errorMessage}`);
      
  //   } catch (error) {
  //     // Network error - backend server not running
  //     if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
  //       throw new Error('Cannot connect to MongoDB backend server on port 3000. Please ensure your backend server is running.');
  //     }
  //     throw error;
  //   }
  // }

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

  isResident() {
    const user = this.getUser();
    return user && user.role === 'resident';
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

   // Check if user can access secretary dashboard
  canAccessResidentDashboard() {
    return this.isAuthenticated() && this.isResident();
  }

  // Check if user can access any dashboard (admin or secretary)
  canAccessDashboard() {
    return this.canAccessAdminDashboard() || this.canAccessSecretaryDashboard() || this.canAccessResidentDashboard || this.canAccessTreasurerDashboard;
  }
  
   canAccessAnyDashboard() {
    return this.canAccessAdminDashboard() || this.canAccessSecretaryDashboard() || this.canAccessResidentDashboard || this.canAccessTreasurerDashboard;
  }
}

 
  

export const authManager = new AuthManager();
export { AuthManager };