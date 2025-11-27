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
  X,
  Menu,
  Mail,
  Phone,
  MapPin,
  Zap,
  TrendingUp,
  ArrowRight,
  AlertCircle,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLearnMoreModal, setShowLearnMoreModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

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
      // Check if error is related to archived account
      const errorMessage = err?.message || err?.response?.data?.message || err?.toString() || "";

      if (errorMessage.toLowerCase().includes('archived')) {
        setError("Your account has been archived. Please contact the administrator for assistance.");
      } else if (errorMessage.toLowerCase().includes('password')) {
        setError("Incorrect password. Please try again.");
      } else if (errorMessage.toLowerCase().includes('username')) {
        setError("Username does not exist.");
      } else {
        setError("Invalid username or password");
      }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#workflow" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Workflow
              </a>
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                About
              </a>
              <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 md:hidden transform transition-transform">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-lg">
                    <Droplets className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-blue-900">AGASPAY</h1>
                    <p className="text-xs text-blue-600">Navigation</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sidebar Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <Zap className="h-5 w-5" />
                  <span className="font-medium">Features</span>
                </a>
                <a
                  href="#workflow"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span className="font-medium">Workflow</span>
                </a>
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">About</span>
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  <span className="font-medium">Contact</span>
                </a>
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-900 mb-1">Need Help?</p>
                  <p className="text-xs text-blue-700">
                    Contact the Barangay Hall for assistance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

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
                Hello, Welcome 
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
                <button
                  onClick={() => setShowLearnMoreModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Learn more
                </button>
              </p>
              <p>
                Need help?{" "}
                <button
                  onClick={() => setShowSupportModal(true)}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Support Center
                </button>
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

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features for Modern Water Management</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage, monitor, and maintain your water system efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <BarChart3 className="h-6 w-6 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Real-Time Billing</h3>
              <p className="text-gray-600">
                Track water consumption and bills in real-time with automated calculations and instant updates
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <Clock className="h-6 w-6 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Monitoring</h3>
              <p className="text-gray-600">
                Automatic meter reading scheduling and consumption tracking for accurate billing cycles
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <Shield className="h-6 w-6 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Platform</h3>
              <p className="text-gray-600">
                End-to-end encryption and role-based access control to protect your data and privacy
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <Users className="h-6 w-6 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Community Tools</h3>
              <p className="text-gray-600">
                Announcements, incident reporting, and communication tools for the entire community
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <Zap className="h-6 w-6 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Quick Payments</h3>
              <p className="text-gray-600">
                Multiple payment options with instant confirmation and digital receipt generation
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                <TrendingUp className="h-6 w-6 text-blue-600 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Usage Analytics</h3>
              <p className="text-gray-600">
                Detailed consumption reports and analytics to help you understand water usage patterns
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How AGASPAY Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A seamless workflow from registration to payment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Register Account</h3>
                <p className="text-gray-600 text-sm">
                  Visit the Barangay Hall to submit requirements and register your water connection
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-300"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Meter Installation</h3>
                <p className="text-gray-600 text-sm">
                  Maintenance team installs your water meter and activates your connection
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-300"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Monthly Reading</h3>
                <p className="text-gray-600 text-sm">
                  Meter readers record your water consumption and generate monthly bills
                </p>
              </div>
              <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-blue-300"></div>
            </div>

            {/* Step 4 */}
            <div>
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">
                  4
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Pay Your Bill</h3>
                <p className="text-gray-600 text-sm">
                  View bills online and make payments at the Barangay Hall or through digital channels
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">About AGASPAY</h2>
              <p className="text-lg text-gray-600 mb-6">
                AGASPAY is the official waterworks management system of Barangay Biking, Dauis, Bohol.
                We are committed to providing reliable, transparent, and efficient water services to our community.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Our Mission</h3>
                    <p className="text-gray-600">
                      To ensure every household has access to clean, affordable water through sustainable management practices
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Our Vision</h3>
                    <p className="text-gray-600">
                      A community where water management is transparent, efficient, and accessible to all residents
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="text-4xl font-bold text-blue-600 mb-2">900+</div>
                <div className="text-gray-600">Active Connections</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">System Availability</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="text-4xl font-bold text-blue-600 mb-2">99%</div>
                <div className="text-gray-600">Customer Satisfaction</div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="text-4xl font-bold text-blue-600 mb-2">10+</div>
                <div className="text-gray-600">Years of Service</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Have questions or need assistance? We're here to help
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Contact Card 1 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600 mb-2">Call us during office hours</p>
              <a href="tel:+639123456789" className="text-blue-600 font-semibold hover:text-blue-700">
                +63 912 345 6789
              </a>
            </div>

            {/* Contact Card 2 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600 mb-2">Send us an email</p>
              <a href="mailto:agaspay@barangaybiking.gov.ph" className="text-blue-600 font-semibold hover:text-blue-700">
                agaspay@barangaybiking.gov.ph
              </a>
            </div>

            {/* Contact Card 3 */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 text-center hover:shadow-lg transition-all">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-2">Barangay Hall</p>
              <p className="text-blue-600 font-semibold">
                Biking, Dauis, Bohol
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 md:p-12 text-center text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Visit our Barangay Hall to apply for a water connection and join hundreds of satisfied residents
            </p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => setShowRequirementsModal(true)}
            >
              View Requirements
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="bg-white p-2 rounded-lg">
              <Droplets className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AGASPAY</h1>
              <p className="text-xs text-blue-300">Waterworks Management</p>
            </div>
          </div>
          <p className="text-blue-200 text-sm">
            © 2025 AGASPAY Waterworks Management System. All rights reserved.
          </p>
        </div>
      </footer>

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

      {/* Learn More Modal */}
      {showLearnMoreModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white relative">
              <button
                onClick={() => setShowLearnMoreModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Getting Started with AGASPAY</h2>
                  <p className="text-blue-100 text-sm mt-1">Your guide to creating an account</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Who Can Use */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Who Can Use AGASPAY?
                  </h3>
                  <p className="text-gray-700 text-sm mb-3">
                    AGASPAY accounts are created by the Barangay Secretary for:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Residents</strong> - View bills, make payments, and report issues</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span><strong>Barangay Personnel</strong> - Manage water connections, billing, and maintenance</span>
                    </li>
                  </ul>
                </div>

                {/* How to Get Started */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">How to Get Started</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Visit the Barangay Hall</h4>
                        <p className="text-sm text-gray-600">
                          Go to Barangay Biking Hall during office hours (Monday-Friday, 8:00 AM - 5:00 PM)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Submit Requirements</h4>
                        <p className="text-sm text-gray-600">
                          Bring valid ID, proof of residence, and completed application form
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Provide Your Meter</h4>
                        <p className="text-sm text-gray-600">
                          Purchase and provide your own water meter for registration
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        4
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Pay Connection Fee</h4>
                        <p className="text-sm text-gray-600">
                          Pay the required connection fee to the Barangay Treasurer
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        5
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Account Creation</h4>
                        <p className="text-sm text-gray-600">
                          The Secretary will create your account and provide login credentials
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What You Can Do */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="font-bold text-gray-900 mb-3">What You Can Do with AGASPAY</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>View water bills and payment history</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Track water consumption</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Report water issues</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Receive announcements</span>
                    </div>
                  </div>
                </div>

                {/* Important Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 mb-1">Important Information</p>
                      <p className="text-xs text-amber-800">
                        Residents cannot create accounts themselves. All accounts must be created by the Barangay Secretary
                        after completing the water connection application process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-600">
                Need more details? Contact the Barangay Hall
              </p>
              <Button
                onClick={() => setShowLearnMoreModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Support Center Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white relative">
              <button
                onClick={() => setShowSupportModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Support Center</h2>
                  <p className="text-blue-100 text-sm mt-1">We're here to help you</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* FAQ Section */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Frequently Asked Questions</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">How do I pay my water bill?</h4>
                      <p className="text-sm text-gray-600">
                        You can pay at the Barangay Hall during office hours. Online payment options may be available
                        through your account dashboard.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">What if I forgot my password?</h4>
                      <p className="text-sm text-gray-600">
                        Contact the Barangay Secretary to reset your password. Visit the Barangay Hall with a valid ID.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">How often are meter readings taken?</h4>
                      <p className="text-sm text-gray-600">
                        Meter readers visit monthly to record your water consumption. You'll be notified of your billing period.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">How do I report a water leak or issue?</h4>
                      <p className="text-sm text-gray-600">
                        Log in to your account and use the incident reporting feature, or call the Barangay Hall directly.
                      </p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">Can I view my payment history?</h4>
                      <p className="text-sm text-gray-600">
                        Yes, all payment history and water consumption records are available in your dashboard once you log in.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">+63 912 345 6789</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="text-sm font-semibold text-gray-900">agaspay@barangaybiking.gov.ph</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Address</p>
                        <p className="text-sm font-semibold text-gray-900">Barangay Biking, Dauis, Bohol</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Office Hours</p>
                        <p className="text-sm font-semibold text-gray-900">Mon-Fri: 8:00 AM - 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900 mb-1">Emergency Water Issues</p>
                      <p className="text-xs text-red-800">
                        For urgent water-related emergencies (major leaks, no water supply), call the emergency hotline:
                        <strong> +63 912 345 6789</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
              <p className="text-xs text-gray-600">
                Still need help? Visit us at the Barangay Hall
              </p>
              <Button
                onClick={() => setShowSupportModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}