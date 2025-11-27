import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import { Settings as SettingsIcon, Bell, Mail, Lock, Eye, Shield, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import apiClient from "../lib/api";

export default function SecretarySettings() {
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    taskReminders: true,
    announcements: true
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    shareData: false
  });

  // Change Password Modal States
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    verificationCode: ""
  });


  const handleSaveSettings = () => {
    toast.success("Settings Saved", { description: "Your preferences have been updated successfully" });
  };

  // Request Password Change Mutation
  const requestPasswordChangeMutation = useMutation({
    mutationFn: (data) => apiClient.requestPasswordChange(data),
    onSuccess: (response) => {
      toast.success("Verification code sent to your email");
      setPasswordStep(2);
    },
    onError: (error) => {
      const errorMessage = error.message || "Failed to send verification code";

      if (errorMessage.includes("No email address found")) {
        toast.error("No email address found. Please add an email to your profile first.");
      } else if (errorMessage.includes("Current password is incorrect")) {
        toast.error("Current password is incorrect. Please try again.");
      } else if (errorMessage.includes("at least 6 characters")) {
        toast.error("New password must be at least 6 characters long");
      } else if (errorMessage.includes("provide both current and new password")) {
        toast.error("Please provide both current and new password");
      } else {
        toast.error(errorMessage);
      }
    }
  });

  // Verify and Change Password Mutation
  const verifyPasswordChangeMutation = useMutation({
    mutationFn: (data) => apiClient.verifyPasswordChange(data),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      resetPasswordModal();
    },
    onError: (error) => {
      const errorMessage = error.message || "Failed to change password";

      if (errorMessage.includes("expired")) {
        toast.error("Verification code has expired. Please start over.");
        setPasswordStep(1);
      } else if (errorMessage.includes("Invalid verification code")) {
        toast.error("Invalid verification code. Please check and try again.");
      } else if (errorMessage.includes("No pending password change")) {
        toast.error("Session expired. Please start the process again.");
        setPasswordStep(1);
      } else {
        toast.error(errorMessage);
      }
    }
  });

  const resetPasswordModal = () => {
    setChangePasswordOpen(false);
    setPasswordStep(1);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      verificationCode: ""
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handlePasswordSubmit = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    requestPasswordChangeMutation.mutate({
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword
    });
  };

  const handleVerificationSubmit = () => {
    if (!passwordData.verificationCode || passwordData.verificationCode.length !== 6) {
      toast.error("Please enter a valid 6-digit verification code");
      return;
    }

    verifyPasswordChangeMutation.mutate({
      verification_code: passwordData.verificationCode
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SecretarySidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <SecretaryTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
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
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">Notification Types</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="task-reminders" className="font-medium">Task Reminders</Label>
                          <p className="text-sm text-gray-600">Get reminded about pending tasks</p>
                        </div>
                        <Switch
                          id="task-reminders"
                          checked={notifications.taskReminders}
                          onCheckedChange={(checked) => setNotifications({...notifications, taskReminders: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="announcements" className="font-medium">System Announcements</Label>
                          <p className="text-sm text-gray-600">Stay updated with system announcements</p>
                        </div>
                        <Switch
                          id="announcements"
                          checked={notifications.announcements}
                          onCheckedChange={(checked) => setNotifications({...notifications, announcements: checked})}
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
                      checked={privacy.shareData}
                      onCheckedChange={(checked) => setPrivacy({...privacy, shareData: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="pt-2 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setChangePasswordOpen(true)}
                    >
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
                    <select className="w-full mt-2 px-3 py-2 border rounded-md">
                      <option value="en">English</option>
                      <option value="fil">Filipino</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-medium">Date Format</Label>
                    <select className="w-full mt-2 px-3 py-2 border rounded-md">
                      <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                      <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                      <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <Label className="font-medium">Currency</Label>
                    <select className="w-full mt-2 px-3 py-2 border rounded-md">
                      <option value="php">Philippine Peso (₱)</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button variant="outline">Reset to Defaults</Button>
                <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700">
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Change Password Modal */}
        <Dialog open={changePasswordOpen} onOpenChange={resetPasswordModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2 text-blue-600" />
                Change Password
              </DialogTitle>
              <DialogDescription>
                {passwordStep === 1
                  ? "Enter your current password and choose a new password"
                  : "Enter the 6-digit verification code sent to your email"}
              </DialogDescription>
            </DialogHeader>

            {passwordStep === 1 ? (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Password must be at least 6 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    value={passwordData.verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setPasswordData({ ...passwordData, verificationCode: value });
                    }}
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-gray-500">
                    Check your email for the verification code. The code will expire in 10 minutes.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              {passwordStep === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setPasswordStep(1)}
                  disabled={verifyPasswordChangeMutation.isPending}
                >
                  Back
                </Button>
              )}
              <Button variant="outline" onClick={resetPasswordModal}>
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={passwordStep === 1 ? handlePasswordSubmit : handleVerificationSubmit}
                disabled={
                  passwordStep === 1
                    ? !passwordData.currentPassword ||
                      !passwordData.newPassword ||
                      !passwordData.confirmPassword ||
                      requestPasswordChangeMutation.isPending
                    : !passwordData.verificationCode ||
                      verifyPasswordChangeMutation.isPending
                }
              >
                {requestPasswordChangeMutation.isPending || verifyPasswordChangeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : passwordStep === 1 ? (
                  "Send Verification Code"
                ) : (
                  "Change Password"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
