import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { AdminRoute, SecretaryRoute, ResidentRoute, TreasurerRoute, MeterReaderRoute,DashboardRoute, AnyDashboardRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard";
import SecretaryDashboard from "./pages/secretaryDashboard";
import MeterReaderDashboard from "./pages/meter-reader-dashboard";
import MeterReaderReadings from "./pages/meter-reader-readings";
import TreasurerDashboard from "./pages/treasurerDashboard";
import TreasurerGenerateBills from "./pages/treasurer-generate-bills";
import ResidentDashboard from "./pages/residentDashboard";
import PaymentSuccess from "./components/payment-success";
import DemoCheckout from "./components/demo-checkout";
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
             <Route path="/treasurer">
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
            <Route path="/meter-reader">
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
            <Route path="/resident">
              {() => (
                <ResidentRoute>
                  <ResidentDashboard />
                </ResidentRoute>
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