import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import {
  Receipt,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  Search,
  Calendar,
  CreditCard,
  Filter,
  FileText,
  ArrowLeft,
  Droplets
} from "lucide-react";
import apiClient from "../lib/api";
import { Link } from "wouter";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function ResidentPaymentHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/v1/payment'],
    queryFn: async () => {
      const res = await apiClient.getRecentPayment();
      return res.data || [];
    },
    retry: 1
  });

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "confirmed":
        return {
          label: "Paid",
          className: "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800",
          icon: CheckCircle,
          color: "text-green-600"
        };
      case "pending":
      case "unpaid":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800",
          icon: Clock,
          color: "text-yellow-600"
        };
      case "failed":
        return {
          label: "Failed",
          className: "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800",
          icon: XCircle,
          color: "text-red-600"
        };
      case "overdue":
        return {
          label: "Overdue",
          className: "bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800",
          icon: AlertCircle,
          color: "text-orange-600"
        };
      default:
        return {
          label: "Unknown",
          className: "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800",
          icon: XCircle,
          color: "text-gray-600"
        };
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case "paymongo":
      case "credit_card":
      case "debit_card":
        return CreditCard;
      case "gcash":
      case "cash":
        return Receipt;
      default:
        return FileText;
    }
  };

  // Filter payments based on search and filters
  const filteredPayments = paymentsData?.filter((payment) => {
    const matchesSearch = searchTerm === "" || 
      payment.payment_id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_method?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      payment.payment_status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesMethod = methodFilter === "all" || 
      payment.payment_method?.toLowerCase() === methodFilter.toLowerCase();

    const paymentDate = payment.payment_date ? new Date(payment.payment_date) : null;
    const now = new Date();
    
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthYear = lastMonth.getFullYear();
    const lastMonthMonth = lastMonth.getMonth();
    
    const matchesDate = dateFilter === "all" || 
      (dateFilter === "this_month" && paymentDate && 
        paymentDate.getMonth() === now.getMonth() && 
        paymentDate.getFullYear() === now.getFullYear()) ||
      (dateFilter === "last_month" && paymentDate && 
        paymentDate.getMonth() === lastMonthMonth && 
        paymentDate.getFullYear() === lastMonthYear) ||
      (dateFilter === "this_year" && paymentDate && 
        paymentDate.getFullYear() === now.getFullYear());

    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  }) || [];

  const totalPaid = filteredPayments
    .filter(p => p.payment_status?.toLowerCase() === 'confirmed' || p.payment_status?.toLowerCase() === 'paid')
    .reduce((sum, p) => sum + (p.amount_paid || 0), 0);

  const totalPending = filteredPayments
    .filter(p => p.payment_status?.toLowerCase() === 'pending')
    .reduce((sum, p) => sum + (p.amount_paid || 0), 0);

  const handleDownloadReceipt = async (payment) => {
    try {
      // Create temporary receipt HTML element
      const receiptDiv = document.createElement('div');
      receiptDiv.style.position = 'absolute';
      receiptDiv.style.left = '-9999px';
      receiptDiv.style.width = '800px';
      receiptDiv.style.padding = '60px';
      receiptDiv.style.backgroundColor = 'white';
      receiptDiv.style.fontFamily = 'Arial, sans-serif';


      // format of the temporary receipt 
      const receiptDate = payment.payment_date
        ? new Date(payment.payment_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : 'N/A';

      const isOfficial = payment.official_receipt_status === 'official_receipt';

      receiptDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 40px; border-radius: 16px 16px 0 0; text-align: center; color: white;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 16px;">
            
            <div>
              <h1 style="margin: 0; font-size: 32px; font-weight: bold;">AGASPAY</h1>
              <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Water Services</p>
            </div>
          </div>
          <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">Barangay Biking, Dauis, Bohol</p> 
        </div>

        <div style="padding: 40px; border: 2px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: ${isOfficial ? '#9333ea' : '#6b7280'}; color: white; padding-right: 8px; padding-left: 8px; padding-bottom: 18px;  padding-top: 12px; border-radius: 24px; font-size: 12px; font-weight: 600; margin-bottom: 8px;">
              ${isOfficial ? '✓ OFFICIAL RECEIPT' : 'TEMPORARY RECEIPT'}
            </div>
            <h2 style="margin: 16px 0 8px 0; font-size: 24px; font-weight: bold; color: #111827;">Payment Receipt</h2>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Reference #: <span style="color: #0891b2; font-weight: 600;">${payment.payment_reference}</span></p>
          </div>

          <div style="background: #f9fafb; padding: 24px; border-radius: 12px; margin-bottom: 32px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Payment Date</p>
                <p style="margin: 0; color: #111827; font-weight: 600; font-size: 16px;">${receiptDate}</p>
              </div>
              <div>
                <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Payment Method</p>
                <p style="margin: 0; color: #111827; font-weight: 600; font-size: 16px; text-transform: capitalize;">${payment.payment_method || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div style="border-top: 2px dashed #e5e7eb; padding-top: 24px; margin-bottom: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Payment Type:</p>
              <p style="margin: 0; color: #111827; font-weight: 600; font-size: 14px; text-transform: capitalize;">${payment.payment_type || 'Water Bill'} Payment</p>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Status:</p>
              <span style="background: #d1fae5; color: #065f46; padding: 6px 6px 14px 6px; border-radius: 402px; font-size: 10px; font-weight: 600; text-transform: uppercase;">${payment.payment_status || 'N/A'}</span>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 24px; border-radius: 12px; text-align: center; color: white; margin-bottom: 32px;">
            <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.9;">Amount Paid</p>
            <p style="margin: 0; font-size: 42px; font-weight: bold;">₱${payment.amount_paid?.toFixed(2) || '0.00'}</p>
          </div>

          <div style="border-top: 2px solid #e5e7eb; padding-top: 24px; text-align: center;">
            <p style="margin: 0 0 8px 0; color: #059669; font-weight: 600; font-size: 16px;">✓ Payment Confirmed</p>
            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 12px;">Thank you for your payment!</p>
            <p style="margin: 0; color: #9ca3af; font-size: 11px; font-style: italic;">This is a computer-generated receipt. No signature required.</p>
            <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 11px;">Generated on ${new Date().toLocaleString('en-US')}</p>
          </div>
        </div>
      `;

      document.body.appendChild(receiptDiv);

      // Convert to canvas and then to PDF
      const canvas = await html2canvas(receiptDiv, {
        scale: 2,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(receiptDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`AgasPay-Receipt-${payment.payment_id}.pdf`);

    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
              <p className="text-gray-600 mt-2">
                View all your payment transactions and download receipts
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Total Payments Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {filteredPayments.length}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">All time</p>
                </CardContent>
              </Card>

              {/* Total Paid Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Paid
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    ₱{totalPaid.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Confirmed payments</p>
                </CardContent>
              </Card>

              {/* Pending Amount Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pending Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    ₱{totalPending.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Awaiting confirmation</p>
                </CardContent>
              </Card>

              {/* This Month Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    This Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {paymentsData?.filter(p => {
                      const pDate = p.payment_date ? new Date(p.payment_date) : null;
                      const now = new Date();
                      return pDate && pDate.getMonth() === now.getMonth() && 
                        pDate.getFullYear() === now.getFullYear();
                    }).length || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Transactions</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-blue-600" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Payment Method Filter */}
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Payment Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="paymongo">PayMongo</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="gcash">GCash</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Date Filter */}
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="last_month">Last Month</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Payment History Table */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-green-600" />
                    Payment Transactions
                  </CardTitle>
                  <CardDescription className="hidden sm:block">
                    {filteredPayments.length} {filteredPayments.length === 1 ? 'transaction' : 'transactions'} found
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <div className="min-w-[700px] space-y-3">
                    {paymentsLoading ? (
                      [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
                    ) : filteredPayments.length > 0 ? (
                      filteredPayments.map((payment) => {
                        const statusConfig = getStatusConfig(payment.payment_status);
                        const StatusIcon = statusConfig.icon;
                        const PaymentIcon = getPaymentMethodIcon(payment.payment_method);

                        return (
                          <div
                            key={payment.payment_id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors min-w-[680px]"
                          >
                            <div className="flex items-center space-x-4 flex-1 min-w-0">
                              <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                                <PaymentIcon className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <p className="font-semibold text-gray-900">
                                    {payment.payment_type
                                      ? `${payment.payment_type.charAt(0).toUpperCase() + payment.payment_type.slice(1)} Payment`
                                      : 'Water Bill Payment'}
                                  </p>
                                  <Badge className={statusConfig.className}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusConfig.label}
                                  </Badge>
                                  <Badge className={payment.official_receipt_status === 'official_receipt'
                                    ? 'bg-purple-100 text-purple-800 hover:bg-purple-100 hover:text-purple-800'
                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800'}>
                                    <FileText className="h-3 w-3 mr-1" />
                                    {payment.official_receipt_status === 'official_receipt' ? 'Official' : 'Temporary'}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                                  <span className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    }) : 'N/A'}
                                  </span>
                                  <span className="flex items-center">
                                    <CreditCard className="h-3 w-3 mr-1" />
                                    {payment.payment_method || 'N/A'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    Ref: {payment.payment_reference || 'Pay Onsite'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 flex-shrink-0">
                              <div className="text-right">
                                <p className="text-2xl font-bold text-gray-900">
                                  ₱{payment.amount_paid?.toFixed(2) || '0.00'}
                                </p>
                                <p className="flex items-center text-xs text-gray-500">
                                   <Calendar className="h-3 w-3 mr-1" />Bill Period: <span className="ml-1">
                                      {payment.payment_date ? new Date(payment.billPeriod).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    }) : 'N/A'}
                                  </span>
                                </p>
                              </div>

                              {/* Only show download button for confirmed temporary receipts */}
                              {payment.official_receipt_status === 'temporary_receipt' &&
                               payment.payment_status?.toLowerCase() === 'confirmed' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadReceipt(payment)}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  Temporary Receipt
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-12">
                        <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg font-medium">No payments found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Your payment history will appear here'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </main>
      </div>
    </div>
  );
}
