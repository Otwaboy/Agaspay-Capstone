import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { CreditCard, Download, Eye } from "lucide-react";
import apiClient from "../../lib/api";
import { Link } from "wouter";

export default function ResidentRecentTransactions({ connectionId }) {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['/api/resident/transactions', connectionId],
    queryFn: async () => {
      const res = await apiClient.getRecentPayment(connectionId);
      const paymentHistory = res.data;

      return paymentHistory.map((ph) => ({
        id: ph.payment_id, 
        date: ph.payment_date,
        amount: ph.amount_paid,
        type: ph.payment_type,
        status: ph.payment_status,
        paymentMethod: ph.payment_method,
        billPeriod: ph.billPeriod,
        reference: ph.payment_reference,
      }));
    },
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
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
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your payment history and transactions</CardDescription>
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

  const totalPaid = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
  const totalTransactions = transactions?.length || 0;

  return (
    <Card>
      {/* Updated CardHeader */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            Recent Transactions
          </CardTitle>
          {/* Hide description on mobile */}
          <CardDescription className="hidden sm:block">
            Your payment history and transactions
          </CardDescription>
        </div>
        <Link href="/resident-dashboard/payment-history" > 
        <Button variant="outline" size="sm">
          View All
        </Button>
        </Link>
      </CardHeader>

      <CardContent>
        {/* Horizontal scroll wrapper */}
        <div className="overflow-x-auto">
          <div className="min-w-[720px] space-y-4">
            {transactions?.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors min-w-[700px]"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium truncate ${getTypeColor(transaction.type)}`}>
                        {(transaction?.type || 'Water Bill Payment')
                          .toLowerCase()
                          .split(' ')
                          .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
                          .join(' ')}
                      </p>
                      <p className="text-xs text-gray-500 ml-2">{transaction.id}</p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {transaction.billPeriod &&
                        `Billing Period: ${new Date(transaction.billPeriod).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}`}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                      <span>{transaction.paymentMethod}</span>
                      <span className="text-gray-400">•</span>
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      <span className="text-gray-400">•</span>
                      <span>Ref: {transaction.reference}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 ml-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₱{transaction.amount.toFixed(2)}</p>
                    <Badge className={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="sm" className="p-2">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 font-medium">Total Paid This Year</p>
            <p className="text-xl font-bold text-green-900">₱{totalPaid.toFixed(2)}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Transactions This Year</p>
            <p className="text-xl font-bold text-blue-900">{totalTransactions}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full">
          Download Payment History
        </Button>
      </CardContent>
    </Card>
  );
}
