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
import CreateResidentModal from "../components/modals/create-resident-modal";
import ScheduleAppointmentModal from "../components/modals/schedule-appointment-modal";
import { Loader2 } from "lucide-react";

export default function SecretaryDashboard() {
  // Added state for modals
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  // Added event listeners
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
    <div className="flex h-screen bg-gray-100">
      <SecretarySidebar />

      {/* container ni sya sa top header ou ag body  */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <SecretaryTopHeader />

        {/* this is the body part or the content inside */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-dashboard-title">
                Secretary Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome to AGASPAY - Barangay Secretary Management Portal
              </p>
            </div>

            {/*Statscard ug quick aciton container lg: min-width: 1024px */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              <div className="lg:col-span-8">
                <SecretaryStatsCards />
              </div>
              <div className="lg:col-span-4">
                <SecretaryQuickActions />
              </div>
            </div>

            {/*recent act ug system alert na container  */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <SecretaryRecentActivities />
              </div>
              <div className="lg:col-span-1">
                <SecretarySystemAlerts />
              </div>
            </div>

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