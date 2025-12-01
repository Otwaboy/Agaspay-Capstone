
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; // <-- import autoTable properly
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

export default function GenerateResidentReportModal({ isOpen, onClose }) {
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
      // Create start date from selected month and year
      const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1, 1);
      const startDateString = startDate.toISOString().split('T')[0];

      // Fetch residents from backend filtered by date
      const response = await apiClient.getResidentByDate(startDateString);
      const residents = response.data;

      console.log('Fetched residents:', residents);

      if (!residents || residents.length === 0) {
        const monthName = months.find(m => m.value === selectedMonth)?.label;
        toast.error("No Data Found", {
          description: `No residents were registered from ${monthName} ${selectedYear} to present`
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
      doc.text('Newly Registered Residents Report', pageWidth / 2, 23, { align: 'center' });

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
      doc.text(`Period: ${monthName} ${selectedYear} to Present`, pageWidth / 2, 30, { align: 'center' });
      doc.text(`Total Residents: ${residents.length}`, pageWidth / 2, 36, { align: 'center' });
      doc.text(`Generated report on: ${generatedTime}`, pageWidth / 2, 42, { align: 'center' });

    // Prepare table data
    const tableData = residents.map((resident, index) => [
      index + 1,
      `${resident.first_name} ${resident.last_name}`,
      `Zone ${resident.zone}, Purok ${resident.purok}`,
      resident.meter_no || 'N/A',
      resident.type || 'N/A',
      resident.contact_no || 'N/A',
      new Date(resident.created_at).toLocaleDateString('en-PH')
    ]);

    // Generate table using jspdf-autotable v5
    autoTable(doc, {
      head: [['#', 'Name', 'Address', 'Meter No.', 'Type', 'Contact', 'Registered']],
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
        1: { cellWidth: 35 },
        2: { cellWidth: 40 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
        6: { cellWidth: 25 }
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
    doc.text('Barangay Biking Dauis, Bohol', pageWidth / 2, footerY + 5, { align: 'center' });

    // Save PDF
    const fileName = `Residents_Report_${selectedMonth}_${new Date().getTime()}.pdf`;
    doc.save(fileName);

    toast.success("Report Generated", {
      description: `${residents.length} residents exported to PDF successfully`
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
            Generate Residents Report
          </DialogTitle>
          <DialogDescription>
            Select a start month to generate a PDF report of all residents registered from that month to present.
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
            All residents registered from this month to today will be included in the report
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
