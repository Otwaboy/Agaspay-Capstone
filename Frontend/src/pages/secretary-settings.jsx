import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { User, Lock, Bell, Settings as SettingsIcon, Save } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function SecretarySettings() { 
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [appointmentReminders, setAppointmentReminders] = useState(true);
  const [newApplicationAlerts, setNewApplicationAlerts] = useState(true);
  const [documentRequestAlerts, setDocumentRequestAlerts] = useState(true);

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSavePassword = () => {
    toast({
      title: "Password Changed",
      description: "Your password has been updated successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Preferences Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SecretarySidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <SecretaryTopHeader />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">
                Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your account settings and preferences
              </p>
            </div>

            {/* Settings Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile" className="flex items-center gap-2" data-testid="tab-profile">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2" data-testid="tab-security">
                  <Lock className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2" data-testid="tab-notifications">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
              </TabsList>

              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and contact details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          defaultValue={user?.firstName || ""}
                          className="mt-2"
                          data-testid="input-first-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          defaultValue={user?.lastName || ""}
                          className="mt-2"
                          data-testid="input-last-name"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={user?.email || ""}
                        className="mt-2"
                        data-testid="input-email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        defaultValue={user?.contactNo || ""}
                        className="mt-2"
                        data-testid="input-phone"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        defaultValue={user?.address || ""}
                        className="mt-2"
                        rows={3}
                        data-testid="input-address"
                      />
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" data-testid="button-cancel">Cancel</Button>
                      <Button onClick={handleSaveProfile} data-testid="button-save-profile">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Settings */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Update your password and security preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        className="mt-2"
                        data-testid="input-current-password"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        className="mt-2"
                        data-testid="input-new-password"
                      />
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="mt-2"
                        data-testid="input-confirm-password"
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Password Requirements:</strong>
                      </p>
                      <ul className="mt-2 text-sm text-blue-700 space-y-1 list-disc list-inside">
                        <li>At least 8 characters long</li>
                        <li>Contains uppercase and lowercase letters</li>
                        <li>Contains at least one number</li>
                        <li>Contains at least one special character</li>
                      </ul>
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" data-testid="button-cancel-password">Cancel</Button>
                      <Button onClick={handleSavePassword} data-testid="button-change-password">
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how you receive notifications and alerts
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-4">General Notifications</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Label htmlFor="email-notifications" className="text-base">Email Notifications</Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Receive notifications via email
                            </p>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                            data-testid="switch-email-notifications"
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Label htmlFor="sms-notifications" className="text-base">SMS Notifications</Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Receive notifications via SMS
                            </p>
                          </div>
                          <Switch
                            id="sms-notifications"
                            checked={smsNotifications}
                            onCheckedChange={setSmsNotifications}
                            data-testid="switch-sms-notifications"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-4">Activity Alerts</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Label htmlFor="appointment-reminders" className="text-base">Appointment Reminders</Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Get reminded about upcoming appointments
                            </p>
                          </div>
                          <Switch
                            id="appointment-reminders"
                            checked={appointmentReminders}
                            onCheckedChange={setAppointmentReminders}
                            data-testid="switch-appointment-reminders"
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Label htmlFor="new-application-alerts" className="text-base">New Application Alerts</Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Get notified when new applications are submitted
                            </p>
                          </div>
                          <Switch
                            id="new-application-alerts"
                            checked={newApplicationAlerts}
                            onCheckedChange={setNewApplicationAlerts}
                            data-testid="switch-new-application-alerts"
                          />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <Label htmlFor="document-request-alerts" className="text-base">Document Request Alerts</Label>
                            <p className="text-sm text-gray-500 mt-1">
                              Get notified about new document requests
                            </p>
                          </div>
                          <Switch
                            id="document-request-alerts"
                            checked={documentRequestAlerts}
                            onCheckedChange={setDocumentRequestAlerts}
                            data-testid="switch-document-request-alerts"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" data-testid="button-cancel-notifications">Cancel</Button>
                      <Button onClick={handleSaveNotifications} data-testid="button-save-notifications">
                        <Save className="h-4 w-4 mr-2" />
                        Save Preferences
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
