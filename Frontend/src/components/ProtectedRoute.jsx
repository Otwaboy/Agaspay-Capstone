import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";

// Protected Route component for role-based access
export function ProtectedRoute({ children, requireAdmin = false, requireSecretary = false, requireResident = false, allowBoth = false, allowAll = false }) {
  const { isAuthenticated, canAccessAdminDashboard, canAccessSecretaryDashboard, canAccessResidentDashboard, canAccessDashboard, canAccessAnyDashboard, isLoading } = useAuth();
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

  // Check role-based access
  let hasAccess = false;
  let accessMessage = "";

  if (requireAdmin) {
    hasAccess = canAccessAdminDashboard;
    accessMessage = "You don't have permission to access the admin dashboard. Only administrators can access this area.";
  } else if (requireSecretary) {
    hasAccess = canAccessSecretaryDashboard;
    accessMessage = "You don't have permission to access the secretary dashboard. Only secretaries can access this area.";
  } else if (requireResident) {
    hasAccess = canAccessResidentDashboard;
    accessMessage = "You don't have permission to access the Resident dashboard. Only Resident can access this area.";
  } else if (allowBoth) {
    hasAccess = canAccessDashboard;
    accessMessage = "You don't have permission to access this dashboard. Only administrators and secretaries can access this area.";
  } else if (allowAll) {
    hasAccess = canAccessAnyDashboard;
    accessMessage = "You don't have permission to access this dashboard. Only administrators and secretaries can access this area.";
  } else {
    hasAccess = true; // No specific role requirement
  }

  // If specific role access required but user doesn't have access, show access denied
  if (!hasAccess) {
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
            {accessMessage}
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

// Secretary-only route wrapper
export function SecretaryRoute({ children }) {
  return (
    <ProtectedRoute requireSecretary={true}>
      {children}
    </ProtectedRoute>
  );
}

// Resident-only route wrapper
export function ResidentRoute({ children }) {
  return (
    <ProtectedRoute requireResident={true}>
      {children}
    </ProtectedRoute>
  );
}

// Route for both admin and secretary access
export function DashboardRoute({ children }) {
  return (
    <ProtectedRoute allowBoth={true}>
      {children}
    </ProtectedRoute>
  );
}

export function AnyDashboardRoute({ children }) {
  return (
    <ProtectedRoute allowAll={true}>
      {children}
    </ProtectedRoute>
  );
}