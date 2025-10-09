import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import MeterReaderStatsCards from "../components/dashboard/meter-reader-stats-cards";
import MeterReaderQuickActions from "../components/dashboard/meter-reader-quick-actions";
import MeterReaderRouteSchedule from "../components/dashboard/meter-reader-route-schedule";
import MeterReaderRecentReadings from "../components/dashboard/meter-reader-recent-readings";
import MeterReaderDailyProgress from "../components/dashboard/meter-reader-daily-progress";

export default function MeterReaderDashboard() {
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
      <MeterReaderSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MeterReaderTopHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-dashboard-title">
                Meter Reader Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome to AGASPAY - Field Operations Portal
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              <div className="lg:col-span-8">
                <MeterReaderStatsCards />
              </div>
              <div className="lg:col-span-4">
                <MeterReaderQuickActions />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <MeterReaderRouteSchedule />
              </div>
              <div className="lg:col-span-1">
                <MeterReaderRecentReadings />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <MeterReaderDailyProgress />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}