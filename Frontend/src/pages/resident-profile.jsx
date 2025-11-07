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
import { useToast } from "../hooks/use-toast";
import apiClient from "../lib/api"; 

export default function ResidentProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: connectionData } = useQuery({
    queryKey: ['/api/v1/water-connection'],
    queryFn: async () => {
      const res = await apiClient.getAllWaterConnections();
      return res.data?.[0] || null;
    },
    retry: 1
  });

  const [formData, setFormData] = useState({
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (connectionData || user) {
      setFormData({
        email: connectionData?.email || "",
        phone: connectionData?.contact_no || ""
      });
    }
  }, [connectionData, user]);

 const handleSave = async () => {
  try {
    await apiClient.updateUserContact({
      email: formData.email,
      contact_no: formData.phone,
    });

    toast({
      title: "Profile Updated",
      description: "Your contact information has been updated successfully",
    });

    setIsEditing(false);

  } catch (error) {
    toast({
      title: "Update Failed",
      description: error?.message || "Something went wrong.",
      variant: "destructive",
    });
  }
};


  const handleCancel = () => {
    setFormData({
      email: connectionData?.email || "",
      phone: connectionData?.contact_no || ""
    });
    setIsEditing(false);
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
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>Your personal details</CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">

                  {/* Name */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        value={connectionData?.first_name || ""}
                        disabled
                        className="text-black disabled:text-black disabled:opacity-100 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={connectionData?.last_name || ""}
                        disabled
                        className="text-black disabled:text-black disabled:opacity-100 bg-gray-50"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Purok</Label>
                      <Input
                        value={connectionData?.purok || ""}
                        disabled
                        className="text-black disabled:text-black disabled:opacity-100 bg-gray-50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Zone</Label>
                      <Input
                        value={connectionData?.zone || ""}
                        disabled
                        className="text-black disabled:text-black disabled:opacity-100 bg-gray-50"
                      />
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>


                {/* Contact Information Card */}
    <Card className="relative">
  <CardHeader>
    <div>
      <CardTitle className="flex items-center">
        <Phone className="h-5 w-5 mr-2 text-blue-600" />
        Contact Information
      </CardTitle>
      <CardDescription>Update your contact details</CardDescription>
    </div>
  </CardHeader>

  <CardContent>
    <div className="space-y-4">

      {/* Email Field */}
      <div className="space-y-2">
        <Label>Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={!isEditing}
            className="pl-10"
          />
        </div>
      </div>

      {/* Phone Field */}
      <div className="space-y-2">
        <Label>Phone Number</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!isEditing}
            className="pl-10"
          />
        </div>
      </div>

      {/* ✅ Buttons */}
      {!isEditing ? (
        <Button
          onClick={() => setIsEditing(true)}
          size="sm"
          className="
            w-full
            sm:w-auto
            sm:absolute sm:top-4 sm:right-4
          "
        >
          <Edit className="h-3 w-3 mr-2" />
          Edit
        </Button>
      ) : (
        <div
          className="
            flex flex-col gap-2 w-full
            sm:w-auto sm:flex-row
            sm:absolute sm:top-4 sm:right-4
          "
        >
          <Button
            onClick={handleSave}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>

          <Button
            variant="outline"
            onClick={handleCancel}
            size="sm"
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      )}

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
                          <Label>Connection ID</Label>
                          <p className="font-medium mt-1">{connectionData?.connection_id || "N/A"}</p>
                        </div>
                        <div>
                          <Label>Meter Number</Label>
                          <p className="font-medium mt-1">{connectionData?.meter_no || "N/A"}</p>
                        </div>
                        <div>
                          <Label>Connection Type</Label>
                          <p className="font-medium mt-1">{connectionData?.type || "Residential"}</p>
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Badge className="bg-green-100 text-green-800 mt-1">
                            {connectionData?.connection_status || "Active"}
                          </Badge>
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
                          ? new Date(connectionData.created_at).toLocaleDateString('en-PH', { month: 'long', year: 'numeric'})
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
