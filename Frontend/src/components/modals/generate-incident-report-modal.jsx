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

import { apiClient } from "../../lib/api";

export default function GenerateIncidentReportModal({ isOpen, onClose }) {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [isGenerating, setIsGenerating] = useState(false);

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const handleGenerateReport = async () => {
    if (!selectedMonth || !selectedYear) {
      toast.error("Selection Required", {
        description: "Please select both month and year for the report"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch all incident reports from backend
      const response = await apiClient.getIncidentReports({});
      const allIncidents = response.reports;

      console.log('Fetched incident reports:', allIncidents);

      if (!allIncidents || allIncidents.length === 0) {
        toast.error("No Data Found", {
          description: "No incident reports found in the system"
        });
        setIsGenerating(false);
        return;
      }

      // Filter incidents by selected month and year based on reported_at date
      const filteredIncidents = allIncidents.filter(incident => {
        if (!incident.reported_at) return false;

        const reportedDate = new Date(incident.reported_at);
        const reportedMonth = String(reportedDate.getMonth() + 1).padStart(2, '0');
        const reportedYear = reportedDate.getFullYear().toString();

        return reportedMonth === selectedMonth && reportedYear === selectedYear;
      });

      if (filteredIncidents.length === 0) {
        const monthName = months.find(m => m.value === selectedMonth)?.label;
        toast.error("No Data Found", {
          description: `No incidents found for ${monthName} ${selectedYear}`
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
      doc.text('Incident Reports', pageWidth / 2, 23, { align: 'center' });

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const monthName = months.find(m => m.value === selectedMonth)?.label;
      const generatedTime = new Date().toLocaleString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      doc.text(`Period: ${monthName} ${selectedYear}`, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Total Incidents: ${filteredIncidents.length}`, pageWidth / 2, 36, { align: 'center' });
      doc.text(`Generated report on: ${generatedTime}`, pageWidth / 2, 42, { align: 'center' });

      // Prepare table data
      const tableData = filteredIncidents.map((incident, index) => {
        const reportedDate = incident.reported_at
          ? new Date(incident.reported_at).toLocaleDateString('en-PH', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'N/A';

        return [
          index + 1,
          incident.type || 'N/A',
          incident.description || 'No description',
          incident.location || 'N/A',
          incident.reported_by || 'N/A',
          reportedDate,
          (incident.reported_issue_status || 'N/A').toUpperCase(),
          (incident.priority || 'medium').toUpperCase()
        ];
      });

      // Generate table using jspdf-autotable
      autoTable(doc, {
        head: [['#', 'Type', 'Description', 'Location', 'Reporter', 'Reported Date', 'Status', 'Priority']],
        body: tableData,
        startY: 48,
        theme: 'striped',
        headStyles: {
          fillColor: [239, 68, 68], // Red color for incidents
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 20 },
          2: { cellWidth: 40 },
          3: { cellWidth: 25 },
          4: { cellWidth: 25 },
          5: { cellWidth: 28 },
          6: { cellWidth: 18 },
          7: { cellWidth: 18 }
        },
        margin: { left: 10, right: 10 }
      });

      // Footer
      const finalY = doc.lastAutoTable?.finalY || 42;
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
      const fileName = `Incident_Report_${monthName}_${selectedYear}_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success("Report Generated", {
        description: `${filteredIncidents.length} incident reports exported to PDF successfully`
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
            Generate Incident Report
          </DialogTitle>
          <DialogDescription>
            Select a month and year to generate a PDF report of all incident reports.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger id="month" className="w-full">
                <SelectValue placeholder="Select month..." />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger id="year" className="w-full">
                <SelectValue placeholder="Select year..." />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-gray-500">
            All incident reports from the selected month will be included in the report
          </p>
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
