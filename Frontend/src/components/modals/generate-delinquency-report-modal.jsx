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

export default function GenerateDelinquencyReportModal({ isOpen, onClose }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const formatCurrency = (amount) => {
    // Format for PDF without HTML entities
    const formatted = new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
    // Replace the peso symbol with plain text for PDF compatibility
    return formatted.replace('₱', 'PHP ');
  };

  const handleGenerateReport = async () => {
    if (!selectedStatus) {
      toast.error("Status Required", {
        description: "Please select a status filter for the report"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch delinquency records from backend
      const response = await apiClient.getOverdueBilling();
      const allDelinquent = response.data;

      console.log('Fetched delinquency records:', allDelinquent);

      if (!allDelinquent || allDelinquent.length === 0) {
        toast.error("No Data Found", {
          description: "No delinquent accounts found in the system"
        });
        setIsGenerating(false);
        return;
      }

      // Filter by selected status (all, critical, warning, moderate)
      const filteredRecords = selectedStatus === "all"
        ? allDelinquent
        : allDelinquent.filter(record => record.status === selectedStatus);

      if (filteredRecords.length === 0) {
        toast.error("No Data Found", {
          description: `No delinquent accounts found with status: ${selectedStatus}`
        });
        setIsGenerating(false);
        return;
      }

      // Calculate totals
      const totalOutstanding = filteredRecords.reduce((sum, record) => sum + record.totalDue, 0);

      // Generate PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('AGASPAY WATER SYSTEM', pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(14);
      doc.text('Delinquency Records Report', pageWidth / 2, 23, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const generatedDate = new Date().toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      doc.text(`Generated: ${generatedDate}`, pageWidth / 2, 30, { align: 'center' });

      const statusLabel = selectedStatus === "all" ? "ALL STATUSES" : selectedStatus.toUpperCase();
      doc.text(`Status Filter: ${statusLabel}`, pageWidth / 2, 36, { align: 'center' });
      doc.text(`Total Accounts: ${filteredRecords.length}`, pageWidth / 2, 42, { align: 'center' });
      doc.text(`Total Outstanding: ${formatCurrency(totalOutstanding)}`, pageWidth / 2, 48, { align: 'center' });

      // Prepare table data
      const tableData = filteredRecords.map((record, index) => [
        index + 1,
        record.accountNo || record.meterNo || 'N/A',
        record.residentName || 'N/A',
        `Purok ${record.purok || 'N/A'}`,
        formatCurrency(record.totalDue || 0),
        `${record.monthsOverdue || 0} ${record.monthsOverdue === 1 ? 'month' : 'months'}`,
        record.lastPayment
          ? new Date(record.lastPayment).toLocaleDateString('en-PH', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : 'No payment yet',
        (record.status || 'N/A').toUpperCase()
      ]);

      // Generate table using jspdf-autotable
      autoTable(doc, {
        head: [['#', 'Account No.', 'Resident Name', 'Purok', 'Total Due', 'Overdue', 'Last Payment', 'Status']],
        body: tableData,
        startY: 54,
        theme: 'striped',
        headStyles: {
          fillColor: [220, 38, 38], // Red color for delinquency
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 22 },
          2: { cellWidth: 35 },
          3: { cellWidth: 20 },
          4: { cellWidth: 25 },
          5: { cellWidth: 20 },
          6: { cellWidth: 25 },
          7: { cellWidth: 20 }
        },
        margin: { left: 10, right: 10 }
      });

      // Footer
      const finalY = doc.lastAutoTable?.finalY || 54;
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
      const fileName = `Delinquency_Report_${statusLabel}_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success("Report Generated", {
        description: `${filteredRecords.length} delinquent accounts exported to PDF successfully`
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
            Generate Delinquency Report
          </DialogTitle>
          <DialogDescription>
            Select a status filter to generate a PDF report of delinquent accounts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="statusFilter">Status Filter</Label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger id="statusFilter" className="w-full">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              All delinquent accounts matching the selected filter will be included in the report
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
            className="bg-red-600 hover:bg-red-700"
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
