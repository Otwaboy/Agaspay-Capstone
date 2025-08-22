import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Card, CardContent } from "../ui/card";
import { useToast } from "../../hooks/use-toast";
import { AlertTriangle, Droplets, Wrench, FileText, Phone, Upload } from "lucide-react";

export default function ReportIssueModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    issueType: "",
    priority: "medium",
    subject: "",
    description: "",
    location: "",
    contactPhone: "",
    contactEmail: "",
    preferredContact: "phone",
    attachments: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const issueTypes = [
    {
      id: "water_pressure",
      name: "Low Water Pressure",
      icon: Droplets,
      color: "text-blue-600",
      description: "Insufficient water flow or pressure"
    },
    {
      id: "no_water",
      name: "No Water Supply",
      icon: AlertTriangle,
      color: "text-red-600",
      description: "Complete water service interruption"
    },
    {
      id: "water_leak",
      name: "Water Leak",
      icon: Droplets,
      color: "text-orange-600",
      description: "Leaks in pipes, meters, or connections"
    },
    {
      id: "water_quality",
      name: "Water Quality Issue",
      icon: AlertTriangle,
      color: "text-yellow-600",
      description: "Discolored, bad taste, or odor"
    },
    {
      id: "meter_issue",
      name: "Meter Problem",
      icon: Wrench,
      color: "text-purple-600",
      description: "Meter reading or functionality issues"
    },
    {
      id: "billing_dispute",
      name: "Billing Dispute",
      icon: FileText,
      color: "text-green-600",
      description: "Questions about billing or charges"
    },
    {
      id: "service_request",
      name: "Service Request",
      icon: Wrench,
      color: "text-gray-600",
      description: "Maintenance or repair requests"
    },
    {
      id: "other",
      name: "Other Issue",
      icon: Phone,
      color: "text-gray-500",
      description: "Other water service related concerns"
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const requestId = `SR-2024-${Date.now().toString().slice(-3)}`;

      toast({
        title: "Issue Reported Successfully",
        description: `Your service request ${requestId} has been submitted. We'll contact you within 24 hours.`,
        variant: "default"
      });

      // Reset form
      setFormData({
        issueType: "",
        priority: "medium",
        subject: "",
        description: "",
        location: "",
        contactPhone: "",
        contactEmail: "",
        preferredContact: "phone",
        attachments: []
      });
      
      onClose();
    } catch (error) {
      console.error('Issue reporting error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ 
      ...prev, 
      attachments: [...prev.attachments, ...files].slice(0, 3) // Max 3 files
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Water Service Issue</DialogTitle>
          <DialogDescription>
            Please provide details about the issue you're experiencing. We'll respond within 24 hours.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Type of Issue</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {issueTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div
                    key={type.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.issueType === type.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleChange("issueType")(type.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <IconComponent className={`h-5 w-5 ${type.color} mt-0.5`} />
                      <div>
                        <p className="font-medium text-sm text-gray-900">{type.name}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Level */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select onValueChange={handleChange("priority")} defaultValue="medium">
              <SelectTrigger data-testid="select-priority">
                <SelectValue placeholder="Select priority level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Can wait a few days</SelectItem>
                <SelectItem value="medium">Medium - Should be addressed soon</SelectItem>
                <SelectItem value="high">High - Needs immediate attention</SelectItem>
                <SelectItem value="urgent">Urgent - Emergency situation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Issue Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Issue Summary</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange("subject")(e.target.value)}
                placeholder="Brief description of the issue"
                required
                data-testid="input-subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description")(e.target.value)}
                placeholder="Please provide as much detail as possible about the issue, including when it started, how often it occurs, and any steps you've already taken."
                required
                className="min-h-[100px]"
                data-testid="textarea-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Specific Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location")(e.target.value)}
                placeholder="e.g., Kitchen sink, Main water line, Meter area"
                data-testid="input-location"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Contact Information</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Phone Number</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) => handleChange("contactPhone")(e.target.value)}
                  placeholder="09123456789"
                  required
                  data-testid="input-contact-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email Address</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleChange("contactEmail")(e.target.value)}
                  placeholder="your.email@example.com"
                  data-testid="input-contact-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContact">Preferred Contact Method</Label>
              <Select onValueChange={handleChange("preferredContact")} defaultValue="phone">
                <SelectTrigger data-testid="select-preferred-contact">
                  <SelectValue placeholder="How should we contact you?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="sms">Text Message (SMS)</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Attachments */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Attachments (Optional)</Label>
            <Card className="p-4">
              <CardContent className="p-0">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Upload photos or documents that might help us understand the issue better (Max 3 files, 5MB each)
                  </p>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="file-upload">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="cursor-pointer"
                        disabled={formData.attachments.length >= 3}
                        data-testid="button-upload-file"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Files
                      </Button>
                    </label>
                  </div>

                  {formData.attachments.length > 0 && (
                    <div className="space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAttachment(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.issueType || !formData.subject || !formData.description || isLoading}
              data-testid="button-submit-report"
            >
              {isLoading ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}