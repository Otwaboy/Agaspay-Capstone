import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/use-auth"
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "..//components/layout/treasurer-top-header";
import TreasurerStatsCards from "..//components/dashboard/treasurer-stats-cards";
import TreasurerQuickActions from "../components/dashboard/treasurer-quick-actions";
import TreasurerRecentTransactions from "../components/dashboard/treasurer-recent-transactions";
import TreasurerFinancialSummary from "../components/dashboard/treasurer-financial-summary";
import TreasurerPaymentAlerts from "../components/dashboard/treasurer-payment-alerts";

export default function TreasurerDashboard() {
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
      <TreasurerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TreasurerTopHeader />
        
        <main className="  flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6 ">
          <div className=" max-w-7xl mx-auto ">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-dashboard-title">
                Treasurer Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome to AGASPAY - Financial Management Portal
              </p>
            </div>

             <div className="grid grid-cols-1 gap-6 mb-6">
              <div className="lg:col-span-8">
                <TreasurerRecentTransactions />
                
              </div>
              {/* <div className="lg:col-span-4">
                
             
              </div> */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 ">
               <TreasurerStatsCards />
                  
              </div>
              <div className="lg:col-span-1">
                <TreasurerPaymentAlerts />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <TreasurerFinancialSummary />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}