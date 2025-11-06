import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../hooks/use-auth";
import { 
  Loader2, 
  Droplets, 
  CheckCircle2, 
  Shield, 
  Clock, 
  Users,
  BarChart3,
  FileText,
  Bell,
  X,
  FileCheck,
  Wallet,
  Wrench
} from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(formData);
    } catch (err) {
      setError("Invalid username or password", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-lg">
                <Droplets className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900">AGASPAY</h1>
                <p className="text-xs text-blue-600">Waterworks Management</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#workflow" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Workflow
              </a>
              <a href="#about" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                About
              </a>
              <a href="#contact" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-screen pt-20">
        {/* Hero Section - Left Panel */}
        <div className="lg:w-3/5 relative p-8 lg:p-16 flex flex-col justify-center overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20"></div>

          <div className="relative z-10 max-w-2xl">
            {/* Subtitle */}
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
             Reliable Water, Every Drop Counts
            </div>

            {/* Main Headline */}
            <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-blue-900 mb-6 leading-tight">
              Manage water billing, track usage, and stay connected
            </h2>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              The AGASPAY platform streamlines billing operations, consolidates consumption histories, 
              and keeps your community informed every step of the way—securely and intuitively.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-lg shadow-blue-200"
                data-testid="button-get-started"
                onClick={() => setShowRequirementsModal(true)}
              >
                Connection Requirements
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                data-testid="button-explore"
              >
                Explore the Platform
              </Button>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                <div className="text-xs font-semibold text-blue-600 uppercase mb-1">ALWAYS ON</div>
                <div className="text-sm text-gray-700">24/7 Portal Access</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                <div className="text-xs font-semibold text-blue-600 uppercase mb-1">UNIFIED</div>
                <div className="text-sm text-gray-700">Centralized Water Connections</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
                <div className="text-xs font-semibold text-blue-600 uppercase mb-1">ENCRYPTED</div>
                <div className="text-sm text-gray-700">Secure Residents Data</div>
              </div>
            </div>

            {/* Feature Highlights with Icons */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-blue-100 rounded-lg p-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <span>Real-time billing and payment tracking</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                </div>
                <span>Automated water consumption monitoring</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span>Community-focused management tools</span>
              </div>
            </div>
          </div>

          {/* Decorative Illustration Area */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 hidden xl:block">
            <div className="relative w-full h-full">
              {/* Water drop illustration placeholder */}
              <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full opacity-80 blur-sm"></div>
              <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-60"></div>
              <div className="absolute bottom-1/4 right-1/2 w-20 h-20 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full opacity-50 blur-sm"></div>
            </div>
          </div>
        </div>

        {/* Login Form Section - Right Panel */}
        <div className="lg:w-2/5 bg-white flex items-center justify-center p-8 lg:p-12 shadow-2xl">
          <div className="w-full max-w-md space-y-8">
            {/* Form Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <Droplets className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back
              </h3>
              <p className="text-gray-600">
                Sign in to access your dashboard
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-1 duration-300">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                  Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Enter your username"
                  className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  data-testid="input-username"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  data-testid="input-password"
                />
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-lg shadow-blue-200 text-base font-semibold"
                disabled={isSubmitting}
                data-testid="button-login"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in to Dashboard"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Additional Options */}
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-gray-200 hover:bg-gray-50"
              >
                <Users className="mr-2 h-5 w-5 text-gray-600" />
                Sign in as Guest
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>
                Don't have an account?{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Learn more
                </a>
              </p>
              <p>
                Need help?{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Support Center
                </a>
              </p>
            </div>

            {/* Security Badge */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">Secure Access</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Your data is protected with end-to-end encryption and secure authentication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-center text-xs text-gray-500 bg-white/80 backdrop-blur-xs px-4 py-2 rounded-full shadow-sm">
        © 2025 AGASPAY Waterworks Management System. All rights reserved.
      </div>

      {/* Connection Requirements Modal */}
      {showRequirementsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-blue-600  p-6 text-white relative">
              <button
                onClick={() => setShowRequirementsModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-1xl font-bold">Water Connection Requirements</h2>
                  <p className="text-blue-100 text-sm mt-1">Step-by-step guide for new water connection</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Introduction */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    To apply for a new water connection in Barangay Biking, Dauis, Bohol, please follow these requirements and procedures:
                  </p>
                </div>

                {/* Step 1 */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">STEP 1</span>
                        <h3 className="font-bold text-gray-900">Submit Required Documents</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Visit the Barangay Hall and submit all necessary documents for your water connection application.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Required Documents:</p>
                        <ul className="text-sm text-gray-600 space-y-1 ml-4">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Valid ID (Government-issued)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Proof of Residence (Barangay Certificate or similar)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Completed Application Form</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">STEP 2</span>
                        <h3 className="font-bold text-gray-900">Provide Your Own Meter</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Applicants must purchase and provide their own water meter. The meter will be registered in the system during account creation.
                      </p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-amber-900 mb-1">Important Note:</p>
                        <p className="text-xs text-amber-800">
                          Ensure the water meter is of good quality and properly functioning. The meter number will be recorded in the system.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">STEP 3</span>
                        <h3 className="font-bold text-gray-900">Pay Connection Fee</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Pay the connection fee to the Barangay Treasurer at the barangay hall. The Treasurer will process the payment and record the transaction.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Payment Details:</p>
                        <ul className="text-sm text-gray-600 space-y-1 ml-4">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Connection fee amount (consult with Barangay Treasurer)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Official receipt will be issued upon payment</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                   
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">STEP 4</span>
                        <h3 className="font-bold text-gray-900">Account Registration</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        Once all requirements are met, the Barangay Secretary will create your account, encode your records, and register your water meter into the AGASPAY system.
                      </p>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-green-900 mb-1">What happens next:</p>
                        <p className="text-xs text-green-800">
                          Your account will be assigned a "Pending Installation" status, indicating that your application has been approved and installation is scheduled.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">STEP 5</span>
                        <h3 className="font-bold text-gray-900">Installation Scheduling</h3>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        The Barangay Secretary will schedule your water meter installation using the Schedule Task feature. You will be notified of the installation date and time.
                      </p>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Installation Process:</p>
                        <ul className="text-sm text-gray-600 space-y-1 ml-4">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Maintenance team will be assigned to your installation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>You will receive notification about the scheduled date</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>After installation, your status will change to "Active"</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Note */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Important Information</p>
                      <p className="text-xs text-blue-800">
                        Once your water connection is active, you can access the AGASPAY system to view your water bills, make online payments, report incidents, and receive important announcements from the barangay.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4  bg-gray-50 ">
              <div className="flex justify-between items-center  ">
                <p className="text-xs text-gray-600 ">
                  For more information, visit the Barangay Hall or contact the Barangay Secretary.
                </p>
                
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}