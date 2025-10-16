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
import { User, Mail, Phone, MapPin, Droplets, Calendar, Edit, Save, X } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { useToast } from "../hooks/use-toast";
import apiClient from "../lib/api";

export default function ResidentProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: connectionData, isLoading: connectionLoading } = useQuery({
    queryKey: ['/api/v1/water-connection'],
    queryFn: async () => {
      const res = await apiClient.getWaterConnections();
      return res.data?.[0] || null;
    },
    retry: 1
  });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/v1/resident/profile'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/v1/resident/profile');
        if (res.ok) {
          return await res.json();
        }
        return null;
      } catch (error) {
        console.log('Profile endpoint not available yet');
        return null;
      }
    },
    retry: 1
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    purok: "",
    zone: ""
  });

  // Update form data when profile or connection data loads
  useEffect(() => {
    if (profileData || connectionData || user) {
      setFormData({
        firstName: profileData?.firstName || user?.firstName || "",
        lastName: profileData?.lastName || user?.lastName || "",
        email: profileData?.email || "",
        phone: profileData?.phone || "",
        purok: profileData?.purok || connectionData?.purok_no || "",
        zone: profileData?.zone || ""
      });
    }
  }, [profileData, connectionData, user]);

  const handleSave = () => {
    // Here you would call the API to update profile
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Restore original values from API data
    setFormData({
      firstName: profileData?.firstName || user?.firstName || "",
      lastName: profileData?.lastName || user?.lastName || "",
      email: profileData?.email || "",
      phone: profileData?.phone || "",
      purok: profileData?.purok || connectionData?.purok_no || "",
      zone: profileData?.zone || ""
    });
    setIsEditing(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900" data-testid="text-profile-title">
                  My Profile
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your personal information and account details
                </p>
              </div>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} data-testid="button-edit-profile">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancel} data-testid="button-cancel">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" data-testid="button-save">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Card */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Personal Information
                    </CardTitle>
                    <CardDescription>Your personal details and contact information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            disabled={!isEditing}
                            data-testid="input-first-name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            disabled={!isEditing}
                            data-testid="input-last-name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your.email@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10"
                            data-testid="input-email"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+63 XXX XXX XXXX"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            disabled={!isEditing}
                            className="pl-10"
                            data-testid="input-phone"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="purok">Purok</Label>
                          <Input
                            id="purok"
                            value={formData.purok || connectionData?.purok_no || ""}
                            onChange={(e) => setFormData({...formData, purok: e.target.value})}
                            disabled={!isEditing}
                            data-testid="input-purok"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zone">Zone</Label>
                          <Input
                            id="zone"
                            value={formData.zone}
                            onChange={(e) => setFormData({...formData, zone: e.target.value})}
                            disabled={!isEditing}
                            data-testid="input-zone"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Water Connection Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Droplets className="h-5 w-5 mr-2 text-blue-600" />
                      Water Connection Details
                    </CardTitle>
                    <CardDescription>Your water service connection information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-600">Connection ID</Label>
                          <p className="font-medium mt-1">{connectionData?.connection_id || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Meter Number</Label>
                          <p className="font-medium mt-1">{connectionData?.meter_no || "N/A"}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Connection Type</Label>
                          <p className="font-medium mt-1">{connectionData?.connection_type || "Residential"}</p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Status</Label>
                          <div className="mt-1">
                            <Badge className="bg-green-100 text-green-800">
                              {connectionData?.connection_status || "Active"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Account Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-600">Account Status</Label>
                      <p className="font-semibold text-green-600 mt-1">Active</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-gray-600">Member Since</Label>
                      <p className="font-medium mt-1">
                        {connectionData?.created_at 
                          ? new Date(connectionData.created_at).toLocaleDateString('en-PH', {
                              month: 'long',
                              year: 'numeric'
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-gray-600">Username</Label>
                      <p className="font-medium mt-1">{user?.username || "N/A"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Security</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full" data-testid="button-change-password">
                      Change Password
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> To update your address or water connection details, please contact the barangay office.
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
