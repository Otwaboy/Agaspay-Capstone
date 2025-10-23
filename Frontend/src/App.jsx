import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { AdminRoute, SecretaryRoute, ResidentRoute, TreasurerRoute, MeterReaderRoute, MaintenanceRoute, DashboardRoute, AnyDashboardRoute } from "./components/ProtectedRoute";


//admin
import Dashboard from "./pages/dashboard";
import AdminUsers from "./pages/admin-users";
import AdminPersonnel from "./pages/admin-personnel";
import AdminConnections from "./pages/admin-connections";
import AdminBilling from "./pages/admin-billing";
import AdminReports from "./pages/admin-reports";
import AdminScheduling from "./pages/admin-scheduling";
import AdminIncidents from "./pages/admin-incidents";
import AdminSettings from "./pages/admin-settings";

//secretary
import SecretaryDashboard from "./pages/secretaryDashboard";
import SecretaryAnnouncements from "./pages/secretary-announcements";
import SecretaryResidents from "./pages/secretary-residents";
import SecretaryRegistration from "./pages/secretary-registration";
import SecretaryDocuments from "./pages/secretary-documents";
import SecretaryAppointments from "./pages/secretary-appointments";
import SecretarySettings from "./pages/secretary-settings";
import SecretaryApplications from "./pages/secretary-applications";

//meter- reader
import MeterReaderDashboard from "./pages/meter-reader-dashboard";
import MeterReaderReadings from "./pages/meter-reader-readings";

//treasurer
import TreasurerDashboard from "./pages/treasurerDashboard";
import TreasurerGenerateBills from "./pages/treasurer-generate-bills";
import TreasurerPaymentCollection from "./pages/treasurer-payment-collection";
import TreasurerRevenueReports from "./pages/treasurer-revenue-reports";
import TreasurerOutstandingBalances from "./pages/treasurer-outstanding-balances";
import TreasurerMonthlyReports from "./pages/treasurer-monthly-reports";
import TreasurerAnnualReports from "./pages/treasurer-annual-reports";
import TreasurerCustomReports from "./pages/treasurer-custom-reports";
import TreasurerBillHistory from "./pages/treasurer-bill-history";
import TreasurerBillingSettings from "./pages/treasurer-billing-settings";
import TreasurerAnalytics from "./pages/treasurer-analytics";
import TreasurerPaymentMethods from "./pages/treasurer-payment-methods";
import TreasurerCustomerAccounts from "./pages/treasurer-customer-accounts";
import TreasurerFinancialAlerts from "./pages/treasurer-financial-alerts";

//residents
import ResidentDashboard from "./pages/residentDashboard";
import PaymentSuccess from "./components/payment-success";
import DemoCheckout from "./components/demo-checkout";
import ResidentPaymentHistory from "./pages/resident-payment-history";
import ResidentAnnouncements from "./pages/resident-announcements";
import ResidentProfile from "./pages/resident-profile";
import ResidentBills from "./pages/resident-bills";
import ResidentReportIssue from "./pages/resident-report-issue";
import ResidentServiceRequests from "./pages/resident-service-requests";
import ResidentSettings from "./pages/resident-settings";
import ResidentUsage from "./pages/resident-usage";

// Maintenance
import MaintenanceDashboard from "./pages/maintenance-dashboard";
import MaintenanceIncidents from "./pages/maintenance-incidents";
import MaintenanceTasks from "./pages/maintenance-tasks";





import Login from "./pages/login";
import NotFound from "./pages/not-found";
import { Toaster } from "./components/ui/toaster";
import "./index.css";

const queryClient = new QueryClient();

