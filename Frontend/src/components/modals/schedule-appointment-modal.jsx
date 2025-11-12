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
import { AlertCircle } from "lucide-react";
import { authManager } from "../../lib/auth";

export default function ScheduleAppointmentModal({ isOpen, onClose, reportId, connectionId }) {
  const [formData, setFormData] = useState({
    description: "",
    scheduleType: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call backend API to create task with automatic scheduling
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/v1/schedule-task/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authManager.getToken()}`
        },
        body: JSON.stringify({
          connection_id: connectionId || null,
          report_id: reportId || null,
          description: formData.description,
          schedule_type: formData.scheduleType
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Task Scheduled Successfully",
          description: data.message || "Task has been automatically scheduled with available personnel",
          variant: "default",
          duration: 6000
        });

        // Reset form
        setFormData({
          description: "",
          scheduleType: ""
        });

        onClose();
      } else {
        throw new Error(data.message || 'Failed to schedule task');
      }

    } catch (error) {
      console.error('Task scheduling error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule task. Please try again.",
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
      <DialogContent className="bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Maintenance Task</DialogTitle>
          <DialogDescription>
            Create a maintenance task with automatic personnel assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Type */}
          <div className="space-y-2">
            <Label htmlFor="scheduleType">Task Type</Label>
            <Select onValueChange={handleChange("scheduleType")} required>
              <SelectTrigger data-testid="select-schedule-type">
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Meter Installation">Meter Installation</SelectItem>
                <SelectItem value="Meter Repair">Meter Repair</SelectItem>
                <SelectItem value="Pipe Leak Repair">Pipe Leak Repair</SelectItem>
                <SelectItem value="Maintenance">General Maintenance</SelectItem>
                <SelectItem value="Inspection">Inspection</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Task Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description")(e.target.value)}
              placeholder="Describe the task details..."
              rows={4}
              required
              data-testid="textarea-description"
            />
          </div>

          {/* Auto-scheduling Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-900">Automatic Scheduling</p>
                <p className="text-xs text-blue-700 mt-1">
                  The system will automatically assign this task to the next available maintenance personnel and schedule it for the next business day.
                </p>
              </div>
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
              {isLoading ? "Scheduling..." : "Schedule Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}