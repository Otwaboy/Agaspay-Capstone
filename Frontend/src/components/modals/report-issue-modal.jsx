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
import { useToast } from "../../hooks/use-toast";
import { apiClient } from "../../lib/api";

export default function ReportIssueModal({ isOpen, onClose, onReportCreated }) {
  const [formData, setFormData] = useState({
    type: "",
    location: "",
    urgency_level: "medium",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('📤 Submitting incident report:', formData);
      
      // Call backend API using apiClient
      const response = await apiClient.createIncidentReport(formData);
      
      console.log('✅ Incident report created:', response);

      toast({
        title: "Issue Reported Successfully",
        description: "Your incident report has been submitted. We'll address it as soon as possible.",
        variant: "default"
      });

      // Reset form
      setFormData({
        type: "",
        location: "",
        urgency_level: "medium",
        description: ""
      });
      
      // Call callback to refresh data if provided
      if (onReportCreated) {
        onReportCreated();
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Incident report error:', error);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Water Service Issue</DialogTitle>
          <DialogDescription>
            Please provide details about the issue you're experiencing. We'll respond as soon as possible.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issue Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Type of Issue <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.type}
              onValueChange={handleChange("type")}
            >
              <SelectTrigger data-testid="select-issue-type">
                <SelectValue placeholder="Select type of issue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="No Water Supply">No Water Supply</SelectItem>
                <SelectItem value="Low Water Pressure">Low Water Pressure</SelectItem>
                <SelectItem value="Pipe Leak">Pipe Leak</SelectItem>
                <SelectItem value="Water Quality Issue">Water Quality Issue</SelectItem>
                <SelectItem value="Meter Problem">Meter Problem</SelectItem>
                <SelectItem value="Damaged Infrastructure">Damaged Infrastructure</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Urgency Level */}
          <div className="space-y-2">
            <Label htmlFor="urgency_level">
              Urgency Level <span className="text-red-500">*</span>
            </Label>
            <Select 
              value={formData.urgency_level}
              onValueChange={handleChange("urgency_level")}
            >
              <SelectTrigger data-testid="select-urgency">
                <SelectValue placeholder="Select urgency level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Can wait a few days</SelectItem>
                <SelectItem value="medium">Medium - Should be addressed soon</SelectItem>
                <SelectItem value="high">High - Needs immediate attention</SelectItem>
                <SelectItem value="critical">Critical - Emergency situation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location")(e.target.value)}
              placeholder="e.g., Purok 1, Main Road, House No. 123"
              required
              data-testid="input-location"
            />
            <p className="text-xs text-gray-500">
              Please provide the specific location where the issue is occurring
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Detailed Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description")(e.target.value)}
              placeholder="Please provide as much detail as possible about the issue, including when it started, how often it occurs, and any steps you've already taken."
              required
              className="min-h-[120px]"
              data-testid="textarea-description"
            />
            <p className="text-xs text-gray-500">
              Include details such as when the issue started, frequency, and any patterns you've noticed
            </p>
          </div>

          {/* Form Actions */}
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
              disabled={!formData.type || !formData.location || !formData.description || isLoading}
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