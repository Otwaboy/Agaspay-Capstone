import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useAuth } from "../hooks/use-auth"
import ModernSidebar from "../components/layout/modern-sidebar";
import ModernHeader from "../components/layout/modern-header";
import { 
  Home, DollarSign, CreditCard, Users, FileText, TrendingUp,
  AlertTriangle, Calendar, Settings, HelpCircle 
} from "lucide-react";
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

  const treasurerMenuItems = [
    { icon: Home, label: "Dashboard", href: "/treasurer-dashboard" },
    { icon: DollarSign, label: "Revenue Reports", href: "/treasurer-dashboard/revenue-reports" },
    { icon: CreditCard, label: "Payment Collection", href: "/treasurer-dashboard/payment-collection" },
    { icon: FileText, label: "Generate Bills", href: "/treasurer-dashboard/generate-bills" },
    { icon: Users, label: "Customer Accounts", href: "/treasurer-dashboard/customer-accounts" },
    { icon: AlertTriangle, label: "Outstanding Balances", href: "/treasurer-dashboard/outstanding-balances", isOther: true },
    { icon: TrendingUp, label: "Analytics", href: "/treasurer-dashboard/analytics", isOther: true },
    { icon: Calendar, label: "Monthly Reports", href: "/treasurer-dashboard/monthly-reports", isOther: true },
    { icon: HelpCircle, label: "Help Center", href: "/help", isSettings: true },
    { icon: Settings, label: "Settings", href: "/treasurer-dashboard/billing-settings", isSettings: true },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <ModernSidebar menuItems={treasurerMenuItems} title="AGASPAY" subtitle="Treasurer Portal" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <ModernHeader title="Financial Overview" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">

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