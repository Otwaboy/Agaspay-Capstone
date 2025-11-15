import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Separator } from "../components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import { Settings as SettingsIcon, Bell, Mail, Lock, Eye, Shield, EyeOff, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "../lib/api";

export default function ResidentSettings() {
  const { toast: toastHook } = useToast();
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

  // Change Password Modal States
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1); // 1 = password entry, 2 = verification code
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    verificationCode: ""
  });

  // Disconnect Account Modal States
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);

  // Archive Account Modal States
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");

  // Fetch disconnection status
  const { data: disconnectionStatus } = useQuery({
    queryKey: ["disconnection-status"],
    queryFn: () => apiClient.getDisconnectionStatus(),
    retry: false,
    enabled: true
  });

  // Fetch archive status
  const { data: archiveStatus } = useQuery({
    queryKey: ["archive-status"],
    queryFn: () => apiClient.getArchiveStatus(),
    retry: false,
    enabled: true
  });

  // Request Disconnection Mutation
  const requestDisconnectionMutation = useMutation({
    mutationFn: () => apiClient.requestDisconnection(),
    onSuccess: () => {
      toast.success("Disconnection request submitted successfully!");
      setDisconnectModalOpen(false);
      window.location.reload(); // Reload to update status
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit disconnection request");
    }
  });

  // Cancel Disconnection Mutation
  const cancelDisconnectionMutation = useMutation({
    mutationFn: () => apiClient.cancelDisconnectionRequest(),
    onSuccess: () => {
      toast.success("Disconnection request cancelled successfully!");
      window.location.reload(); // Reload to update status
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel disconnection request");
    }
  });

  // Request Archive Mutation
  const requestArchiveMutation = useMutation({
    mutationFn: (data) => apiClient.requestArchive(data),
    onSuccess: () => {
      toast.success("Archive request submitted successfully!");
      setArchiveModalOpen(false);
      setArchiveReason("");
      window.location.reload(); // Reload to update status
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit archive request");
    }
  });

  // Cancel Archive Mutation
  const cancelArchiveMutation = useMutation({
    mutationFn: () => apiClient.cancelArchiveRequest(),
    onSuccess: () => {
      toast.success("Archive request cancelled successfully!");
      window.location.reload(); // Reload to update status
    },
    onError: (error) => {
      toast.error(error.message || "Failed to cancel archive request");
    }
  });

  const handleSaveSettings = () => {
    toastHook({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully",
    });
  };

  // Request Password Change Mutation
  const requestPasswordChangeMutation = useMutation({
    mutationFn: (data) => apiClient.requestPasswordChange(data),
    onSuccess: (response) => {
      toast.success("Verification code sent to your email");
      setPasswordStep(2); // Move to verification step
    },
    onError: (error) => {
      console.error("❌ Password change error FULL:", error);
      console.error("❌ Error message:", error.message);
      console.error("❌ Error stack:", error.stack);

      // The error.message contains the backend's error message
      const errorMessage = error.message || "Failed to send verification code";

      // Show the appropriate toast based on the error message
      if (errorMessage.includes("No email address found")) {
        toast.error("No email address found. Please add an email to your profile first.");
      } else if (errorMessage.includes("Current password is incorrect")) {
        toast.error("❌ Current password is incorrect. Please try again.");
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
      console.error("Verification error:", error);

      const errorMessage = error.message || "Failed to change password";

      if (errorMessage.includes("expired")) {
        toast.error("Verification code has expired. Please start over.");
        setPasswordStep(1); // Reset to step 1
      } else if (errorMessage.includes("Invalid verification code")) {
        toast.error("Invalid verification code. Please check and try again.");
      } else if (errorMessage.includes("No pending password change")) {
        toast.error("Session expired. Please start the process again.");
        setPasswordStep(1); // Reset to step 1
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
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Validate password length
    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    // Request password change with verification code
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

  const handleArchiveSubmit = () => {
    // Validate reason
    if (!archiveReason || archiveReason.trim().length === 0) {
      toast.error("Please provide a reason for archiving your account");
      return;
    }

    if (archiveReason.trim().length < 10) {
      toast.error("Reason must be at least 10 characters long");
      return;
    }

    // Submit archive request
    requestArchiveMutation.mutate({
      reason: archiveReason.trim()
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

                  <div className="pt-2 space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      data-testid="button-change-password"
                      onClick={() => setChangePasswordOpen(true)}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>

                    {/* Disconnect Account Button */}
                    {disconnectionStatus?.status === 'request_for_disconnection' ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-yellow-900">Disconnection Pending</p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Your disconnection request is awaiting admin approval.
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to cancel your disconnection request?")) {
                              cancelDisconnectionMutation.mutate();
                            }
                          }}
                          disabled={cancelDisconnectionMutation.isPending}
                        >
                          {cancelDisconnectionMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            "Cancel Request"
                          )}
                        </Button>
                      </div>
                    ) : disconnectionStatus?.status === 'disconnected' || disconnectionStatus?.status === 'for_disconnection' ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-900">Account Disconnected</p>
                            <p className="text-xs text-red-700 mt-1">
                              Your water service has been disconnected.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : disconnectionStatus?.disconnection_rejection_reason ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Disconnection Request Not Approved</p>
                            <p className="text-xs text-blue-700 mt-1">
                              {disconnectionStatus.disconnection_rejection_reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => setDisconnectModalOpen(true)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Disconnect Account
                      </Button>
                    )}

                    {/* Archive Account Button */}
                    {archiveStatus?.archive_status === 'pending_archive' ? (
                      <div className="space-y-2">
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-yellow-900">Archive Request Pending</p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Your archive request is awaiting admin approval.
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to cancel your archive request?")) {
                              cancelArchiveMutation.mutate();
                            }
                          }}
                          disabled={cancelArchiveMutation.isPending}
                        >
                          {cancelArchiveMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            "Cancel Request"
                          )}
                        </Button>
                      </div>
                    ) : archiveStatus?.archive_status === 'archived' ? (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-900">Account Archived</p>
                            <p className="text-xs text-red-700 mt-1">
                              Your account has been archived.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : archiveStatus?.archive_rejection_reason ? (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">Archive Request Not Approved</p>
                            <p className="text-xs text-blue-700 mt-1">
                              {archiveStatus.archive_rejection_reason}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                        onClick={() => setArchiveModalOpen(true)}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Request Account Archive
                      </Button>
                    )}
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
              // Step 1: Password Entry
              <div className="space-y-4 py-4">
                {/* Current Password */}
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

                {/* New Password */}
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

                {/* Confirm New Password */}
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
              // Step 2: Verification Code
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
                      const value = e.target.value.replace(/\D/g, ""); // Only allow digits
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

        {/* Disconnect Account Confirmation Modal */}
        <Dialog open={disconnectModalOpen} onOpenChange={setDisconnectModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Disconnect Account
              </DialogTitle>
              <DialogDescription className="text-gray-700">
                Do you really want to disconnect your water service account?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action will request disconnection of your water service.
                  Your request will be sent to the administrator for approval.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDisconnectModalOpen(false)}
                disabled={requestDisconnectionMutation.isPending}
              >
                No, Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => requestDisconnectionMutation.mutate()}
                disabled={requestDisconnectionMutation.isPending}
              >
                {requestDisconnectionMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Yes, Disconnect"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Account Request Modal */}
        <Dialog open={archiveModalOpen} onOpenChange={setArchiveModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-orange-600">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Request Account Archive
              </DialogTitle>
              <DialogDescription className="text-gray-700">
                Please provide a reason for archiving your account
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Important:</strong> Archiving your account will prevent you from logging in.
                  This request will be sent to the administrator for approval.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="archive-reason">Reason for Archive</Label>
                <Textarea
                  id="archive-reason"
                  placeholder="Please explain why you want to archive your account (minimum 10 characters)"
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {archiveReason.length}/10 characters minimum
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setArchiveModalOpen(false);
                  setArchiveReason("");
                }}
                disabled={requestArchiveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleArchiveSubmit}
                disabled={requestArchiveMutation.isPending || !archiveReason || archiveReason.trim().length < 10}
              >
                {requestArchiveMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
