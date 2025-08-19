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
            username: data.userForm?.username || data.username,
            role: data.userForm?.role || data.role
          }
        };
        
        // Store token and user data
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
        } else {
          throw new Error('Invalid credentials. Please check your username and password or ensure your backend server is running on port 3000.');
        }
      }
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

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

  // Check if user can access admin dashboard
  canAccessAdminDashboard() {
    return this.isAuthenticated() && this.isAdmin();
  }
}

export const authManager = new AuthManager();
export { AuthManager };