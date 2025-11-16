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
      const res = await apiClient.getCurrentBill(); // this calls your getBilling controller
      const bills = res.data;
      if (!bills || bills.length === 0) return null; 
      const currentBill = bills[bills.length - 1]; 
      
      const dueDate = new Date(currentBill.due_date);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      
      return {
        amount: currentBill.balance || currentBill.total_amount,
        totalAmount: currentBill.total_amount,
        amountPaid: currentBill.amount_paid || 0,
        dueDate: currentBill.due_date,
        status: currentBill.payment_status || currentBill.status || "unpaid",
        connection_status: currentBill.connection_status || "active",
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
      <Card className="bg-white/70 backdrop-blur-md border border-white/30 shadow-sm">
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
      <Card className="bg-white/70 backdrop-blur-md border border-white/30 shadow-sm">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No current bill</p>
          <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
        </CardContent>
      </Card>
    );
  }

  const isPaid = billingData.status === "paid";
  const isPartial = billingData.status === "partial";
  const isOverdue = billingData.daysUntilDue < 0;
  const isDueSoon = billingData.daysUntilDue <= 3 && billingData.daysUntilDue >= 0;
  const isForDisconnection = billingData.connection_status === "for_disconnection";

  return (
    <Card className="bg-white/70 backdrop-blur-md border border-white/30 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 border-b border-white/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            Current Water Bill
          </CardTitle>
          <Badge className={
            isPaid ? 'bg-green-100 text-green-700 border border-green-200' :
            isPartial ? 'bg-orange-100 text-orange-700 border border-orange-200' :
            isForDisconnection ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
            isOverdue ? 'bg-red-100 text-red-700 border border-red-200' :
            isDueSoon ? 'bg-orange-100 text-orange-700 border border-orange-200' :
            'bg-blue-100 text-blue-700 border border-blue-200'
          }>
            {isPaid ? 'Paid' : isPartial ? 'Partial' : isForDisconnection ? 'For Disconnection' : isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Pending'}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mt-2">Billing Period: {billingData.billingPeriod}</p>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">{isPartial ? 'Remaining Balance' : 'Amount Due'}</p>
          <p className={`text-4xl font-bold ${
            isPaid ? 'text-green-600' : isPartial ? 'text-orange-600' : isForDisconnection ? 'text-yellow-600' : isOverdue ? 'text-red-600' : 'text-blue-600'
          }`}>
            ₱{billingData.amount.toFixed(2)}
          </p>
          {isPartial && billingData.amountPaid > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-300 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Original Total:</span>
                <span className="font-medium">₱{billingData.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Amount Paid:</span>
                <span className="font-medium">-₱{billingData.amountPaid.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/70 backdrop-blur-md rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              Consumption
            </p>
            <p className="text-lg font-bold text-gray-900">{billingData.consumption} m³</p>
          </div>
          <div className="bg-white/70 backdrop-blur-md rounded-lg p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Due Date
            </p>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-900">
                {new Date(billingData.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {!isPaid && isOverdue && !isForDisconnection && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Payment Overdue!</p>
              <p className="text-xs text-red-700 mt-1">
                This bill was due {Math.abs(billingData.daysUntilDue)} days ago. Please pay immediately to avoid service interruption.
              </p>
            </div>
          </div>
        )}

        {!isPaid && isDueSoon && !isForDisconnection && (
          <div className="flex items-start gap-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-900">Due in {billingData.daysUntilDue} {billingData.daysUntilDue === 1 ? 'day' : 'days'}</p>
              <p className="text-xs text-orange-700 mt-1">Don't forget to pay before the due date!</p>
            </div>
          </div>
        )}

        {isForDisconnection && (
          <div className="flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Account Scheduled for Disconnection</p>
              <p className="text-xs text-yellow-700 mt-1">
                Please visit the barangay hall office to settle your account and restore service.
              </p>
            </div>
          </div>
        )}

        <Button 
          className={`w-full ${
            isPaid || isForDisconnection
              ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
          } text-white font-semibold shadow-sm`}
          size="lg"
          onClick={() => !isPaid && !isForDisconnection && window.dispatchEvent(new Event("openPayBillModal"))}
          disabled={isPaid || isForDisconnection}
        >
          {isPaid ? (
            <>
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Payment Confirmed
            </>
          ) : isForDisconnection ? (
            <>
              <AlertCircle className="h-5 w-5 mr-2" />
              Payment Disabled - Scheduled for Disconnection
            </>
          ) : (
            <>
              <CreditCard className="h-5 w-5 mr-2" />
              Pay ₱{billingData.amount.toFixed(2)} Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Previous Reading: <span className="font-medium text-gray-700">{billingData.previousReading} m³</span> → Current: <span className="font-medium text-gray-700">{billingData.presentReading} m³</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
