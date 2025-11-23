import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, Gauge, MapPin, Users, Shield } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import MeterReaderFooter from "../components/layout/meter-reader-footer";
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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <MeterReaderSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <MeterReaderTopHeader />
        
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Top Stats Cards */}
            <MeterReaderStatsCards />

            {/* Welcome Information Section */}
            <div className="mb-6 py-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Gauge className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Welcome to AGASPAY Meter Reader Portal
                  </h2>
                  <p className="text-base text-gray-700 mb-5 leading-relaxed">
                    As a meter reader for Barangay Biking's water service, you play a vital role in ensuring accurate
                    billing and service delivery. This portal empowers you to efficiently manage your assigned zones,
                    record meter readings, report incidents, and track your daily progress—all from one centralized dashboard.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Zone Management</h3>
                        <p className="text-sm text-gray-600">Track residents in your assigned zones</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Gauge className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Meter Readings</h3>
                        <p className="text-sm text-gray-600">Record and submit accurate water consumption data</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Issue Reporting</h3>
                        <p className="text-sm text-gray-600">Report incidents and maintenance needs in real-time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Footer */}
            <MeterReaderFooter />
          </div>
        </main>
      </div>
    </div>
  );
}