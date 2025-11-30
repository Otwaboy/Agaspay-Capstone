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

export default function GeneratePaymentCollectionReportModal({ isOpen, onClose }) {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
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
      // Fetch all payments from backend
      const response = await apiClient.getRecentPayment();
      const allPayments = response.data;

      console.log('Fetched payments:', allPayments);

      if (!allPayments || allPayments.length === 0) {
        toast.error("No Data Found", {
          description: "No payment collections found in the system"
        });
        setIsGenerating(false);
        return;
      }

      // Filter payments by selected month and year
      const filteredPayments = allPayments.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        const paymentMonth = String(paymentDate.getMonth() + 1).padStart(2, '0');
        const paymentYear = paymentDate.getFullYear().toString();

        return paymentMonth === selectedMonth && paymentYear === selectedYear;
      });

      if (filteredPayments.length === 0) {
        const monthName = months.find(m => m.value === selectedMonth)?.label;
        toast.error("No Data Found", {
          description: `No payments found for ${monthName} ${selectedYear}`
        });
        setIsGenerating(false);
        return;
      }

      // Calculate totals
      const totalCollected = filteredPayments
        .filter(p => p.payment_status === "confirmed")
        .reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);

      const pendingAmount = filteredPayments
        .filter(p => p.payment_status === "pending")
        .reduce((sum, p) => sum + parseFloat(p.amount_paid || 0), 0);

      const confirmedCount = filteredPayments.filter(p => p.payment_status === "confirmed").length;
      const pendingCount = filteredPayments.filter(p => p.payment_status === "pending").length;

      // Generate PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('AGASPAY WATER SYSTEM', pageWidth / 2, 15, { align: 'center' });

      doc.setFontSize(14);
      doc.text('Payment Collection Report', pageWidth / 2, 23, { align: 'center' });

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
      doc.text(`Total Payments: ${filteredPayments.length}`, pageWidth / 2, 36, { align: 'center' });
      doc.text(`Generated report on: ${generatedTime}`, pageWidth / 2, 42, { align: 'center' });

      // Summary section
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total Collected (Confirmed): ${formatCurrency(totalCollected)} (${confirmedCount} payments)`, pageWidth / 2, 50, { align: 'center' });
      doc.text(`Pending Amount: ${formatCurrency(pendingAmount)} (${pendingCount} payments)`, pageWidth / 2, 56, { align: 'center' });

      // Prepare table data
      const tableData = filteredPayments.map((payment, index) => {
        const paymentDate = new Date(payment.payment_date);
        const formattedDate = paymentDate.toLocaleDateString('en-PH', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return [
          index + 1,
          payment.residentFullName || 'N/A',
          `Purok ${payment.purok || 'N/A'}`,
          formatCurrency(parseFloat(payment.amount_paid || 0)),
          payment.payment_method || 'N/A',
          payment.payment_reference || 'Pay Onsite',
          formattedDate,
          (payment.payment_status || 'N/A').toUpperCase()
        ];
      });

      // Generate table using jspdf-autotable
      autoTable(doc, {
        head: [['#', 'Resident Name', 'Purok', 'Amount', 'Method', 'Reference', 'Date', 'Status']],
        body: tableData,
        startY: 62,
        theme: 'striped',
        headStyles: {
          fillColor: [34, 197, 94], // Green color for payment collection
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 7 },
        columnStyles: {
          0: { cellWidth: 8 },
          1: { cellWidth: 35 },
          2: { cellWidth: 20 },
          3: { cellWidth: 25 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 },
          6: { cellWidth: 30 },
          7: { cellWidth: 20 }
        },
        margin: { left: 10, right: 10 }
      });

      // Footer
      const finalY = doc.lastAutoTable?.finalY || 56;
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
      const fileName = `Payment_Collection_${monthName}_${selectedYear}_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success("Report Generated", {
        description: `${filteredPayments.length} payment collections exported to PDF successfully`
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
            Generate Payment Collection Report
          </DialogTitle>
          <DialogDescription>
            Select a month and year to generate a PDF report of all payment collections.
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
            All payment collections from the selected month will be included in the report
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
            className="bg-green-600 hover:bg-green-700"
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
