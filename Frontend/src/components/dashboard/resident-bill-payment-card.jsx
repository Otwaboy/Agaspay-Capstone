import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CreditCard, Calendar, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { apiClient } from "../../lib/api";

export default function ResidentBillPaymentCard() {
  const { data: billingData, isLoading } = useQuery({
    queryKey: ["resident-current-bill"],
    queryFn: async () => {
      const res = await apiClient.getCurrentBill();
      const bills = res.data;
      if (!bills || bills.length === 0) return null;
      const currentBill = bills[bills.length - 1];
      
      const dueDate = new Date(currentBill.due_date);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      return {
        amount: currentBill.total_amount,
        dueDate: currentBill.due_date,
        status: currentBill.payment_status || currentBill.status || "unpaid",
        consumption: currentBill.calculated,
        presentReading: currentBill.present_reading,
        previousReading: currentBill.previous_reading || 0,
        daysUntilDue,
        billingPeriod: new Date(currentBill.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      };
    },
  });

  if (isLoading) {
    return (
      <Card className="border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!billingData) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No current bill</p>
          <p className="text-sm text-gray-400 mt-1">You're all caught up!</p>
        </CardContent>
      </Card>
    );
  }

  const isPaid = billingData.status === "paid";
  const isOverdue = billingData.daysUntilDue < 0;
  const isDueSoon = billingData.daysUntilDue <= 3 && billingData.daysUntilDue >= 0;

  return (
    <Card className={`border-2 ${isPaid ? 'border-green-200 bg-green-50' : isOverdue ? 'border-red-200 bg-red-50' : isDueSoon ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className={`h-5 w-5 ${isPaid ? 'text-green-600' : isOverdue ? 'text-red-600' : 'text-blue-600'}`} />
            Current Water Bill
          </CardTitle>
          <Badge className={
            isPaid ? 'bg-green-600 text-white' : 
            isOverdue ? 'bg-red-600 text-white' : 
            isDueSoon ? 'bg-yellow-600 text-white' : 
            'bg-blue-600 text-white'
          }>
            {isPaid ? 'Paid' : isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Pending'}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-1">Billing Period: {billingData.billingPeriod}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Amount Due</p>
          <p className={`text-4xl font-bold ${isPaid ? 'text-green-600' : isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
            ₱{billingData.amount.toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Consumption</p>
            <p className="text-lg font-bold text-cyan-600">{billingData.consumption} m³</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">Due Date</p>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-700">
                {new Date(billingData.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {!isPaid && isOverdue && (
          <div className="flex items-start gap-2 p-3 bg-red-100 border border-red-300 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Payment Overdue!</p>
              <p className="text-xs text-red-600 mt-1">
                This bill was due {Math.abs(billingData.daysUntilDue)} days ago. Please pay immediately to avoid service interruption.
              </p>
            </div>
          </div>
        )}

        {!isPaid && isDueSoon && (
          <div className="flex items-start gap-2 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Due in {billingData.daysUntilDue} {billingData.daysUntilDue === 1 ? 'day' : 'days'}</p>
              <p className="text-xs text-yellow-600 mt-1">Don't forget to pay before the due date!</p>
            </div>
          </div>
        )}

        <Button 
          className={`w-full ${isPaid ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'} text-white font-semibold`}
          size="lg"
          onClick={() => !isPaid && window.dispatchEvent(new Event("openPayBillModal"))}
          disabled={isPaid}
        >
          {isPaid ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Payment Confirmed
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Pay ₱{billingData.amount.toFixed(2)} Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Previous Reading: {billingData.previousReading} m³ → Current: {billingData.presentReading} m³
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
