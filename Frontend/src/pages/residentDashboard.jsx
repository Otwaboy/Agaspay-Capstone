import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import ResidentModernStats from "../components/dashboard/resident-modern-stats";
import ResidentMultiMeterCards from "../components/dashboard/resident-multi-meter-cards";
import ResidentModernAnnouncements from "../components/dashboard/resident-modern-announcements";
import ResidentFooter from "../components/layout/resident-footer";
import PayBillModal from "../components/modals/pay-bill-modal";
import ReportIssueModal from "../components/modals/report-issue-modal";
import { Loader2 } from "lucide-react";
import { apiClient } from "../lib/api";


export default function ResidentDashboard() {
  const [isPayBillModalOpen, setIsPayBillModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState(null);

  // Fetch all meters for the logged-in resident
  const { isLoading: metersLoading } = useQuery({
    queryKey: ["resident-meters"],
    queryFn: async () => {
      const res = await apiClient.getResidentMeters();
      return res.data;
    },
    onSuccess: (data) => {
      // Automatically select the first meter
      if (data && data.length > 0 && !selectedMeter) {
        setSelectedMeter(data[0]);
      }
    }
  });

  useEffect(() => { 
    const handleOpenPayBillModal = () => setIsPayBillModalOpen(true);
    const handleOpenReportIssueModal = () => setIsReportIssueModalOpen(true);

    window.addEventListener("openPayBillModal", handleOpenPayBillModal);
    window.addEventListener("openReportIssueModal", handleOpenReportIssueModal);

    return () => {
      window.removeEventListener("openPayBillModal", handleOpenPayBillModal);
      window.removeEventListener("openReportIssueModal", handleOpenReportIssueModal);
    };
  }, []);

  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading || metersLoading) {
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
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <ResidentTopHeader /> 

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-750 mb-[-17px]" data-testid="text-dashboard-title">
               Accounts
              </h1>
              {/* <p className="text-gray-600">
                Welcome to AGASPAY - Manage your water service account
              </p> */}
            </div>

            {/* Modern Stats Cards */}
            <ResidentModernStats connectionId={selectedMeter?.connection_id} />

            {/* Multi-Meter Cards with Switching (includes Bill, Usage, Transactions) */}
            <ResidentMultiMeterCards selectedMeter={selectedMeter} onMeterChange={setSelectedMeter} />

            {/* Announcements */}
            <ResidentModernAnnouncements />

            <ResidentFooter></ResidentFooter>
          </div>
        </main>
    
      </div>
      
      <PayBillModal
        isOpen={isPayBillModalOpen}
        onClose={() => setIsPayBillModalOpen(false)}
        selectedMeter={selectedMeter}
      />
      <ReportIssueModal 
        isOpen={isReportIssueModalOpen} 
        onClose={() => setIsReportIssueModalOpen(false)} 
      />
    </div>
  );
}