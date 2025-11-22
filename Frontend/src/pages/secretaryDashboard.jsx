import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import SecretaryFooter from "../components/layout/secretary-footer";
import SecretaryStatsCards from "../components/dashboard/secretary-stats-cards";
import SecretaryRecentActivities from "../components/dashboard/secretary-recent-activities";
import SecretaryRecentDocuments from "../components/dashboard/secretary-recent-documents";
import SecretaryQuickActions from "../components/dashboard/secretary-quick-actions";
import SecretarySystemAlerts from "../components/dashboard/secretary-system-alerts";
import SecretaryPendingOverview from "../components/dashboard/secretary-pending-overview";
import CreateResidentModal from "../components/modals/create-resident-modal";
import ScheduleAppointmentModal from "../components/modals/schedule-appointment-modal";
import { Loader2, Users, FileText, Bell, ClipboardList } from "lucide-react";

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

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
           
           <div className="mb-6">
              <SecretaryStatsCards />
            </div>

            {/* Welcome Information Section */}
            <div className="mb-6 py-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Welcome to AGASPAY Barangay Secretary Portal
                  </h2>
                  <p className="text-base text-gray-700 mb-5 leading-relaxed">
                    As the Barangay Secretary, you oversee the administrative operations of Barangay Biking's water service.
                    Manage resident registrations, handle documentation, coordinate announcements, and maintain comprehensive
                    records—ensuring smooth and efficient administrative processes for the entire community.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Resident Management</h3>
                        <p className="text-sm text-gray-600">Register and manage resident water connections</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Bell className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Announcements</h3>
                        <p className="text-sm text-gray-600">Create and publish community announcements</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Document Management</h3>
                        <p className="text-sm text-gray-600">Organize and maintain official records and documents</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards - Full Width */}
            

          

            {/* Recent Activities and System Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <SecretaryRecentActivities />
              </div>
              <div className="lg:col-span-1">
                <SecretarySystemAlerts />
              </div>
            </div>
           

            <SecretaryFooter />
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