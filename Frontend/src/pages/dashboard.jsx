import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import ModernSidebar from "../components/layout/modern-sidebar";
import ModernHeader from "../components/layout/modern-header";
import { 
  Home, Users, Wrench, Calendar, FileText, AlertTriangle, 
  Megaphone, Droplets, Settings, HelpCircle 
} from "lucide-react";
import ModernStatsCards from "../components/dashboard/modern-stats-cards";
import PendingAnnouncements from "../components/dashboard/pending-announcements";
import ConnectionBreakdown from "../components/dashboard/connection-breakdown";
import SystemAlerts from "../components/dashboard/system-alerts";
import RecentActivities from "../components/dashboard/recent-activities";
import CreatePersonnelModal from "../components/modals/create-personnel-modal";
import ScheduleTaskModal from "../components/modals/schedule-task-modal";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  // Added state for modals
  const [isPersonnelModalOpen, setIsPersonnelModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Added event listeners
  useEffect(() => {
    const handleOpenPersonnelModal = () => setIsPersonnelModalOpen(true);
    const handleOpenTaskModal = () => setIsTaskModalOpen(true);

    window.addEventListener("openPersonnelModal", handleOpenPersonnelModal);
    window.addEventListener("openTaskModal", handleOpenTaskModal);

    return () => {
      window.removeEventListener("openPersonnelModal", handleOpenPersonnelModal);
      window.removeEventListener("openTaskModal", handleOpenTaskModal);
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

  const adminMenuItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: Users, label: "Personnel", href: "/personnel" },
    { icon: Droplets, label: "Connections", href: "/connections" },
    { icon: FileText, label: "Billing", href: "/billing" },
    { icon: AlertTriangle, label: "Incidents", href: "/incidents" },
    { icon: Calendar, label: "Scheduling", href: "/scheduling", isOther: true },
    { icon: Megaphone, label: "Announcements", href: "/announcements", isOther: true },
    { icon: FileText, label: "Reports", href: "/reports", isOther: true },
    { icon: HelpCircle, label: "Help Center", href: "/help", isSettings: true },
    { icon: Settings, label: "Settings", href: "/settings", isSettings: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar menuItems={adminMenuItems} title="AGASPAY" subtitle="Admin Portal" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ModernHeader title="Overview" />

        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-dashboard-title">
                Dashboard
              </h1>
            </div>

            {/* Top Stats Cards */}
            <ModernStatsCards />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Pending Announcements - Takes 2 columns */}
              <div className="lg:col-span-2">
                <PendingAnnouncements />
              </div>

              {/* Connection Breakdown - Takes 1 column */}
              <div className="lg:col-span-1">
                <ConnectionBreakdown />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* System Overview - Takes 2 columns */}
              <div className="lg:col-span-2">
                <SystemAlerts />
              </div>

              {/* Recent Activities - Takes 1 column */}
              <div className="lg:col-span-1">
                <RecentActivities />
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreatePersonnelModal 
        isOpen={isPersonnelModalOpen} 
        onClose={() => setIsPersonnelModalOpen(false)} 
      />
      <ScheduleTaskModal 
        isOpen={isTaskModalOpen} 
        onClose={() => setIsTaskModalOpen(false)} 
      />
    </div>
  );
}
