import React from "react";
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

export default function TreasurerRecentTransactions() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ["/api/dashboard/transactions"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const defaultTransactions = [
    {
      id: "TXN-001",
      residentName: "Juan Dela Cruz",
      amount: 450.00,
      type: "Monthly Bill",
      status: "completed",
      date: "2024-01-15T10:30:00Z",
      method: "GCash"
    },
    {
      id: "TXN-002", 
      residentName: "Maria Santos",
      amount: 320.00,
      type: "Monthly Bill",
      status: "completed",
      date: "2024-01-15T09:15:00Z",
      method: "Cash"
    },
    {
      id: "TXN-003",
      residentName: "Pedro Reyes",
      amount: 890.00,
      type: "Connection Fee",
      status: "pending",
      date: "2024-01-15T08:45:00Z",
      method: "Bank Transfer"
    },
    {
      id: "TXN-004",
      residentName: "Ana Garcia",
      amount: 275.00,
      type: "Monthly Bill", 
      status: "completed",
      date: "2024-01-14T16:20:00Z",
      method: "PayMaya"
    },
    {
      id: "TXN-005",
      residentName: "Roberto Luna",
      amount: 520.00,
      type: "Penalty Fee",
      status: "failed",
      date: "2024-01-14T14:10:00Z",
      method: "GCash"
    }
  ];

  const displayTransactions = transactions && Array.isArray(transactions) && transactions.length > 0 ? transactions : defaultTransactions;

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
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
      case "failed":
        return {
          label: "Failed",
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
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
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
              {(displayTransactions || []).map((transaction) => (
                <tr key={transaction.id} data-testid={`transaction-row-${transaction.id}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-600">
                          {transaction.residentName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.residentName}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {transaction.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-900">
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900">
                      ₱{transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {transaction.method}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {(() => {
                      const statusConfig = getStatusConfig(transaction.status);
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
                      {formatDate(transaction.date)}
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
            Showing {displayTransactions?.length || 0} of {displayTransactions?.length || 0} transactions
          </p>
          <Button variant="outline" size="sm">
            View all transactions →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}