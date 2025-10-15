import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { CreditCard, Download, Eye, Receipt } from "lucide-react";
import apiClient from "../lib/api"

export default function ResidentPaymentHistory() {
  const { data: paymentsData, isLoading, error } = useQuery({
    queryKey: ['/api/v1/payment'],
    queryFn: async () => {
      console.log('🔄 Fetching payment history from MongoDB backend...');
      const res = await apiClient.getRecentPayment();
      console.log('✅ Payment history received:', res);
      return res.data;
    },
    retry: 1,
    retryDelay: 1000
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 hover:text-yellow-800";
      case "failed": return "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-100 hover:text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "water bill payment": return "text-blue-600";
      case "late fee": return "text-red-600";
      case "service fee": return "text-orange-600";
      case "deposit": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>Your payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4 flex-1">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
            Payment History
          </CardTitle>
          <CardDescription>Unable to load payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Backend Server Offline</h3>
            <p className="text-gray-600 mb-4">
              Your MongoDB backend server is not running on port 3000.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
            >
              Retry Connection
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate totals
  const totalPaidThisYear = paymentsData?.reduce((sum, payment) => {
    const paymentYear = new Date(payment.payment_date).getFullYear();
    const currentYear = new Date().getFullYear();
    if (paymentYear === currentYear && payment.payment_status === 'confirmed') {
      return sum + (payment.amount_paid || 0);
    }
    return sum;
  }, 0) || 0;

  const transactionsThisYear = paymentsData?.filter(payment => {
    const paymentYear = new Date(payment.payment_date).getFullYear();
    const currentYear = new Date().getFullYear();
    return paymentYear === currentYear;
  }).length || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-green-600" />
            Payment History
          </CardTitle>
          <CardDescription>Your payment transactions</CardDescription>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {paymentsData?.length || 0} Transactions
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentsData && paymentsData.length > 0 ? (
            paymentsData.slice(0, 5).map((payment) => (
              <div 
                key={payment.payment_id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                data-testid={`payment-row-${payment.payment_id}`}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Receipt className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium truncate ${getTypeColor(payment.payment_type || 'Water Bill Payment')}`}>
                        {payment.payment_type || 'Water Bill Payment'}
                      </p>
                      <p className="text-xs text-gray-500 ml-2">#{payment.payment_reference || 'N/A'}</p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {payment.residentFullName && `Paid by: ${payment.residentFullName}`}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">{payment.payment_method || 'N/A'}</p>
                      <span className="text-gray-400">•</span>
                      <p className="text-xs text-gray-500">
                        {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'}
                      </p>
                      {payment.official_receipt_status && (
                        <>
                          <span className="text-gray-400">•</span>
                          <p className="text-xs text-gray-500">OR: {payment.official_receipt_status}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₱{payment.amount_paid ? payment.amount_paid.toFixed(2) : '0.00'}</p>
                    <Badge className={getStatusColor(payment.payment_status)}>
                      {payment.payment_status || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2"
                      data-testid={`button-view-${payment.payment_id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2"
                      data-testid={`button-download-${payment.payment_id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No payment history found</p>
            </div>
          )}
        </div>
        
        {/* Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Total Paid This Year</p>
              <p className="text-xl font-bold text-green-900">₱{totalPaidThisYear.toFixed(2)}</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Transactions This Year</p>
              <p className="text-xl font-bold text-blue-900">{transactionsThisYear}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" data-testid="button-download-history">
            <Download className="h-4 w-4 mr-2" />
            Download Payment History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}