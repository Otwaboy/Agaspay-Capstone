import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";
import { User, Mail, Phone, Edit, Save, X, Briefcase, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { toast } from "sonner";
import apiClient from "../lib/api";

export default function TreasurerProfile() {
  const { user } = useAuth();
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneValidation, setPhoneValidation] = useState({ checking: false, valid: null });
  const [phoneFieldValidation, setPhoneFieldValidation] = useState(null);


  const { data: personnelData } = useQuery({
    queryKey: ["/api/v1/personnel/me"],
    queryFn: async () => {
      const res = await apiClient.getPersonnelProfile();
      return res.data || null;
    },
    retry: 1
  });

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    verification_code: ""
  });

  useEffect(() => {
    if (personnelData || user) {
      setFormData({
        email: personnelData?.email || "",
        phone: personnelData?.contact_no || "",
        verification_code: ""
      });
      setPhoneValidation({ checking: false, valid: null });
      setPhoneFieldValidation(null);
    }
  }, [personnelData, user]);

  // Check phone number existence
  const checkPhoneNumberExistence = async (phone) => {
    setPhoneValidation({ checking: true, valid: null });
    try {
      const result = await apiClient.checkPhoneNumberExists(phone);
      // If exists is true, the phone is NOT available
      setPhoneValidation({ checking: false, valid: !result.exists });
    } catch (error) {
      // If error, assume not available (safe approach)
      setPhoneValidation({ checking: false, valid: false });
      console.error('Error checking phone number:', error);
    }
  };

  // useEffect for phone validation with debounce
  useEffect(() => {
    if (!isEditingPhone) return;

    const phone = formData.phone.trim();
    const originalPhone = personnelData?.contact_no || "";

    // If phone hasn't changed, reset validation
    if (phone === originalPhone) {
      setPhoneValidation({ checking: false, valid: null });
      setPhoneFieldValidation(null);
      return;
    }

    const phoneRegex = /^[\d\s+\-()]{7,}$/;
    const digitsOnly = phone.replace(/\D/g, '');
    const isValidFormat = phoneRegex.test(phone);
    const isValidLength = digitsOnly.length <= 11;

    setPhoneFieldValidation(isValidFormat && isValidLength);

    if (phone && isValidFormat && isValidLength) {
      const timer = setTimeout(() => {
        checkPhoneNumberExistence(phone);
      }, 500); // debounce 500ms

      return () => clearTimeout(timer);
    } else {
      setPhoneValidation({ checking: false, valid: null });
    }
  }, [formData.phone, isEditingPhone, personnelData]);



  const handleSavePhone = async () => {
    const phone = formData.phone.trim();
    const originalPhone = personnelData?.contact_no || "";

    // Validate phone is not empty
    if (!phone) {
      toast.error("Validation Error", { description: "Phone number is required" });
      return;
    }

    // Validate format and length
    const phoneRegex = /^[\d\s+\-()]{7,}$/;
    const digitsOnly = phone.replace(/\D/g, '');
    const isValidFormat = phoneRegex.test(phone);
    const isValidLength = digitsOnly.length <= 11;

    if (!isValidFormat || !isValidLength) {
      toast.error("Validation Error", { description: "Phone number must be valid (7-11 digits)" });
      return;
    }

    // If phone hasn't changed, just close edit mode
    if (phone === originalPhone) {
      setIsEditingPhone(false);
      return;
    }

    // Check if phone is still being validated
    if (phoneValidation.checking) {
      toast.error("Validation Error", { description: "Please wait while we check phone availability" });
      return;
    }

    // Check if phone already exists
    if (phoneValidation.valid === false) {
      toast.error("Validation Error", { description: "This phone number is already registered" });
      return;
    }

    try {
      await apiClient.updatePersonnelContact({
        contact_no: phone
      });

      toast.success("Phone Updated", { description: "Your phone number has been updated successfully" });

      setIsEditingPhone(false);
      setPhoneValidation({ checking: false, valid: null });
      setPhoneFieldValidation(null);

    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || "Something went wrong";
      toast.error("Update Failed", { description: errorMessage });
    }
  };



  const handleCancelPhone = () => {
    setFormData({
      ...formData,
      phone: personnelData?.contact_no || ""
    });
    setIsEditingPhone(false);
    setPhoneValidation({ checking: false, valid: null });
    setPhoneFieldValidation(null);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <TreasurerSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <TreasurerTopHeader />

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
                            {personnelData?.first_name || user?.firstName || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Last Name</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            {personnelData?.last_name || user?.lastName || "N/A"}
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Position</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            {personnelData?.position || "Treasurer"}
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm text-gray-500">Purok</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            {personnelData?.purok
                              ? `Purok ${personnelData.purok}`
                              : "N/A"}
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
                     <div className="space-y-2 p-4 relative">
                        <Label>Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-black-400" />
                           <div className="mt-1 ml-7 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            {formData.email}
                          </div>
                        </div>   
                      </div>

                      {/* Phone */}
                      <div className="space-y-2 p-4 relative">
                        <Label>Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={!isEditingPhone}
                            className={`pl-10 ${
                              isEditingPhone && formData.phone !== (personnelData?.contact_no || "")
                                ? phoneValidation.valid === false || (phoneFieldValidation === false && formData.phone)
                                  ? "border-red-500 border-2 focus:ring-red-500"
                                  : phoneValidation.valid === true && phoneFieldValidation === true
                                  ? "border-green-500 border-2 focus:ring-green-500"
                                  : ""
                                : ""
                            }`}
                          />
                          {isEditingPhone && phoneValidation.checking && phoneFieldValidation && formData.phone !== (personnelData?.contact_no || "") && (
                            <div className="absolute right-3 top-3">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                            </div>
                          )}
                          {isEditingPhone && phoneValidation.valid === true && phoneFieldValidation === true && formData.phone !== (personnelData?.contact_no || "") && !phoneValidation.checking && (
                            <div className="absolute right-3 top-3 text-green-500">
                              ✓
                            </div>
                          )}
                        </div>

                        {/* Validation Messages */}
                        {isEditingPhone && formData.phone !== (personnelData?.contact_no || "") && (
                          <>
                            {phoneFieldValidation === false && (
                              <div className="flex items-center gap-1 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>Phone number must be valid (7-11 digits)</span>
                              </div>
                            )}
                            {phoneValidation.valid === false && phoneFieldValidation !== false && (
                              <div className="flex items-center gap-1 text-red-600 text-sm">
                                <AlertCircle className="h-4 w-4" />
                                <span>This phone number is already registered</span>
                              </div>
                            )}
                            {phoneValidation.valid === true && phoneFieldValidation === true && (
                              <p className="text-xs text-green-600">Phone number is available</p>
                            )}
                          </>
                        )}

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
                              disabled={
                                phoneValidation.checking ||
                                (formData.phone !== (personnelData?.contact_no || "") &&
                                  (phoneFieldValidation === false || phoneValidation.valid === false)) ||
                                formData.phone === (personnelData?.contact_no || "")
                              }
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

                {/* Employment Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <Briefcase className="h-5 w-5 text-blue-600" />
                      Employment Details
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Your employment information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-500">Department</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            Finance
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Status</Label>
                          <div className="mt-1">
                            <Badge className="bg-green-100 text-green-800 mt-1">
                              {personnelData?.status || "Active"}
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
                        {personnelData?.created_at
                          ? new Date(personnelData.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })
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
                      <strong>Note:</strong> To update your name or employment details, please contact the administrator.
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
