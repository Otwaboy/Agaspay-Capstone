import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { CreditCard, Clock, AlertTriangle, CheckCircle } from "lucide-react";

export default function ResidentBillingSummary() {
  const { data: billingData, isLoading } = useQuery({
    queryKey: ['/api/resident/billing'],
    initialData: {
      currentBill: {
        amount: 450.00,
        dueDate: "2024-08-25",
        status: "pending",
        period: "July 2024"
      },
      previousBill: {
        amount: 420.00,
        paidDate: "2024-07-22",
        status: "paid",
        period: "June 2024"
      },
      outstandingBalance: 0,
      totalDue: 450.00,
      paymentDue: 3,
      averageMonthlyBill: 435.00
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-40" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBillStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue(billingData.currentBill.dueDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-green-600" />
          Billing Summary
        </CardTitle>
        <CardDescription>Current and recent billing information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Bill */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-blue-900">Current Bill</h4>
              <Badge className={getBillStatusColor(billingData.currentBill.status)}>
                {billingData.currentBill.status.toUpperCase()}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Billing Period:</span>
                <span className="text-sm font-medium text-blue-900">{billingData.currentBill.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Amount:</span>
                <span className="text-lg font-bold text-blue-900">₱{billingData.currentBill.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-blue-700">Due Date:</span>
                <span className="text-sm font-medium text-blue-900">
                  {new Date(billingData.currentBill.dueDate).toLocaleDateString()}
                </span>
              </div>
              {daysUntilDue > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">Days Until Due:</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-orange-500" />
                    <span className={`text-sm font-medium ${daysUntilDue <= 3 ? 'text-orange-600' : 'text-blue-900'}`}>
                      {daysUntilDue} days
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Previous Bill */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Previous Bill</h4>
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <Badge className={getBillStatusColor(billingData.previousBill.status)}>
                  PAID
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Billing Period:</span>
                <span className="text-sm text-gray-900">{billingData.previousBill.period}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount Paid:</span>
                <span className="text-sm font-medium text-gray-900">₱{billingData.previousBill.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Paid Date:</span>
                <span className="text-sm text-gray-900">
                  {new Date(billingData.previousBill.paidDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Account Summary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
              <span className="text-sm font-medium text-gray-900">Total Amount Due</span>
              <span className="text-lg font-bold text-gray-900">₱{billingData.totalDue.toFixed(2)}</span>
            </div>
            
            {billingData.outstandingBalance > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Outstanding Balance</span>
                </div>
                <span className="text-sm font-bold text-red-900">₱{billingData.outstandingBalance.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Average Monthly Bill</span>
              <span className="text-sm font-medium text-gray-900">₱{billingData.averageMonthlyBill.toFixed(2)}</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full"
            onClick={() => window.dispatchEvent(new Event("openPayBillModal"))}
            disabled={billingData.currentBill.status === 'paid'}
            data-testid="button-pay-now"
          >
            {billingData.currentBill.status === 'paid' ? 'Bill Already Paid' : `Pay ₱${billingData.totalDue.toFixed(2)} Now`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}