import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { AdminRoute, SecretaryRoute, ResidentRoute, TreasurerRoute, MeterReaderRoute,DashboardRoute, AnyDashboardRoute } from "./components/ProtectedRoute";
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



import Login from "./pages/login";
import NotFound from "./pages/not-found";
import { Toaster } from "./components/ui/toaster";
import "./index.css";

const queryClient = new QueryClient();

function DashboardRouter() {
  const { isAdmin, isSecretary, isTreasurer, isMeterReader, isResident } = useAuth();
  
  if (isAdmin) return <Dashboard />;
  if (isSecretary) return <SecretaryDashboard />;
  if (isTreasurer) return <TreasurerDashboard />;
  if (isMeterReader) return <MeterReaderDashboard />;
  if (isResident) return <ResidentDashboard />;

  
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
            <Route path="/secretary">
              {() => (
                <SecretaryRoute>
                  <SecretaryDashboard />
                </SecretaryRoute>
              )}
            </Route>
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