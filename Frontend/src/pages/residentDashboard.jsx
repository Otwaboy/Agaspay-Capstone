import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import ResidentModernStats from "../components/dashboard/resident-modern-stats";
import ResidentBillPaymentCard from "../components/dashboard/resident-bill-payment-card";
import ResidentUsageChart from "../components/dashboard/resident-usage-chart";
import ResidentRecentTransactions from "../components/dashboard/resident-recent-transactions";
import ResidentModernAnnouncements from "../components/dashboard/resident-modern-announcements";
import ResidentQuickActions from "../components/dashboard/resident-quick-actions";
import PayBillModal from "../components/modals/pay-bill-modal";
import ReportIssueModal from "../components/modals/report-issue-modal";
import { Loader2 } from "lucide-react";

export default function ResidentDashboard() {
  const [isPayBillModalOpen, setIsPayBillModalOpen] = useState(false);
  const [isReportIssueModalOpen, setIsReportIssueModalOpen] = useState(false);

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
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-dashboard-title">
                My Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome to AGASPAY - Manage your water service account
              </p>
            </div>

            {/* Modern Stats Cards */}
            <ResidentModernStats />

            {/* Bill Payment and Usage Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1">
                <ResidentBillPaymentCard />
              </div>
              <div className="lg:col-span-2">
                <ResidentUsageChart />
              </div>
            </div>

            {/* Recent Transactions and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <ResidentRecentTransactions />
              </div>
              <div className="lg:col-span-1">
                <ResidentQuickActions />
              </div>
            </div>

            {/* Announcements */}
            <ResidentModernAnnouncements />
          </div>
        </main>
      </div>
      
      <PayBillModal 
        isOpen={isPayBillModalOpen} 
        onClose={() => setIsPayBillModalOpen(false)} 
      />
      <ReportIssueModal 
        isOpen={isReportIssueModalOpen} 
        onClose={() => setIsReportIssueModalOpen(false)} 
      />
    </div>
  );
}