function DashboardRouter() {
  const { isAdmin, isSecretary, isTreasurer, isMeterReader, isResident, isMaintenance } = useAuth();
  
  if (isAdmin) return <Dashboard />;
  if (isSecretary) return <SecretaryDashboard />;
  if (isTreasurer) return <TreasurerDashboard />;
  if (isMeterReader) return <MeterReaderDashboard />;
  if (isResident) return <ResidentDashboard />;
  if (isMaintenance) return <MaintenanceDashboard/>

  
  return <NotFound />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Switch>
            <Route path="/">
              {() => (
                <AnyDashboardRoute>
                  <DashboardRouter />
                </AnyDashboardRoute>
              )}
            </Route>
            <Route path="/dashboard">
              {() => (
                <AnyDashboardRoute>
                  <DashboardRouter />
                </AnyDashboardRoute>
              )}
            </Route>
            <Route path="/admin">
              {() => (
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              )}
            </Route>

            {/* secretary */}
            <Route path="/secretary-dashboard">
              {() => (
                <SecretaryRoute>
                  <SecretaryDashboard />
                </SecretaryRoute>
              )}
            </Route>
           
            <Route path="/secretary-dashboard/residents">
              {() => (
                <SecretaryRoute>
                  <SecretaryResidents />
                </SecretaryRoute>
              )}
            </Route>             
            <Route path="/secretary-dashboard/registration">
              {() => (
                <SecretaryRoute>
                  <SecretaryRegistration />
                </SecretaryRoute>
              )}
            </Route>             
            <Route path="/secretary-dashboard/documents">
              {() => (
                <SecretaryRoute>
                  <SecretaryDocuments />
                </SecretaryRoute>
              )}
            </Route>             
            <Route path="/secretary-dashboard/applications">
              {() => (
                <SecretaryRoute>
                  <SecretaryApplications />
                </SecretaryRoute>
              )}
            </Route>          
            <Route path="/secretary-dashboard/appointments">
              {() => (
                <SecretaryRoute>
                  <SecretaryAppointments/>
                </SecretaryRoute>
              )}
            </Route>            
            <Route path="/secretary-dashboard/announcements">
              {() => (
                <SecretaryRoute>
                  <SecretaryAnnouncements />
                </SecretaryRoute>
              )}
            </Route>
             <Route path="/secretary-dashboard/settings">
              {() => (
                <SecretaryRoute>
                  <SecretarySettings />
                </SecretaryRoute>
              )}
            </Route>
            



            {/* Treasurer */}
             <Route path="/treasurer-dashboard">
              {() => (
                  <TreasurerRoute>
                      <TreasurerDashboard/>
                  </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/billing/generate">
              {() => (
                <TreasurerRoute>
                  <TreasurerGenerateBills />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/revenue/payment-collection">
              {() => (
                <TreasurerRoute>
                  <TreasurerPaymentCollection />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/revenue/revenue-reports">
              {() => (
                <TreasurerRoute>
                  <TreasurerRevenueReports />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/revenue/outstanding-balances">
              {() => (
                <TreasurerRoute>
                  <TreasurerOutstandingBalances />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/reports/monthly">
              {() => (
                <TreasurerRoute>
                  <TreasurerMonthlyReports />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/reports/annual">
              {() => (
                <TreasurerRoute>
                  <TreasurerAnnualReports />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/reports/custom">
              {() => (
                <TreasurerRoute>
                  <TreasurerCustomReports />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/billing/history">
              {() => (
                <TreasurerRoute>
                  <TreasurerBillHistory />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/billing/settings">
              {() => (
                <TreasurerRoute>
                  <TreasurerBillingSettings />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/analytics">
              {() => (
                <TreasurerRoute>
                  <TreasurerAnalytics />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/payment-methods">
              {() => (
                <TreasurerRoute>
                  <TreasurerPaymentMethods />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/customer-accounts">
              {() => (
                <TreasurerRoute>
                  <TreasurerCustomerAccounts />
                </TreasurerRoute>
              )}
            </Route>
            <Route path="/treasurer-dashboard/financial-alerts">
              {() => (
                <TreasurerRoute>
                  <TreasurerFinancialAlerts />
                </TreasurerRoute>
              )}
            </Route>

            {/* Meter Reader */}
            <Route path="/meter-reader-dashboard">
              {() => (
                  <MeterReaderRoute>
                      <MeterReaderDashboard/>
                  </MeterReaderRoute>
              )}
            </Route>
            <Route path="/meter-reader-dashboard/readings">
                {() => (
                  <MeterReaderRoute>
                    <MeterReaderReadings />
                  </MeterReaderRoute>
                )}
              </Route>

              {/* Resident */}
            <Route path="/resident-dashboard">
              {() => (
                <ResidentRoute>
                  <ResidentDashboard />
                </ResidentRoute>
              )}
            </Route>
            <Route path="/resident-dashboard/payment-history">
              {() => (
                <ResidentRoute>
                  <ResidentPaymentHistory />
                </ResidentRoute>
              )}
            </Route>
            <Route path="/resident-dashboard/bills">
              {() => (
                <ResidentRoute>
                  <ResidentBills />
                </ResidentRoute>
              )}
            </Route>
            <Route path="/resident-dashboard/usage">
              {() => (
                <ResidentRoute>
                  <ResidentUsage />
                </ResidentRoute>
              )}
            </Route>
            <Route path="/resident-dashboard/service-requests">
              {() => (
                <ResidentRoute>
                  <ResidentServiceRequests />
                </ResidentRoute>
              )}
            </Route>
            <Route path="/resident-dashboard/report-issue">
              {() => (
                <ResidentRoute>
                  <ResidentReportIssue />
                </ResidentRoute>
              )}
            </Route>
            <Route path="/resident-dashboard/announcements">
              {() => (
                <ResidentRoute>
                  <ResidentAnnouncements />
                </ResidentRoute>
              )}
            </Route>
            <Route path="/resident-dashboard/profile">
              {() => (
                <ResidentRoute>
                  <ResidentProfile />
                </ResidentRoute>
              )}
            </Route>
            <Route path="/resident-dashboard/settings">
              {() => (
                <ResidentRoute>
                  <ResidentSettings />
                </ResidentRoute>
              )}
            </Route>

            {/* Maintenance */}
            <Route path="/maintenance-dashboard">
              {() => (
                <MaintenanceRoute>
                  <MaintenanceDashboard />
                </MaintenanceRoute>
              )}
            </Route>
            <Route path="/maintenance-dashboard/tasks">
              {() => (
                <MaintenanceRoute>
                  <MaintenanceTasks />
                </MaintenanceRoute>
              )}
            </Route>
            <Route path="/maintenance-dashboard/incidents">
              {() => (
                <MaintenanceRoute>
                  <MaintenanceIncidents />
                </MaintenanceRoute>
              )}
            </Route>
            

            {/* Admin */}
            <Route path="/admin-dashboard/users">
              {() => (
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              )}
            </Route>
            <Route path="/admin-dashboard/personnel">
              {() => (
                <AdminRoute>
                  <AdminPersonnel />
                </AdminRoute>
              )}
            </Route>
            <Route path="/admin-dashboard/connections">
              {() => (
                <AdminRoute>
                  <AdminConnections />
                </AdminRoute>
              )}
            </Route>
            <Route path="/admin-dashboard/billing">
              {() => (
                <AdminRoute>
                  <AdminBilling />
                </AdminRoute>
              )}
            </Route>
            <Route path="/admin-dashboard/reports">
              {() => (
                <AdminRoute>
                  <AdminReports />
                </AdminRoute>
              )}
            </Route>
            <Route path="/admin-dashboard/scheduling">
              {() => (
                <AdminRoute>
                  <AdminScheduling />
                </AdminRoute>
              )}
            </Route>
            <Route path="/admin-dashboard/incidents">
              {() => (
                <AdminRoute>
                  <AdminIncidents />
                </AdminRoute>
              )}
            </Route>
            <Route path="/admin-dashboard/settings">
              {() => (
                <AdminRoute>
                  <AdminSettings />
                </AdminRoute>
              )}
            </Route>
            
            <Route path="/payment/demo-checkout" component={DemoCheckout} />
            <Route path="/payment/success" component={PaymentSuccess} />
            <Route path="/payment/cancel" component={PaymentSuccess} />
            <Route path="/login" component={Login} />
            <Route component={NotFound} />

          </Switch>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;