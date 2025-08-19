import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";

// Protected Route component for admin-only access
export function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, canAccessAdminDashboard, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Use effect to handle redirects
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying access...</p>
        </div>
      </div>
    );
  }

  // If not authenticated at all, show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If admin access required but user is not admin, show access denied
  if (requireAdmin && !canAccessAdminDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Access Denied
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            You don't have permission to access the admin dashboard. Only administrators can access this area.
          </p>
          <button
            onClick={() => {
              // Clear any stored auth data 
              localStorage.removeItem('agaspay_token');
              localStorage.removeItem('agaspay_user');
              // Use setLocation for proper routing
              setLocation("/login");
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            data-testid="button-return-login"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  // User has proper access, render the protected component
  return children;
}

// Admin-only route wrapper
export function AdminRoute({ children }) {
  return (
    <ProtectedRoute requireAdmin={true}>
      {children}
    </ProtectedRoute>
  );
}