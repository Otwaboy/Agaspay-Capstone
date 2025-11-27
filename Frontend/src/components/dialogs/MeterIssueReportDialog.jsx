import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { apiClient } from "../../lib/api";

export default function MeterIssueReportDialog({
  open,
  onOpenChange,
  connection,
  meterReader
}) {
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const createIssueMutation = useMutation({
    mutationFn: async (issueData) => {
      return apiClient.createMeterIssue(issueData);
    },
    onSuccess: () => {
      toast.success("Broken Meter Reported", {
        description: "Broken meter has been reported successfully. Connection status changed to disconnected."
      });
      setDescription("");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to report issue"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!description.trim()) {
      return toast.error("Validation Error", {
        description: "Please provide a description of the issue"
      });
    }

    const issueData = {
      type: "Broken Meter",
      connection_id: connection._id || connection.connection_id,
      location: connection?.meter_number || "Unknown Meter",
      description: description.trim(),
      urgency_level: "high",
      reported_issue_status: "Pending"
    };

    console.log("Submitting meter issue:", issueData);
    console.log("Connection object:", connection);

    createIssueMutation.mutate(issueData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Report Meter Issue
          </DialogTitle>
          <DialogDescription>
            Report the issue with meter <strong>{connection?.meter_number}</strong> for{" "}
            <strong>{connection?.full_name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Broken Meter Type Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900">
              Meter Type: <strong>Broken Meter</strong>
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">
              Description <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the issue in detail. This will help maintenance personnel understand what needs to be repaired."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-32 resize-none"
            />
            <p className="text-xs text-gray-500">
              {description.length} / 500 characters
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-sm text-amber-800 mt-2 space-y-1 ml-4 list-disc">
              <li>Connection status will be marked as "Disconnected"</li>
              <li>Secretary will review and assign to maintenance</li>
              <li>Maintenance will repair the meter</li>
              <li>You'll be able to read this meter again once repair is complete</li>
            </ul>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIssueType("");
                setDescription("");
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={createIssueMutation.isPending}
            >
              {createIssueMutation.isPending ? "Reporting..." : "Report Issue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
