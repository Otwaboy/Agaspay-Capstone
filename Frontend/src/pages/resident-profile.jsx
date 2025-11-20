import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import { User, Mail, Phone, Droplets, Edit, Save, X } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { toast } from "sonner";
import apiClient from "../lib/api";

export default function ResidentProfile() {
  const { user } = useAuth();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const { data: connectionData } = useQuery({
    queryKey: ["/api/v1/water-connection"],
    queryFn: async () => {
      const res = await apiClient.getAllWaterConnections();
      return res.data?.[0] || null;
    },
    retry: 1
  });

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    verification_code: ""
  });

  useEffect(() => {
    if (connectionData || user) {
      setFormData({
        email: connectionData?.email || "",
        phone: connectionData?.contact_no || "",
        verification_code: ""
      });
    }
  }, [connectionData, user]);

  const handleSendVerification = async () => {
    if (!formData.email || formData.email === connectionData?.email) {
      toast.error("Invalid Email", { description: "Enter a new email to verify" });
      return;
    }

    try {
      await apiClient.updateUserContact({ email: formData.email });
      setVerificationSent(true);
      toast.success("Verification Sent", { description: "Check your email for the verification code" });
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";

      // Check for duplicate email error
      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('already in use')) {
        toast.error("Email Already in Use", {
          description: "This email is already registered. Please use a different email address."
        });
      } else {
        toast.error("Failed to Send Verification", { description: errorMessage });
      }
    }
  };

  const handleSaveEmail = async () => {
    try {
      await apiClient.updateUserContact({
        email: formData.email,
        verification_code: formData.verification_code
      });

      toast.success("Email Updated", { description: "Your email has been updated successfully" });

      setIsEditingEmail(false);
      setVerificationSent(false);
      setFormData({ ...formData, verification_code: "" });

    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";

      if (errorMessage.toLowerCase().includes('duplicate') || errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('already in use')) {
        toast.error("Email Already in Use", {
          description: "This email is already registered. Please use a different email address."
        });
      } else if (errorMessage.toLowerCase().includes('verification') || errorMessage.toLowerCase().includes('code')) {
        toast.error("Verification Failed", {
          description: "Invalid or expired verification code. Please request a new code."
        });
      } else {
        toast.error("Update Failed", { description: errorMessage });
      }
    }
  };

  const handleSavePhone = async () => {
    try {
      await apiClient.updateUserContact({
        contact_no: formData.phone
      });

      toast.success("Phone Updated", { description: "Your phone number has been updated successfully" });

      setIsEditingPhone(false);

    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";
      toast.error("Update Failed", { description: errorMessage });
    }
  };

  const handleCancelEmail = () => {
    setFormData({
      ...formData,
      email: connectionData?.email || "",
      verification_code: ""
    });
    setVerificationSent(false);
    setIsEditingEmail(false);
  };

  const handleCancelPhone = () => {
    setFormData({
      ...formData,
      phone: connectionData?.contact_no || ""
    });
    setIsEditingPhone(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ResidentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2 mb-8">Manage your personal information and account details</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* LEFT SIDE */}
              <div className="lg:col-span-2 space-y-6">

                {/* Personal Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <User className="h-5 w-5 text-blue-600" />
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Your personal information and details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-500">First Name</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            {connectionData?.first_name || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Last Name</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            {connectionData?.last_name || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Zone</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            Biking {connectionData?.zone || "Residential"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Purok</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            Purok {connectionData?.purok || "Residential"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Info Card */}
                <Card className="relative">
                  <CardHeader>
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <Phone className="h-5 w-5 text-blue-600" />
                        Contact Information
                      </CardTitle>
                      <CardDescription>Update your contact details</CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Email */}
                      <div className="space-y-2  p-4 relative">
                        <Label>Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={!isEditingEmail}
                            className="pl-10"
                          />
                        </div>

                        {!verificationSent && isEditingEmail && formData.email !== connectionData?.email && (
                          <Button
                            onClick={handleSendVerification}
                            size="sm"
                            className="mt-2"
                          >
                            Send Verification
                          </Button>
                        )}

                        {verificationSent && isEditingEmail && (
                          <div className="mt-2">
                            <Label>Enter Verification Code</Label>
                            <Input
                              value={formData.verification_code}
                              onChange={(e) => setFormData({ ...formData, verification_code: e.target.value })}
                              placeholder="Enter code from email"
                            />
                          </div>
                        )}

                        {connectionData?.pending_email && !isEditingEmail && (
                          <p className="text-sm text-orange-600 mt-1">
                            Verification pending for <strong>{connectionData.pending_email}</strong>. Check your email.
                          </p>
                        )}

                        {/* Email Edit/Save/Cancel Buttons */}
                        {!isEditingEmail ? (
                          <Button
                            onClick={() => setIsEditingEmail(true)}
                            size="sm"
                            className="absolute  -top-1 right-2"
                          >
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2 absolute  -top-1 right-2">
                            <Button
                              onClick={handleSaveEmail}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              disabled={!verificationSent || !formData.verification_code}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelEmail}
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Phone */}
                      <div className="space-y-2  p-4 relative">
                        <Label>Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={!isEditingPhone}
                            className="pl-10"
                          />
                        </div>

                        {/* Phone Edit/Save/Cancel Buttons */}
                        {!isEditingPhone ? (
                          <Button
                            onClick={() => setIsEditingPhone(true)}
                            size="sm"
                            className="absolute  -top-1 right-2"
                          >
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </Button>
                        ) : (
                          <div className="flex gap-2 absolute  -top-1 right-2">
                            <Button
                              onClick={handleSavePhone}
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleCancelPhone}
                              size="sm"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Water Connection Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <Droplets className="h-5 w-5 text-blue-600" />
                      Water Connection Details
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Your water service connection information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-500">Connection ID</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            {connectionData?.connection_id || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Meter Number</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            {connectionData?.meter_no || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Connection Type</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            {connectionData?.type || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Status</Label>
                          <div className="mt-1">
                            <Badge className="bg-green-100 text-green-800 mt-1">
                              {connectionData?.connection_status || "Active"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* RIGHT SIDE */}
              <div className="space-y-6">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Account Summary</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Account Status</Label>
                      <p className="font-semibold text-green-600 mt-1">Active</p>
                    </div>
                    <Separator />
                    <div>
                      <Label>Member Since</Label>
                      <p className="font-medium mt-1">
                        {connectionData?.created_at
                          ? new Date(connectionData.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
                          : "N/A"}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <Label>Username</Label>
                      <p className="font-medium mt-1">{user?.username || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> To update your address or water connection details, please visit the barangay office.
                    </p>
                  </CardContent>
                </Card>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
