import React, { createContext, useContext, useState, useEffect } from "react";
import { authManager } from "../lib/auth";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state from stored data
    const currentUser = authManager.getUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await authManager.login(credentials);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage first
    authManager.logout();
    // Clear React state
    setUser(null);
    // The component calling logout should handle navigation
  };

  const isAuthenticated = authManager.isAuthenticated() && !!user;
  const isAdmin = authManager.isAdmin();
  const canAccessAdminDashboard = authManager.canAccessAdminDashboard();

  const value = {
    user,
    isAuthenticated,
    isAdmin,
    canAccessAdminDashboard,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}