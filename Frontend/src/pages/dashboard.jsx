import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import ModernStatsCards from "../components/dashboard/modern-stats-cards";
import PendingAnnouncements from "../components/dashboard/pending-announcements";
import ConnectionBreakdown from "../components/dashboard/connection-breakdown";
import SystemAlerts from "../components/dashboard/system-alerts";
import RecentActivities from "../components/dashboard/recent-activities";
import CreatePersonnelModal from "../components/modals/create-personnel-modal";
import ScheduleTaskModal from "../components/modals/schedule-task-modal";
import { Loader2, Droplets, Shield, Users, TrendingUp } from "lucide-react";

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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            

            {/* Top Stats Cards */}
            <ModernStatsCards />

            {/* Welcome Information Section */}
            <div className="mb-6 py-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Droplets className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Welcome to AGASPAY Water Management System
                  </h2>
                  <p className="text-base text-gray-700 mb-5 leading-relaxed">
                    AGASPAY is a comprehensive water billing and management platform designed to streamline operations
                    for Barangay Biking's water service. Our system empowers administrators to efficiently manage resident
                    connections, track billing cycles, monitor payment collections, and coordinate maintenance activities—all
                    in one centralized dashboard.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Resident Management</h3>
                        <p className="text-sm text-gray-600">Track and manage all water service connections</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Billing & Payments</h3>
                        <p className="text-sm text-gray-600">Automated billing with real-time payment tracking</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">System Monitoring</h3>
                        <p className="text-sm text-gray-600">Real-time alerts for incidents and maintenance</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Pending Announcements - Takes 2 columns */}
              <div className="lg:col-span-4">
                <PendingAnnouncements />
              </div>

              {/* Connection Breakdown - Takes 1 column */}
             
            </div>

            {/* Bottom Section */}
          

            

            {/* Footer */}
            <footer className="mt-12 pt-8 pb-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                {/* About Section */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">About AGASPAY</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    A comprehensive water billing and management platform serving Barangay Biking,
                    streamlining operations for efficient water service delivery.
                  </p>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <a href="/" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Dashboard</a>
                    </li>
                    <li>
                      <a href="/admin-dashboard/billing" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Billing & Payments</a>
                    </li>
                    <li>
                      <a href="/admin-dashboard/incidents" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">Incident Reports</a>
                    </li>
                    <li>
                      <a href="/admin-dashboard/settings" className="text-xs text-gray-600 hover:text-blue-600 transition-colors">System Settings</a>
                    </li>
                  </ul>
                </div>

                {/* Contact & Support */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact & Support</h3>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li>Barangay Biking, Dauis, Bohol</li>
                    <li>Contact: +63 123 456 7890</li>
                    <li>Email: admin@agaspay.com</li>
                    <li className="text-gray-500 mt-3">
                      System Version: v1.0.0
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                  <p className="text-xs text-gray-600">
                    © {new Date().getFullYear()} AGASPAY Water Management System. All rights reserved.
                  </p>
                  <p className="text-xs text-gray-500">
                    Powered by AGASPAY Technology | Last updated: {new Date().toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </footer>
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
