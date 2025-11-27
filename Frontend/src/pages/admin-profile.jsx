import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import { User, Mail, Phone, Briefcase, Shield } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import apiClient from "../lib/api";

export default function AdminProfile() {
  const { user } = useAuth();

  const { data: personnelData } = useQuery({
    queryKey: ["/api/v1/personnel/me"],
    queryFn: async () => {
      const res = await apiClient.getPersonnelProfile();
      return res.data || null;
    },
    retry: 1
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <TopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-2 mb-8">View your personal information and account details</p>

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
                            {personnelData?.position || "Administrator"}
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
                <Card>
                  <CardHeader>
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <Phone className="h-5 w-5 text-blue-600" />
                        Contact Information
                      </CardTitle>
                      <CardDescription>Your contact details</CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      {/* Email */}
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-500">Email Address</Label>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <div className="px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold flex-1">
                            {personnelData?.email || user?.email || "N/A"}
                          </div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-500">Phone Number</Label>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <div className="px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold flex-1">
                            {personnelData?.contact_no || user?.phone || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Access */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                      <Shield className="h-5 w-5 text-blue-600" />
                      System Access
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Your system permissions and access level
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-gray-500">Access Level</Label>
                          <div className="mt-1 px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold">
                            Full Access
                          </div>
                        </div>
                        <div>
                          <Label className="text-sm text-gray-500">Permissions</Label>
                          <div className="mt-1">
                            <Badge className="bg-blue-100 text-blue-800">
                              All Permissions
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
                      <p className="font-semibold text-green-600 mt-1">
                        {personnelData?.status || "Active"}
                      </p>
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
                    <Separator />
                    <div>
                      <Label>Department</Label>
                      <p className="font-medium mt-1">Administration</p>
                    </div>
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
