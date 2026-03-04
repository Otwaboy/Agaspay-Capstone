import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import {
  Eye,
  Download,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import apiClient from "../../lib/api";
import { Link } from "wouter";

export default function TreasurerRecentTransactions() {
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 5;


  const { data: transaction } = useQuery({
    queryKey: ["/api/dashboard/transactions"],
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: () => apiClient.getRecentPayment(), 
  });

const recentPayment = transaction?.data;
  console.log('sheiitis', recentPayment);

const displayTransactions = recentPayment && Array.isArray(recentPayment) && recentPayment.length > 0 ? recentPayment : [];
console.log('display transaction', displayTransactions);

  // Pagination logic
  const totalPages = Math.ceil(displayTransactions.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const paginatedTransactions = displayTransactions.slice(startIndex, endIndex);

  // Reset to page 1 when data changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const getStatusConfig = (status) => {
    switch (status) {

      case "confirmed":
        return {
          label: "Confirmed",
          variant: "default",
          className: "bg-green-100 text-green-800 hover:bg-green-100",
          icon: CheckCircle
        };
      case "pending": 
        return {
          label: "Pending",
          variant: "secondary",
          className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
          icon: Clock
        };
      case "partially_paid":
        return {
          label: "Partial",
          variant: "destructive",
          className: "bg-red-100 text-red-800 hover:bg-red-100",
          icon: XCircle
        };
      case "fully_paid":
        return {
          label: "Full",
          variant: "destructive",
          className: "bg-red-100 text-red-800 hover:bg-red-100",
          icon: XCircle
        };
      default:
        return {
          label: "Unknown",
          variant: "outline",
          className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
          icon: Clock
        };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // if (isLoading) {
  //   return (
  //     <Card>
  //       <CardHeader>
  //         <CardTitle>Recent Transactions</CardTitle>
  //         <CardDescription>Latest payment transactions</CardDescription>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="space-y-4">
  //           {[1, 2, 3, 4].map((i) => (
  //             <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
  //               <Skeleton className="h-8 w-8 rounded-full" />
  //               <div className="flex-1 space-y-2">
  //                 <Skeleton className="h-4 w-1/3" />
  //                 <Skeleton className="h-3 w-1/4" />
  //               </div>
  //               <Skeleton className="h-4 w-16" />
  //               <Skeleton className="h-6 w-20" />
  //             </div>
  //           ))}
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest payment transactions and billing</CardDescription>
          </div>
          <Link href= "/treasurer-dashboard/revenue/payment-collection">
           <Button variant="outline" size="sm">
            View all transactions →
          </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resident
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(paginatedTransactions || []).map((transaction) => (
                <tr key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {transaction.residentFullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.residentFullName}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {transaction.id || 'wapa'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">
                      {transaction.payment_type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">
                      ₱{transaction.amount_paid.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {transaction.payment_method}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {(() => {
                      const statusConfig = getStatusConfig(transaction.payment_status);
                      const StatusIcon = statusConfig.icon;
                      return (
                        <Badge 
                          className={`${statusConfig.className} flex items-center w-fit`}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      );
                    })()}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {formatDate(transaction.payment_date)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      data-testid={`button-view-transaction-${transaction.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1} to {Math.min(endIndex, displayTransactions?.length || 0)} of {displayTransactions?.length || 0} transactions
          </p>

          {/* Pagination Controls */}
          {totalPages > 0 && (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    {pageNum}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}