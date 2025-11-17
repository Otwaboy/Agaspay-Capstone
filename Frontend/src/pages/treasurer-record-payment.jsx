import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Wallet,
  Search,
  Check,
  AlertCircle,
  Receipt,
  User,
  DollarSign,
  FileText,
  Power
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";
import apiClient from "../lib/api";
import { toast } from "sonner";

export default function TreasurerRecordPayment() {
  const queryClient = useQueryClient();

  // Form state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [requestReconnection, setRequestReconnection] = useState(false);

  // Fetch all unpaid and partial bills
  const { data: billHistory, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/unpaid-bills'],
    staleTime: 1 * 60 * 1000,
    queryFn: () => apiClient.getCurrentBill(),
  });

  // Filter bills - only show unpaid and partial status
  const unpaidBills = billHistory?.data?.filter(bill =>
    bill.status === 'unpaid' || bill.status === 'partial'
  ) || [];

  // Filter bills based on search
  const filteredBills = unpaidBills.filter(bill => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      bill.full_name.toLowerCase().includes(searchLower) ||
      bill.meter_no.toLowerCase().includes(searchLower) ||
      bill.bill_id.toLowerCase().includes(searchLower)
    );
  });

  // Record payment mutation
  const recordPaymentMutation = useMutation({
    mutationFn: (paymentData) => apiClient.recordManualPayment(paymentData),
    onSuccess: (data) => {
      toast.success(data.message || "Payment recorded successfully!");

      // Reset form
      setSelectedBill(null);
      setAmountPaid("");
      setPaymentMethod("cash");
      setNotes("");
      setRequestReconnection(false);
      setSearchTerm("");

      // Invalidate queries to refresh data
      queryClient.invalidateQueries(['/api/v1/treasurer/unpaid-bills']);
      queryClient.invalidateQueries(['/api/v1/treasurer/bill-history']);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to record payment");
    }
  });

  const handleBillSelect = (bill) => {
    setSelectedBill(bill);
    // Calculate remaining balance
    const remaining = bill.total_amount - (bill.amount_paid || 0);
    setAmountPaid(remaining.toString());
    // Reset reconnection request
    setRequestReconnection(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedBill) {
      toast.error("Please select a bill first");
      return;
    }

    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const paymentData = {
      bill_id: selectedBill.bill_id,
      amount_paid: parseFloat(amountPaid),
      payment_method: paymentMethod,
      notes: notes || undefined,
      request_reconnection: requestReconnection || undefined
    };

    recordPaymentMutation.mutate(paymentData);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRemainingBalance = (bill) => {
    return bill.total_amount - (bill.amount_paid || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'unpaid':
        return <Badge className="bg-yellow-100 text-yellow-800">Unpaid</Badge>;
      case 'partial':
        return <Badge className="bg-orange-100 text-orange-800">Partial</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <TreasurerSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <TreasurerTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Record Payment
                  </h1>
                  <p className="text-gray-600">Record walk-in and manual payments</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Bill Selection */}
              <div className="space-y-6">
                {/* Search Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Bill to Pay</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search by name, meter number, or bill ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Bills List */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {isLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : filteredBills.length === 0 ? (
                        <div className="text-center py-8">
                          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">
                            {searchTerm ? "No bills found" : "No unpaid bills"}
                          </p>
                        </div>
                      ) : (
                        filteredBills.map((bill) => (
                          <div
                            key={bill.bill_id}
                            onClick={() => handleBillSelect(bill)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                              selectedBill?.bill_id === bill.bill_id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">{bill.full_name}</p>
                                <p className="text-sm text-gray-600">{bill.meter_no}</p>
                              </div>
                              {getStatusBadge(bill.status)}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total Amount:</span>
                                <span className="font-semibold">{formatCurrency(bill.total_amount)}</span>
                              </div>
                              {bill.amount_paid > 0 && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Paid:</span>
                                  <span className="text-green-600">{formatCurrency(bill.amount_paid)}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-gray-600">Balance:</span>
                                <span className="font-bold text-orange-600">
                                  {formatCurrency(getRemainingBalance(bill))}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Due Date:</span>
                                <span>{formatDate(bill.due_date)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Payment Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!selectedBill ? (
                      <div className="text-center py-12">
                        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Select a bill to record payment</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Selected Bill Summary */}
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <User className="h-5 w-5 text-blue-600" />
                              <span className="font-semibold text-gray-900">{selectedBill.full_name}</span>
                            </div>
                            {getStatusBadge(selectedBill.status)}
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">Meter: {selectedBill.meter_no}</p>
                            <p className="text-gray-600">Purok: {selectedBill.purok_no}</p>
                            <div className="pt-2 mt-2 border-t border-blue-200">
                              <div className="flex justify-between font-semibold">
                                <span>Total Amount:</span>
                                <span>{formatCurrency(selectedBill.total_amount)}</span>
                              </div>
                              {selectedBill.amount_paid > 0 && (
                                <div className="flex justify-between text-green-600">
                                  <span>Already Paid:</span>
                                  <span>-{formatCurrency(selectedBill.amount_paid)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-lg font-bold text-orange-600 mt-1">
                                <span>Remaining Balance:</span>
                                <span>{formatCurrency(getRemainingBalance(selectedBill))}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Amount Paid */}
                        <div className="space-y-2">
                          <Label htmlFor="amount_paid">
                            Amount Paid <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                              id="amount_paid"
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={getRemainingBalance(selectedBill)}
                              value={amountPaid}
                              onChange={(e) => setAmountPaid(e.target.value)}
                              className="pl-10"
                              placeholder="0.00"
                              required
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Maximum: {formatCurrency(getRemainingBalance(selectedBill))}
                          </p>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                          <Label htmlFor="payment_method">
                            Payment Method <span className="text-red-500">*</span>
                          </Label>
                          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="walk-in">Walk-in</SelectItem>
                              <SelectItem value="gcash">GCash</SelectItem>
                              <SelectItem value="paymaya">PayMaya</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes (Optional)</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                            <textarea
                              id="notes"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                              placeholder="Add any additional notes..."
                            />
                          </div>
                        </div>

                        {/* Request Reconnection - Only show if disconnected */}
                        {selectedBill.connection_status === 'disconnected' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                id="request_reconnection"
                                checked={requestReconnection}
                                onChange={(e) => setRequestReconnection(e.target.checked)}
                                className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <div className="flex-1">
                                <Label htmlFor="request_reconnection" className="flex items-center text-green-900 font-medium cursor-pointer">
                                  <Power className="h-4 w-4 mr-2" />
                                  Request Reconnection
                                </Label>
                                <p className="text-xs text-green-700 mt-1">
                                  Mark this connection for reconnection. The connection status will be updated to "for_reconnection" and can be scheduled by the secretary.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Submit Buttons */}
                        <div className="flex space-x-3 pt-4">
                          <Button
                            type="submit"
                            disabled={recordPaymentMutation.isPending}
                            className="flex-1"
                          >
                            {recordPaymentMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Recording...
                              </>
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Record Payment
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setSelectedBill(null);
                              setAmountPaid("");
                              setNotes("");
                              setRequestReconnection(false);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
