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

export default function ScheduleAppointmentModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    residentName: "",
    residentPhone: "",
    residentEmail: "",
    appointmentType: "",
    appointmentDate: "",
    appointmentTime: "",
    purpose: "",
    notes: "",
    priority: "normal"
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
      const formattedDateTime = appointmentDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });

      toast({
        title: "Appointment Scheduled Successfully",
        description: `Appointment for ${formData.residentName} scheduled on ${formattedDateTime}`,
        variant: "default"
      });

      // Reset form
      setFormData({
        residentName: "",
        residentPhone: "",
        residentEmail: "",
        appointmentType: "",
        appointmentDate: "",
        appointmentTime: "",
        purpose: "",
        notes: "",
        priority: "normal"
      });
      
      onClose();
    } catch (error) {
      console.error('Appointment scheduling error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate time slots from 8 AM to 5 PM
  const timeSlots = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute of ['00', '30']) {
      const time = `${hour.toString().padStart(2, '0')}:${minute}`;
      const displayTime = new Date(`2024-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      timeSlots.push({ value: time, label: displayTime });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Appointment</DialogTitle>
          <DialogDescription>
            Schedule a meeting with a resident for barangay services.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resident Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Resident Information</h4>
            
            <div className="space-y-2">
              <Label htmlFor="residentName">Resident Name</Label>
              <Input
                id="residentName"
                value={formData.residentName}
                onChange={(e) => handleChange("residentName")(e.target.value)}
                placeholder="Enter resident full name"
                required
                data-testid="input-resident-name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="residentPhone">Phone Number</Label>
                <Input
                  id="residentPhone"
                  value={formData.residentPhone}
                  onChange={(e) => handleChange("residentPhone")(e.target.value)}
                  placeholder="Enter phone number"
                  required
                  data-testid="input-resident-phone"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="residentEmail">Email (Optional)</Label>
                <Input
                  id="residentEmail"
                  type="email"
                  value={formData.residentEmail}
                  onChange={(e) => handleChange("residentEmail")(e.target.value)}
                  placeholder="Enter email address"
                  data-testid="input-resident-email"
                />
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium text-gray-900">Appointment Details</h4>
            
            <div className="space-y-2">
              <Label htmlFor="appointmentType">Appointment Type</Label>
              <Select onValueChange={handleChange("appointmentType")} required>
                <SelectTrigger data-testid="select-appointment-type">
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document_processing">Document Processing</SelectItem>
                  <SelectItem value="water_connection">Water Connection Request</SelectItem>
                  <SelectItem value="business_permit">Business Permit</SelectItem>
                  <SelectItem value="barangay_clearance">Barangay Clearance</SelectItem>
                  <SelectItem value="complaint">Complaint Filing</SelectItem>
                  <SelectItem value="general_inquiry">General Inquiry</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Date</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => handleChange("appointmentDate")(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  data-testid="input-appointment-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appointmentTime">Time</Label>
                <Select onValueChange={handleChange("appointmentTime")} required>
                  <SelectTrigger data-testid="select-appointment-time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Appointment</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => handleChange("purpose")(e.target.value)}
                placeholder="Describe the purpose of this appointment"
                required
                data-testid="textarea-purpose"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select onValueChange={handleChange("priority")} defaultValue="normal">
                <SelectTrigger data-testid="select-priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes")(e.target.value)}
                placeholder="Any additional notes or special requirements"
                data-testid="textarea-notes"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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
              disabled={isLoading}
              data-testid="button-schedule"
            >
              {isLoading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}