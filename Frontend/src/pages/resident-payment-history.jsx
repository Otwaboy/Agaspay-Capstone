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
  ArrowLeft
} from "lucide-react";
import apiClient from "../lib/api";
import { Link } from "wouter";

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
    
    // Calculate last month properly handling year boundaries
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

  // Calculate summary statistics
  const totalPaid = filteredPayments
    .filter(p => p.payment_status?.toLowerCase() === 'confirmed' || p.payment_status?.toLowerCase() === 'paid')
    .reduce((sum, p) => sum + (p.amount_paid || 0), 0);

  const totalPending = filteredPayments
    .filter(p => p.payment_status?.toLowerCase() === 'pending')
    .reduce((sum, p) => sum + (p.amount_paid || 0), 0);

  const handleDownloadReceipt = async (payment) => {
    try {
      // Generate receipt content
      const receiptContent = `
AGASPAY WATER SERVICES
Barangay Biking, Dauis, Bohol
================================

PAYMENT RECEIPT
Reference #: ${payment.payment_id}
Date: ${payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'N/A'}

================================
Payment Details:
--------------------------------
Type: ${payment.payment_type || 'Water Bill Payment'}
Amount: ₱${payment.amount_paid?.toFixed(2) || '0.00'}
Method: ${payment.payment_method || 'N/A'}
Status: ${payment.payment_status || 'N/A'}
Billing Period: ${payment.billing_period || 'N/A'}

================================
Thank you for your payment!

This is a computer-generated receipt.
No signature required.
      `.trim();

      // Create a blob and download
      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${payment.payment_id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      // You could show a toast notification here if needed
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header with Back Button */}
            <div className="mb-8">
              <Link href="/resident/bills">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mb-4"
                  data-testid="button-back-to-bills"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Bills
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-payment-history-title">
                Payment History
              </h1>
              <p className="text-gray-600 mt-2">
                View all your payment transactions and download receipts
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-blue-600" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-payments"
                    />
                  </div>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger data-testid="select-status-filter">
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
                    <SelectTrigger data-testid="select-method-filter">
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
                    <SelectTrigger data-testid="select-date-filter">
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
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="h-5 w-5 mr-2 text-green-600" />
                  Payment Transactions
                </CardTitle>
                <CardDescription>
                  {filteredPayments.length} {filteredPayments.length === 1 ? 'transaction' : 'transactions'} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : filteredPayments.length > 0 ? (
                  <div className="space-y-3">
                    {filteredPayments.map((payment) => {
                      const statusConfig = getStatusConfig(payment.payment_status);
                      const StatusIcon = statusConfig.icon;
                      const PaymentIcon = getPaymentMethodIcon(payment.payment_method);
                      
                      return (
                        <div
                          key={payment.payment_id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          data-testid={`payment-history-item-${payment.payment_id}`}
                        >
                          <div className="flex items-center space-x-4 flex-1">
                            <div className="bg-blue-100 p-3 rounded-lg">
                              <PaymentIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-semibold text-gray-900">
                                  {payment.payment_type || 'Water Bill Payment'}
                                </p>
                                <Badge className={statusConfig.className}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig.label}
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
                                  Ref: {payment.payment_id}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">
                                ₱{payment.amount_paid?.toFixed(2) || '0.00'}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.billing_period || 'N/A'}
                              </p>
                            </div>
                            
                            {(payment.payment_status?.toLowerCase() === 'confirmed' || 
                              payment.payment_status?.toLowerCase() === 'paid') && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReceipt(payment)}
                                data-testid={`button-download-receipt-${payment.payment_id}`}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
