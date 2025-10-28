import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { useAuth } from "../hooks/use-auth";
import { Loader2, Droplets, Shield, Clock, Database, CheckCircle, Gauge, Users } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError("Invalid username or password");
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Hero/Marketing Section */}
      <div className="hidden lg:flex lg:w-1/2 flex-col bg-gradient-to-br from-gray-50 to-blue-50 p-12 relative overflow-hidden">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AGASPAY</h1>
              <p className="text-xs text-gray-600">Waterworks Management</p>
            </div>
          </div>
          <nav className="flex space-x-6 text-sm">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#workflow" className="text-gray-600 hover:text-gray-900">Workflow</a>
            <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
            <a href="#contact" className="text-gray-600 hover:text-gray-900">Contact</a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-xl">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 w-fit">
            <Shield className="h-4 w-4" />
            <span>Comprehensive Care, Digitally Delivered</span>
          </div>

          {/* Headline */}
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Manage water billing,<br />
            track usage, and stay<br />
            connected
          </h2>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            The AGASPAY platform streamlines billing operations, consolidates
            consumption histories, and keeps your community informed every step of the
            way—securely and intuitively.
          </p>

          {/* CTA Buttons */}
          <div className="flex space-x-4 mb-12">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md">
              Book an Appointment
            </Button>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg">
              Explore the Platform
            </Button>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-blue-600 font-semibold mb-1">ALWAYS ON</p>
              <p className="text-sm text-gray-700">24/7 Portal Access</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-blue-600 font-semibold mb-1">UNIFIED</p>
              <p className="text-sm text-gray-700">Integrated Health Records</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <p className="text-xs text-blue-600 font-semibold mb-1">ENCRYPTED</p>
              <p className="text-sm text-gray-700">Secure Patient Data</p>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Gauge className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-gray-700">Real-time billing and payment tracking</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-gray-700">Automated water consumption monitoring</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-gray-700">Community-focused management tools</span>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-40 right-40 w-48 h-48 bg-blue-500 rounded-full opacity-30 blur-2xl"></div>

        {/* Footer */}
        <div className="text-xs text-gray-500 mt-8">
          © 2025 AGASPAY Waterworks Management System. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <Droplets className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-600">Sign in to access your dashboard</p>
          </div>

          {/* Login Card */}
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Username */}
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
                    className="h-12 px-4 bg-gray-50 border-gray-300 focus:bg-white"
                    data-testid="input-username"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
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
                    className="h-12 px-4 bg-gray-50 border-gray-300 focus:bg-white"
                    data-testid="input-password"
                  />
                </div>

                {/* Remember Me */}
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                    Remember me for 30 days
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base rounded-lg shadow-md"
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
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              {/* Guest Sign In */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg"
              >
                <Users className="mr-2 h-5 w-5" />
                Sign in as Guest
              </Button>

              {/* Footer Links */}
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Contact Admin
                  </a>
                </p>
                <p className="text-sm text-gray-600">
                  Need help?{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Support Center
                  </a>
                </p>
              </div>

              {/* Security Badge */}
              <div className="mt-8 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-600">Secure Access</span>
                <span className="mx-2">•</span>
                <span>Your data is protected with end-to-end encryption and secure authentication</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
