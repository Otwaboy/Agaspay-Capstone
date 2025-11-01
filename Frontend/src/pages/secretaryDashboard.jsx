import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import SecretaryStatsCards from "../components/dashboard/secretary-stats-cards";
import SecretaryRecentActivities from "../components/dashboard/secretary-recent-activities";
import SecretaryRecentDocuments from "../components/dashboard/secretary-recent-documents";
import SecretaryQuickActions from "../components/dashboard/secretary-quick-actions";
import SecretarySystemAlerts from "../components/dashboard/secretary-system-alerts";
import SecretaryPendingOverview from "../components/dashboard/secretary-pending-overview";
import CreateResidentModal from "../components/modals/create-resident-modal";
import ScheduleAppointmentModal from "../components/modals/schedule-appointment-modal";
import { Loader2 } from "lucide-react";

export default function SecretaryDashboard() {
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenResidentModal = () => setIsResidentModalOpen(true);
    const handleOpenAppointmentModal = () => setIsAppointmentModalOpen(true);

    window.addEventListener("openResidentModal", handleOpenResidentModal);
    window.addEventListener("openAppointmentModal", handleOpenAppointmentModal);

    return () => {
      window.removeEventListener("openResidentModal", handleOpenResidentModal);
      window.removeEventListener("openAppointmentModal", handleOpenAppointmentModal);
    };
  }, []);

  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SecretarySidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <SecretaryTopHeader />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="text-dashboard-title">
                Secretary Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome to AGASPAY - Barangay Secretary Management Portal
              </p>
            </div>

            {/* Stats Cards - Full Width */}
            <div className="mb-6">
              <SecretaryStatsCards />
            </div>

            {/* Quick Actions and Pending Overview - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <SecretaryQuickActions />
              <SecretaryPendingOverview />
            </div>

            {/* Recent Activities and System Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <SecretaryRecentActivities />
              </div>
              <div className="lg:col-span-1">
                <SecretarySystemAlerts />
              </div>
            </div>

            {/* Recent Documents - Full Width */}
            <div className="grid grid-cols-1 gap-6">
              <SecretaryRecentDocuments />
            </div>
          </div>
        </main>
      </div>
      
      <CreateResidentModal 
        isOpen={isResidentModalOpen} 
        onClose={() => setIsResidentModalOpen(false)} 
      />
      <ScheduleAppointmentModal 
        isOpen={isAppointmentModalOpen} 
        onClose={() => setIsAppointmentModalOpen(false)} 
      />
    </div>
  );
}