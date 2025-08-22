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

  const createAccount = async (credentials) => {
    return await authManager.createAccount(credentials);
  };

  const createPersonnel = async (personnelData) => {
    return await authManager.createPersonnel(personnelData);
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
  const isSecretary = authManager.isSecretary();
  const isResident = authManager.isResident();
  const canAccessAdminDashboard = authManager.canAccessAdminDashboard();
  const canAccessSecretaryDashboard = authManager.canAccessSecretaryDashboard();
  const canAccessResidentDashboard = authManager.canAccessResidentDashboard();
  const canAccessDashboard = authManager.canAccessDashboard();
  const canAccessAnyDashboard = authManager.canAccessAnyDashboard();

  const value = {
    user,
    isAuthenticated,
    isAdmin, 
    isSecretary,
    isResident,
    canAccessAdminDashboard,
    canAccessSecretaryDashboard,
    canAccessResidentDashboard,
    canAccessDashboard,
    canAccessAnyDashboard,
    isLoading,
    login,
    logout,
    createAccount,
    createPersonnel,
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