import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import {
  Settings,
  Bell,
  Database,
  Shield,
  DollarSign,
  Check,
  X
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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TopHeader />
        
        <main className="flex-1 overflow-auto p-6 relative z-10">
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
                        <div key={settingIndex} className="flex items-center justify-between py-2">
                          <Label className="text-sm font-medium text-gray-700">
                            {setting.label}
                          </Label>
                          {setting.type === "toggle" ? (
                            <div className="flex items-center gap-2">
                              {setting.value ? (
                                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  Enabled
                                </Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
                                  <X className="h-3 w-3" />
                                  Disabled
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <div className="px-3 py-2 rounded-md bg-blue-50/40 text-gray-800 font-semibold min-w-[150px] text-right">
                              {setting.value}
                            </div>
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
                    <CardDescription>Database and backup information</CardDescription>
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
                    <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Auto Backup</p>
                      <p className="text-sm text-gray-500">Daily at 2:00 AM</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Enabled
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Note */}
            <Card className="mt-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is a read-only view of system settings. To modify these settings, please contact the system administrator or access the configuration files directly.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
