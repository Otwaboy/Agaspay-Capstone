import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import StatsCards from "../components/dashboard/stats-cards";
import RecentActivities from "../components/dashboard/recent-activities";
import RecentTransactions from "../components/dashboard/recent-transactions";
import QuickActions from "../components/dashboard/quick-actions";
import SystemAlerts from "../components/dashboard/system-alerts";
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


  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      {/* container ni sya sa top header ou ag body  */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />

        {/* this is the body part or the content inside */}
        <main className="border border-black flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-dashboard-title">
                Dashboard Overview
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome to AGASPAY - Barangay Waterworks Management System
              </p>
            </div>

            {/*Statscard ug quick aciton container lg: min-width: 1024px */}
            <div className="border border-black grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              <div className="lg:col-span-8">
                <StatsCards />
              </div>
              <div className="lg:col-span-4">
                <QuickActions />
              </div>
            </div>


            {/*recent act ug system alert na container  */}
            <div className="border border-black grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <RecentActivities />
              </div>
              <div className="lg:col-span-1">
                <SystemAlerts />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <RecentTransactions />
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