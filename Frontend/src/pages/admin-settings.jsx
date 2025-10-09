import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import {
  Settings,
  Bell,
  Database,
  Shield,
  DollarSign,
  Mail
} from "lucide-react";

export default function AdminSettings() {
  const settingsSections = [
    {
      title: "General Settings",
      icon: Settings,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      settings: [
        { label: "System Name", value: "AGASPAY", type: "text" },
        { label: "Barangay Name", value: "Barangay Biking, Dauis, Bohol", type: "text" },
        { label: "Contact Number", value: "+63 123 456 7890", type: "text" },
        { label: "Email Address", value: "admin..agaspay.com", type: "email" }
      ]
    },
    {
      title: "Billing Configuration",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      settings: [
        { label: "Rate per Cubic Meter", value: "25.00", type: "number" },
        { label: "Fixed Monthly Charge", value: "50.00", type: "number" },
        { label: "Late Payment Penalty (%)", value: "5", type: "number" },
        { label: "Billing Cycle", value: "Monthly", type: "text" }
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      settings: [
        { label: "Email Notifications", value: true, type: "toggle" },
        { label: "SMS Notifications", value: false, type: "toggle" },
        { label: "Payment Reminders", value: true, type: "toggle" },
        { label: "System Alerts", value: true, type: "toggle" }
      ]
    },
    {
      title: "Security",
      icon: Shield,
      color: "text-red-600",
      bgColor: "bg-red-50",
      settings: [
        { label: "Two-Factor Authentication", value: false, type: "toggle" },
        { label: "Session Timeout (minutes)", value: "30", type: "number" },
        { label: "Password Expiry (days)", value: "90", type: "number" },
        { label: "Failed Login Attempts Limit", value: "5", type: "number" }
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="text-settings-title">
                    System Settings
                  </h1>
                  <p className="text-gray-600">Configure system parameters and preferences</p>
                </div>
              </div>
            </div>

            {/* Settings Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {settingsSections.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${section.bgColor} rounded-lg flex items-center justify-center`}>
                        <section.icon className={`h-5 w-5 ${section.color}`} />
                      </div>
                      <div>
                        <CardTitle>{section.title}</CardTitle>
                        <CardDescription>Manage {section.title.toLowerCase()}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {section.settings.map((setting, settingIndex) => (
                        <div key={settingIndex} className="flex items-center justify-between">
                          <Label htmlFor={`${section.title}-${settingIndex}`} className="text-sm font-medium text-gray-700">
                            {setting.label}
                          </Label>
                          {setting.type === "toggle" ? (
                            <Switch
                              id={`${section.title}-${settingIndex}`}
                              checked={setting.value}
                              data-testid={`switch-${setting.label.toLowerCase().replace(/\s+/g, '-')}`}
                            />
                          ) : (
                            <Input
                              id={`${section.title}-${settingIndex}`}
                              type={setting.type}
                              defaultValue={setting.value}
                              className="w-48"
                              data-testid={`input-${setting.label.toLowerCase().replace(/\s+/g, '-')}`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Database & Backup */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Database className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Database & Backup</CardTitle>
                    <CardDescription>Manage database and backup settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Backup</p>
                      <p className="text-sm text-gray-500">January 20, 2024 - 02:00 AM</p>
                    </div>
                    <Button variant="outline">Backup Now</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Auto Backup</p>
                      <p className="text-sm text-gray-500">Daily at 2:00 AM</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="mt-8 flex justify-end space-x-4">
              <Button variant="outline">Cancel</Button>
              <Button data-testid="button-save-settings">Save Changes</Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
