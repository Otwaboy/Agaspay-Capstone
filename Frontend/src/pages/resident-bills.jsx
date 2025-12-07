import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Separator } from "../components/ui/separator";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import PayBillModal from "../components/modals/pay-bill-modal";
import {
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Droplets,
  Download,
  Receipt,
  AlertCircle
} from "lucide-react";
import apiClient from "../lib/api";

export default function ResidentBills() {
  const [isPayBillModalOpen, setIsPayBillModalOpen] = useState(false);

  const { data: billData, isLoading: billLoading } = useQuery({
    queryKey: ['/api/v1/billing'],
    queryFn: async () => {
      const res = await apiClient.getCurrentBill();
      console.log('Bill data:', res);
      // Filter out connection fee bills (50 pesos with no reading_id)
      // Connection fees are paid manually through treasurer only
      const regularBills = res.billingDetails?.filter(bill =>
        !(bill.current_charges === 50 && !bill.reading_id)
      ) || [];
      return regularBills?.[0] || null;
    },
    retry: 1
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/v1/payment'],
    queryFn: async () => {
      const res = await apiClient.getRecentPayment();
      return res.data?.slice(0, 3) || [];
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
      case "partial":
        return {
          label: "Partial",
          className: "bg-orange-100 text-orange-800 hover:bg-orange-100 hover:text-orange-800",
          icon: Clock,
          color: "text-orange-600"
        };
      case "pending":
      case "unpaid":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800",
          icon: Clock,
          color: "text-yellow-600"
        };
      case "overdue":
        return {
          label: "Overdue",
          className: "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800",
          icon: AlertCircle,
          color: "text-red-600"
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
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-bills-title">
                Bills & Payments
              </h1>
              <p className="text-gray-600 mt-2">
                View your water bills and manage payments
              </p>
            </div>

            {/* Current Bill Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                {billLoading ? (
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ) : billData ? (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          Current Water Bill
                        </CardTitle>
                        <CardDescription>
                          Billing Period: {billData.billing_period || 'N/A'}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusConfig(billData.billing_status).className}>
                        {getStatusConfig(billData.billing_status).label}
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      {/* Bill Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                          <div>
                            <p className="text-sm text-gray-600">Current Reading</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {billData.current_reading || 0} m³
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Consumption</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {billData.consumption || 0} m³
                            </p>
                          </div>
                        </div>

                        <Separator />

                        {/* Charges Breakdown */}
                        <div className="space-y-3">
                          <h4 className="font-semibold text-gray-900">Charges Breakdown</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Water Charge</span>
                              <span className="font-medium">₱{billData.water_charge?.toFixed(2) || '0.00'}</span>
                            </div>
                            {billData.sewerage_charge > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Sewerage Fee</span>
                                <span className="font-medium">₱{billData.sewerage_charge?.toFixed(2)}</span>
                              </div>
                            )}
                            {billData.maintenance_charge > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Maintenance Fee</span>
                                <span className="font-medium">₱{billData.maintenance_charge?.toFixed(2)}</span>
                              </div>
                            )}
                            {billData.penalty > 0 && (
                              <div className="flex justify-between text-red-600">
                                <span>Penalty</span>
                                <span className="font-medium">₱{billData.penalty?.toFixed(2)}</span>
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Show original total if partial payment */}
                          {billData.billing_status === 'partial' && billData.amount_paid > 0 && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Original Total</span>
                                <span>₱{billData.total_amount?.toFixed(2) || '0.00'}</span>
                              </div>
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Amount Paid</span>
                                <span>-₱{billData.amount_paid?.toFixed(2) || '0.00'}</span>
                              </div>
                              <Separator />
                              <div className="flex justify-between text-lg font-bold">
                                <span>Remaining Balance</span>
                                <span className="text-orange-600">₱{billData.balance?.toFixed(2) || '0.00'}</span>
                              </div>
                            </>
                          )}

                          {/* Show total for non-partial bills */}
                          {billData.billing_status !== 'partial' && (
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total Amount Due</span>
                              <span className="text-blue-600">₱{billData.total_amount?.toFixed(2) || '0.00'}</span>
                            </div>
                          )}

                          <div className="flex justify-between text-sm text-gray-600">
                            <span>Due Date</span>
                            <span>{billData.due_date ? new Date(billData.due_date).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6">
                          <Button 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setIsPayBillModalOpen(true)}
                            disabled={billData.billing_status === 'paid' || billData.billing_status === 'confirmed'}
                            data-testid="button-pay-bill"
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {billData.billing_status === 'paid' ? 'Already Paid' : 'Pay Now'}
                          </Button>
                          <Button 
                            variant="outline"
                            data-testid="button-download-bill"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-orange-200">
                    <CardContent className="pt-6">
                      <div className="text-center py-8">
                        <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                          <FileText className="h-8 w-8 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Current Bill</h3>
                        <p className="text-gray-600">
                          You don't have any pending bills at the moment.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Account Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {billData?.billing_status === 'paid' || billData?.billing_status === 'confirmed' 
                        ? 'Good Standing' 
                        : 'Payment Pending'}
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      Last updated: {new Date().toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Water Service
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-semibold">Active</p>
                        <p className="text-xs text-gray-600">Connection ID: {billData?.connection_id || 'N/A'}</p>
                      </div>
                    </div>
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
                      {billData?.consumption || 0} m³
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Water consumption</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Payments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Receipt className="h-5 w-5 mr-2 text-green-600" />
                    Recent Payments
                  </CardTitle>
                  <CardDescription>Your latest payment transactions</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/resident-dashboard/payment-history'}
                  data-testid="button-view-all-payments"
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : paymentsData && paymentsData.length > 0 ? (
                  <div className="space-y-3">
                    {paymentsData.map((payment) => {
                      const statusConfig = getStatusConfig(payment.payment_status);
                      const StatusIcon = statusConfig.icon;
                      
                      return (
                        <div
                          key={payment.payment_id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          data-testid={`payment-item-${payment.payment_id}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <Receipt className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {payment.payment_type || 'Water Bill Payment'}
                              </p>
                              <p className="text-sm text-gray-600">
                                {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <p className="font-bold text-gray-900">
                                ₱{payment.amount_paid?.toFixed(2) || '0.00'}
                              </p>
                              <Badge className={statusConfig.className}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No payment history found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <PayBillModal 
        isOpen={isPayBillModalOpen} 
        onClose={() => setIsPayBillModalOpen(false)} 
      />
    </div>
  );
}
