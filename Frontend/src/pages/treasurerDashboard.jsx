import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, TrendingUp, FileText, BarChart3, PhilippinePesoIcon } from "lucide-react";
import { useAuth } from "../hooks/use-auth"
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "..//components/layout/treasurer-top-header";
import TreasurerFooter from "../components/layout/treasurer-footer";
import TreasurerStatsCards from "..//components/dashboard/treasurer-stats-cards";
import TreasurerRecentTransactions from "../components/dashboard/treasurer-recent-transactions";
import TreasurerFinancialSummary from "../components/dashboard/treasurer-financial-summary";




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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <TreasurerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TreasurerTopHeader />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 relative z-10">
          <div className="max-w-7xl mx-auto">
              <div className="lg:col-span-2 ">
               <TreasurerStatsCards />
                  
              </div>
 
            {/* Welcome Information Section */}
            <div className="mb-6 py-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <PhilippinePesoIcon className="h-7 w-7 text-white" />
                </div> 
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Welcome to AGASPAY Financial Management Portal
                  </h2>
                  <p className="text-base text-gray-700 mb-5 leading-relaxed">
                    As the Treasurer, you have full control over the financial operations of Barangay Biking's water service.
                    Manage billing cycles, track payment collections, monitor outstanding balances, and generate comprehensive
                    financial reports—all designed to ensure accurate and transparent financial management.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <PhilippinePesoIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Payment Collection</h3>
                        <p className="text-sm text-gray-600">Process and track all payment transactions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Billing Management</h3>
                        <p className="text-sm text-gray-600">Generate and manage monthly billing cycles</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BarChart3 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Financial Reports</h3>
                        <p className="text-sm text-gray-600">Generate comprehensive revenue and analytics reports</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

             <div className="grid grid-cols-1 gap-6 mb-6">
              <div className="lg:col-span-8">
                <TreasurerRecentTransactions />
                
              </div>
              {/* <div className="lg:col-span-4">
                
             
              </div> */}
            </div>

            

           
            <TreasurerFooter />
          </div>
        </main>
      </div>
    </div>
  );
}