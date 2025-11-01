import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Settings, User, Mail, Phone, MapPin, Shield, Save } from "lucide-react";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import { apiClient } from "../lib/api";
import { useToast } from "../hooks/use-toast";

export default function MeterReaderSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authUser, isLoading } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const response = await apiClient.get("/auth/me");
      return response.data;
    }
  });

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    contact_no: "",
    purok: ""
  });

  useEffect(() => {
    if (authUser?.user) {
      setFormData({
        first_name: authUser.user.first_name || "",
        last_name: authUser.user.last_name || "",
        email: authUser.user.email || "",
        contact_no: authUser.user.contact_no || "",
        purok: authUser.user.purok || ""
      });
    }
  }, [authUser]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.put("/api/personnel/profile", data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const user = authUser?.user;

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <MeterReaderSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <MeterReaderTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">Manage your profile and preferences</p>
            </div>

            <div className="space-y-4">
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-50 to-cyan-50">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-semibold text-lg">{user?.username}</p>
                    </div>
                    <Badge className="bg-green-600">Meter Reader</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-500">Assigned Zone</p>
                        <p className="font-bold text-xl text-blue-600">Zone {user?.assigned_zone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder={user?.first_name || "Enter first name"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder={user?.last_name || "Enter last name"}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={user?.email || "Enter email"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_no" className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Contact Number</span>
                    </Label>
                    <Input
                      id="contact_no"
                      value={formData.contact_no}
                      onChange={(e) => setFormData({ ...formData, contact_no: e.target.value })}
                      placeholder={user?.contact_no || "Enter contact number"}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purok" className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Purok</span>
                    </Label>
                    <Input
                      id="purok"
                      value={formData.purok}
                      onChange={(e) => setFormData({ ...formData, purok: e.target.value })}
                      placeholder={user?.purok || "Enter purok"}
                    />
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="w-full h-12 bg-green-600 hover:bg-green-700 text-base"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="bg-gray-50">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Account Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-gray-500">Last changed: Never</p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Not enabled</p>
                    </div>
                    <Button variant="outline" disabled>Enable 2FA</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
