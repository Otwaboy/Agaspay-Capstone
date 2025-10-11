import { useState } from "react";
// import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { useToast } from "../hooks/use-toast";
import { 
  Settings, 
  DollarSign, 
  Calendar,
  Bell,
  FileText,
  Save
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";

export default function TreasurerBillingSettings() {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    ratePerCubic: "15.00",
    fixedCharge: "50.00",
    penaltyRate: "2.00",
    gracePeriodDays: "7",
    billingCycleDay: "1",
    dueDateDays: "15",
    enableAutoGenerate: true,
    enableReminders: true,
    reminderDaysBefore: "3",
    emailNotifications: true,
    smsNotifications: false,
    billTemplate: "standard",
    termsAndConditions: "Payment is due within 15 days of bill generation. A penalty of 2% per month will be charged for late payments."
  });

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveSettings = () => {
    // Mock save
    toast({
      title: "Settings Saved",
      description: "Billing settings have been updated successfully",
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <TreasurerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TreasurerTopHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Settings className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-billing-settings-title">
                      Billing Settings
                    </h1>
                    <p className="text-gray-600">Configure billing rates and preferences</p>
                  </div>
                </div>
                <Button onClick={handleSaveSettings} data-testid="button-save-settings">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rate Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Rate Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rate-per-cubic">Rate per Cubic Meter (₱)</Label>
                    <Input
                      id="rate-per-cubic"
                      type="number"
                      step="0.01"
                      value={settings.ratePerCubic}
                      onChange={(e) => handleInputChange('ratePerCubic', e.target.value)}
                      data-testid="input-rate-per-cubic"
                    />
                    <p className="text-sm text-gray-500">Base rate charged per cubic meter of water</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fixed-charge">Fixed Monthly Charge (₱)</Label>
                    <Input
                      id="fixed-charge"
                      type="number"
                      step="0.01"
                      value={settings.fixedCharge}
                      onChange={(e) => handleInputChange('fixedCharge', e.target.value)}
                      data-testid="input-fixed-charge"
                    />
                    <p className="text-sm text-gray-500">Fixed charge added to all bills</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="penalty-rate">Penalty Rate (%)</Label>
                    <Input
                      id="penalty-rate"
                      type="number"
                      step="0.01"
                      value={settings.penaltyRate}
                      onChange={(e) => handleInputChange('penaltyRate', e.target.value)}
                      data-testid="input-penalty-rate"
                    />
                    <p className="text-sm text-gray-500">Monthly penalty rate for overdue payments</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grace-period">Grace Period (Days)</Label>
                    <Input
                      id="grace-period"
                      type="number"
                      value={settings.gracePeriodDays}
                      onChange={(e) => handleInputChange('gracePeriodDays', e.target.value)}
                      data-testid="input-grace-period"
                    />
                    <p className="text-sm text-gray-500">Days before applying penalty charges</p>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Cycle */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Billing Cycle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing-cycle-day">Billing Cycle Day</Label>
                    <Input
                      id="billing-cycle-day"
                      type="number"
                      min="1"
                      max="28"
                      value={settings.billingCycleDay}
                      onChange={(e) => handleInputChange('billingCycleDay', e.target.value)}
                      data-testid="input-billing-cycle-day"
                    />
                    <p className="text-sm text-gray-500">Day of month to generate bills (1-28)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due-date-days">Due Date (Days After Bill)</Label>
                    <Input
                      id="due-date-days"
                      type="number"
                      value={settings.dueDateDays}
                      onChange={(e) => handleInputChange('dueDateDays', e.target.value)}
                      data-testid="input-due-date-days"
                    />
                    <p className="text-sm text-gray-500">Number of days until payment is due</p>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label htmlFor="auto-generate" className="cursor-pointer">
                        Auto-Generate Bills
                      </Label>
                      <p className="text-sm text-gray-500">Automatically generate bills on cycle day</p>
                    </div>
                    <Switch
                      id="auto-generate"
                      checked={settings.enableAutoGenerate}
                      onCheckedChange={(checked) => handleInputChange('enableAutoGenerate', checked)}
                      data-testid="switch-auto-generate"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label htmlFor="enable-reminders" className="cursor-pointer">
                        Enable Payment Reminders
                      </Label>
                      <p className="text-sm text-gray-500">Send reminders before due date</p>
                    </div>
                    <Switch
                      id="enable-reminders"
                      checked={settings.enableReminders}
                      onCheckedChange={(checked) => handleInputChange('enableReminders', checked)}
                      data-testid="switch-enable-reminders"
                    />
                  </div>

                  {settings.enableReminders && (
                    <div className="space-y-2 ml-4">
                      <Label htmlFor="reminder-days">Send Reminder (Days Before Due)</Label>
                      <Input
                        id="reminder-days"
                        type="number"
                        value={settings.reminderDaysBefore}
                        onChange={(e) => handleInputChange('reminderDaysBefore', e.target.value)}
                        data-testid="input-reminder-days"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label htmlFor="email-notifications" className="cursor-pointer">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-gray-500">Send bills via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                      data-testid="switch-email-notifications"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <Label htmlFor="sms-notifications" className="cursor-pointer">
                        SMS Notifications
                      </Label>
                      <p className="text-sm text-gray-500">Send bills via SMS</p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                      data-testid="switch-sms-notifications"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Bill Template */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Bill Template & Terms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="terms">Terms and Conditions</Label>
                    <Textarea
                      id="terms"
                      rows={6}
                      value={settings.termsAndConditions}
                      onChange={(e) => handleInputChange('termsAndConditions', e.target.value)}
                      data-testid="textarea-terms"
                    />
                    <p className="text-sm text-gray-500">Appears on all generated bills</p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Bill Preview</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>• Rate per m³: ₱{settings.ratePerCubic}</p>
                      <p>• Fixed Charge: ₱{settings.fixedCharge}</p>
                      <p>• Due in {settings.dueDateDays} days from bill date</p>
                      <p>• {settings.gracePeriodDays} days grace period</p>
                      <p>• {settings.penaltyRate}% monthly penalty after grace period</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button (Bottom) */}
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveSettings} size="lg" data-testid="button-save-bottom">
                <Save className="h-4 w-4 mr-2" />
                Save All Settings
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
