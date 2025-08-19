import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./hooks/use-auth";
import { AdminRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/dashboard";
import Login from "./pages/login";
import NotFound from "./pages/not-found";
import { Toaster } from "./components/ui/toaster";
import "./index.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Switch>
            <Route path="/">
              {() => (
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              )}
            </Route>
            <Route path="/dashboard">
              {() => (
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              )}
            </Route>
            <Route path="/admin">
              {() => (
                <AdminRoute>
                  <Dashboard />
                </AdminRoute>
              )}
            </Route>
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