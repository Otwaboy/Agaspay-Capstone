import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { FileText, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import apiClient from "../../lib/api";

export default function GenerateAssignmentReportModal({ isOpen, onClose }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!selectedStatus) {
      toast.error("Status Required", {
        description: "Please select a task status for the report"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch assignments from backend
      const response = await apiClient.getAssignments();
      const allAssignments = response.assignments;

      console.log('Fetched assignments:', allAssignments);

      if (!allAssignments || allAssignments.length === 0) {
        toast.error("No Data Found", {
          description: "No assignments found in the system"
        });
        setIsGenerating(false);
        return;
      }

      // Filter assignments by selected status
      const filteredAssignments = allAssignments.filter(assignment => {
        const taskStatus = assignment.task?.task_status?.toLowerCase();
        return taskStatus === selectedStatus.toLowerCase();
      });

      if (filteredAssignments.length === 0) {
        toast.error("No Data Found", {
          description: `No assignments found with status: ${selectedStatus}`
        });
        setIsGenerating(false);
        return;
      }

      // Generate PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('AGASPAY WATER SYSTEM', pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(14);
      doc.text('Task Assignment Report', pageWidth / 2, 23, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const generatedDate = new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated: ${generatedDate}`, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Status Filter: ${selectedStatus.toUpperCase()}`, pageWidth / 2, 36, { align: 'center' });
      doc.text(`Total Assignments: ${filteredAssignments.length}`, pageWidth / 2, 42, { align: 'center' });

      // Prepare table data
      const tableData = filteredAssignments.map((assignment, index) => {
        const task = assignment.task || {};
        const personnel = assignment.personnel || {};

        return [
          index + 1,
          task.task_type === 'disconnection' ? 'Disconnection'
            : task.task_type === 'reconnection' ? 'Reconnection'
            : task.type || 'N/A',
          task.location || 'N/A',
          task.schedule_date ? new Date(task.schedule_date).toLocaleDateString('en-PH') : 'N/A',
          task.schedule_time || 'N/A',
          task.urgency_lvl || task.priority || 'N/A',
          personnel.name || 'Unassigned',
          (task.task_status || 'N/A').toUpperCase()
        ];
      });

      // Generate table using jspdf-autotable
      autoTable(doc, {
        head: [['#', 'Task Type', 'Location', 'Date', 'Time', 'Priority', 'Assigned To', 'Status']],
        body: tableData,
        startY: 48,
        theme: 'striped',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 8 },
        columnStyles: {
          0: { cellWidth: 10 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 30 },
          7: { cellWidth: 25 }
        },
        margin: { left: 10, right: 10 }
      });

      // Footer
      const finalY = doc.lastAutoTable?.finalY || 48;
      const footerY = doc.internal.pageSize.getHeight() - 20;

      if (finalY < footerY - 10) {
        doc.setLineWidth(0.5);
        doc.line(10, footerY - 5, pageWidth - 10, footerY - 5);
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.text('Generated from AGASPAY Water System', pageWidth / 2, footerY, { align: 'center' });
      doc.text('Barangay Biking, Daanbantayan, Cebu', pageWidth / 2, footerY + 5, { align: 'center' });

      // Save PDF
      const fileName = `Assignment_Report_${selectedStatus}_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success("Report Generated", {
        description: `${filteredAssignments.length} assignments exported to PDF successfully`
      });

      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error("Error", {
        description: error.message || "Failed to generate report. Please try again."
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Assignment Report
          </DialogTitle>
          <DialogDescription>
            Select a task status to generate a PDF report of all assignments with that status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="taskStatus">Task Status</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="taskStatus" className="w-full">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              All assignments with the selected status will be included in the report
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
