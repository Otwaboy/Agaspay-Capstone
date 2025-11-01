import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import { Settings as SettingsIcon, Bell, Mail, Lock, Eye, Shield } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function ResidentSettings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    billReminders: true,
    paymentConfirmations: true,
    announcements: true,
    serviceUpdates: true
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    shareUsageData: false
  });

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-settings-title">
                Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your account preferences and notification settings
              </p>
            </div>

            <div className="space-y-6">
              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2 text-blue-600" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>Choose how you want to receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Notification Channels */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Notification Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <div>
                            <Label htmlFor="email-notif" className="font-medium">Email Notifications</Label>
                            <p className="text-sm text-gray-600">Receive notifications via email</p>
                          </div>
                        </div>
                        <Switch
                          id="email-notif"
                          checked={notifications.email}
                          onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                          data-testid="switch-email-notif"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="h-5 w-5 text-gray-400" />
                          <div>
                            <Label htmlFor="sms-notif" className="font-medium">SMS Notifications</Label>
                            <p className="text-sm text-gray-600">Receive notifications via text message</p>
                          </div>
                        </div>
                        <Switch
                          id="sms-notif"
                          checked={notifications.sms}
                          onCheckedChange={(checked) => setNotifications({...notifications, sms: checked})}
                          data-testid="switch-sms-notif"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Notification Types */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="bill-reminders" className="font-medium">Bill Reminders</Label>
                          <p className="text-sm text-gray-600">Get reminded before bill due dates</p>
                        </div>
                        <Switch
                          id="bill-reminders"
                          checked={notifications.billReminders}
                          onCheckedChange={(checked) => setNotifications({...notifications, billReminders: checked})}
                          data-testid="switch-bill-reminders"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="payment-confirm" className="font-medium">Payment Confirmations</Label>
                          <p className="text-sm text-gray-600">Receive confirmation when payments are processed</p>
                        </div>
                        <Switch
                          id="payment-confirm"
                          checked={notifications.paymentConfirmations}
                          onCheckedChange={(checked) => setNotifications({...notifications, paymentConfirmations: checked})}
                          data-testid="switch-payment-confirm"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="announcements" className="font-medium">Barangay Announcements</Label>
                          <p className="text-sm text-gray-600">Stay updated with community announcements</p>
                        </div>
                        <Switch
                          id="announcements"
                          checked={notifications.announcements}
                          onCheckedChange={(checked) => setNotifications({...notifications, announcements: checked})}
                          data-testid="switch-announcements"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="service-updates" className="font-medium">Service Updates</Label>
                          <p className="text-sm text-gray-600">Notifications about water service changes</p>
                        </div>
                        <Switch
                          id="service-updates"
                          checked={notifications.serviceUpdates}
                          onCheckedChange={(checked) => setNotifications({...notifications, serviceUpdates: checked})}
                          data-testid="switch-service-updates"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>Manage your privacy and security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Eye className="h-5 w-5 text-gray-400" />
                      <div>
                        <Label htmlFor="show-profile" className="font-medium">Public Profile</Label>
                        <p className="text-sm text-gray-600">Allow others to see your profile information</p>
                      </div>
                    </div>
                    <Switch
                      id="show-profile"
                      checked={privacy.showProfile}
                      onCheckedChange={(checked) => setPrivacy({...privacy, showProfile: checked})}
                      data-testid="switch-show-profile"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <SettingsIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <Label htmlFor="share-data" className="font-medium">Share Usage Data</Label>
                        <p className="text-sm text-gray-600">Help improve service by sharing anonymous usage data</p>
                      </div>
                    </div>
                    <Switch
                      id="share-data"
                      checked={privacy.shareUsageData}
                      onCheckedChange={(checked) => setPrivacy({...privacy, shareUsageData: checked})}
                      data-testid="switch-share-data"
                    />
                  </div>

                  <Separator />

                  <div className="pt-2">
                    <Button variant="outline" className="w-full" data-testid="button-change-password">
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* App Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <SettingsIcon className="h-5 w-5 mr-2 text-blue-600" />
                    App Preferences
                  </CardTitle>
                  <CardDescription>Customize your app experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="font-medium">Language</Label>
                    <select className="w-full mt-2 px-3 py-2 border rounded-md" data-testid="select-language">
                      <option value="en">English</option>
                      <option value="fil">Filipino</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-medium">Date Format</Label>
                    <select className="w-full mt-2 px-3 py-2 border rounded-md" data-testid="select-date-format">
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-medium">Currency</Label>
                    <select className="w-full mt-2 px-3 py-2 border rounded-md" data-testid="select-currency">
                      <option value="php">Philippine Peso (₱)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button variant="outline">Reset to Defaults</Button>
                <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700" data-testid="button-save-settings">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
