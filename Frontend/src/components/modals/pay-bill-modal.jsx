import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useToast } from "../../hooks/use-toast";
import { CreditCard, Smartphone, Building, Wallet, CheckCircle, Clock } from "lucide-react";
import { apiClient } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";



export default function PayBillModal({ isOpen, onClose }) {

  const [formData, setbillingData] = useState({
    paymentMethod: "",
    referenceNumber: "",
    phoneNumber: "",
    email: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Bill Details, 2: Payment Method, 3: Confirmation
  const { toast } = useToast();
  
  const {data: billingData, isLoadingBilling} = useQuery({
        queryKey:['Amount-to-pay'],
        queryFn: async () => {
            const res = await apiClient.getCurrentBill()
            const data = res.data

             if(!data || data.length === 0){
             return null
              }
            const billToPay = data[data.length - 1]

            return{
              billDetails: {
                  id: billToPay.bill_id,
                  accountName: billToPay.full_name,
                  billPeriod: billToPay.due_date,
                  meter_no: billToPay.meter_no,
                  dueDate: billToPay.due_date,
                  currentReading: billToPay.present_reading,
                  previousReading: billToPay.previous_reading,
                  consumption: billToPay.calculated,
                  totalAmount: billToPay.total_amount,
                  
              }
            }
        }
  })


  
   if (isLoadingBilling) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Skeleton className="h-5 w-5 mr-2" />
              <Skeleton className="h-6 w-40" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-60" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

  // const billDetails = {
  //   billPeriod: "July 2024",
  //   dueDate: "2024-08-25",
  //   currentReading: 1245,
  //   previousReading: 1230,
  //   consumption: 15,
  //   waterCharge: 375.00,
  //   sewerageCharge: 50.00,
  //   environmentalFee: 25.00,
  //   totalAmount: 450.00
  // };

  const paymentMethods = [
    {
      id: "gcash",
      name: "GCash",
      icon: Smartphone,
      color: "text-blue-600",
      description: "Pay using your GCash wallet via PayMongo"
    },
    {
      id: "paymaya",
      name: "PayMaya",
      icon: CreditCard,
      color: "text-green-600",
      description: "Pay using PayMaya digital wallet via PayMongo"
    }
    
  ];

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    if (!billingData?.billDetails?.id) { 
      throw new Error("No bill found. Please refresh.");
    }

    const paymentData = {
      bill_id: billingData.billDetails.id,   // ✅ real bill id from backend
      payment_method: formData.paymentMethod,
      amount: billingData.billDetails.totalAmount
    };

    console.log('📦 Payment data being sent:', paymentData);

    const result = await apiClient.createPayment(paymentData);
    console.log('✅ Payment created successfully:', result);

    if (result.checkoutUrl) {
        localStorage.setItem('pending_payment', JSON.stringify({
        paymentId: result.paymentId,
        amount: billingData.amount,
        method: formData.paymentMethod,
        accountNumber: billingData.accountNumber
      }));

      window.location.href = result.checkoutUrl;
      setStep(3);
    } else {
      toast({
        title: "Payment Successful",
        description: `Payment of ₱${paymentData.amount.toFixed(2)} processed successfully`,
        variant: "default"
      });
      setStep(3);
    }

  } catch (error) {
    console.error('Payment error:', error);
    toast({
      title: "Payment Failed",
      description: error.message || "Payment processing failed. Please try again.",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
};



  const handleChange = (field) => (value) => {
    setbillingData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setStep(1);
    setbillingData({
      accountNumber: "WS-2024-001247",
      amount: 450.00,
      paymentMethod: "",
      referenceNumber: "",
      phoneNumber: "",
      email: ""
    });
    onClose();
  };



  // step 1
  const renderBillDetails = () => (
  <div className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Current Bill Details</CardTitle>
        <CardDescription>
          Billing period: {billingData?.billDetails?.billPeriod ?? "Loading..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Account Name:</span>
            <span className="font-medium">
              {billingData?.billDetails?.accountName ?? "Loading..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Meter Number:</span>
            <span className="font-medium">
              {billingData?.billDetails?.meter_no ?? "Loading..."}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Due Date:</span>
            <span className="font-medium">
              {billingData?.billDetails?.dueDate
                ? new Date(billingData.billDetails.dueDate).toLocaleDateString()
                : "Loading..."}
            </span>
          </div>
          <hr className="my-3" />
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Previous Reading:</span>
              <span>
                {billingData?.billDetails?.previousReading !== undefined
                  ? `${billingData.billDetails.previousReading} cubic meters`
                  : "Loading..."}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Present Reading:</span>
              <span>
                {billingData?.billDetails?.currentReading !== undefined
                  ? `${billingData.billDetails.currentReading} cubic meters`
                  : "Loading..."}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Consumption:</span>
              <span>
                {billingData?.billDetails?.consumption !== undefined
                  ? `${billingData.billDetails.consumption} cubic meters`
                  : "Loading..."}
              </span>
            </div>
          </div>
          <hr className="my-3" />
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount Due:</span>
            <span>
              ₱{billingData?.billDetails?.totalAmount !== undefined
                ? billingData.billDetails.totalAmount.toFixed(2)
                : "Loading..."}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="flex justify-end space-x-3">
      <Button variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      <Button
        onClick={() => setStep(2)}
        data-testid="button-proceed-payment"
      >
        Proceed to Payment
      </Button>
    </div>
  </div>
);


// step 2
  const renderPaymentMethod = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Select Payment Method</Label>
        <div className="grid grid-cols-1 gap-3 mt-3">
          {paymentMethods.map((method) => {
            const IconComponent = method.icon;
            return (
              <div
                key={method.id}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === method.id
                    ? "border-blue-500 bg-blue-50"  
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleChange("paymentMethod")(method.id)}
              >
                <div className="flex items-center space-x-3">
                  <IconComponent className={`h-6 w-6 ${method.color}`} />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{method.name}</p>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                  {billingData.paymentMethod === method.id && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {(formData.paymentMethod === "gcash" || formData.paymentMethod === "paymaya") && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">PayMongo Secure Payment</h4>
            <p className="text-sm text-blue-700">
              You will be redirected to PayMongo's secure payment page to complete your {formData.paymentMethod.toUpperCase()} transaction.
            </p>
          </div>
          {/* <div className="space-y-2">
            <Label htmlFor="phoneNumber">Mobile Number (Optional)</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber")(e.target.value)}
              placeholder="09123456789"
              data-testid="input-phone-number"
            />
            <p className="text-xs text-gray-500">
              This will be used for payment confirmation SMS
            </p>
          </div> */}
        </div>
      )}

      {/* <div className="space-y-2">
        <Label htmlFor="email">Email Address (for receipt)</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email")(e.target.value)}
          placeholder="your.email@example.com"
          required
          data-testid="input-email"
        />
      </div> */}

      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Amount to Pay:</span>
            <span className="text-2xl font-bold text-blue-600">₱{billingData.billDetails.totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between space-x-3">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back to Bill Details
        </Button>

        <Button 
          onClick={handleSubmit}
          disabled={!formData.paymentMethod|| isLoading}
          data-testid="button-pay-now"
        >
          {isLoading ? "Processing..." : `Pay ₱${billingData.billDetails.totalAmount.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );


  // step 3
  const renderConfirmation = () => {
    const pendingPayment = localStorage.getItem('pending_payment');
    const isPending = !!pendingPayment;
    
    return (
      <div className="text-center space-y-6">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
          isPending ? 'bg-blue-100' : 'bg-green-100'
        }`}>
          {isPending ? (
            <Clock className="h-8 w-8 text-blue-600" />
          ) : (
            <CheckCircle className="h-8 w-8 text-green-600" />
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {isPending ? 'Payment Processing' : 'Payment Successful!'}
          </h3>
          <p className="text-gray-600">
            {isPending 
              ? 'Your payment is being processed through PayMongo. You will receive a confirmation once completed.'
              : 'Your payment has been processed successfully.'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {isPending ? 'Payment Details' : 'Payment Receipt'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Reference Number:</span>
                <span className="font-medium">
                  {pendingPayment 
                    ? JSON.parse(pendingPayment).paymentId?.slice(-8) || 'Processing...'
                    : `PAY-2024-${Date.now().toString().slice(-6)}`
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-medium">{billingData.billDetails.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₱{billingData.billDetails.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">
                  {paymentMethods.find(m => m.id === formData.paymentMethod)?.name} (PayMongo)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${isPending ? 'text-blue-600' : 'text-green-600'}`}>
                  {isPending ? 'Processing' : 'Completed'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {isPending && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-2">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-sm text-blue-600 space-y-1 text-left">
              <li>• Complete your payment in the PayMongo window</li>
              <li>• You'll receive an SMS/email confirmation</li>
              <li>• Your bill status will update automatically</li>
              <li>• Check your transaction history for updates</li>
            </ul>
          </div>
        )}

        <div className="space-y-3">
          {!isPending && (
            <Button variant="outline" className="w-full">
              Download Receipt
            </Button>
          )}
          <Button onClick={handleClose} className="w-full" data-testid="button-done">
            {isPending ? 'Continue' : 'Done'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Bill Payment"}
            {step === 2 && "Payment Method"}
            {step === 3 && "Payment Confirmation"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Review your bill details before proceeding to payment"}
            {step === 2 && "Choose your preferred payment method and complete the transaction"}
            {step === 3 && "Payment completed successfully"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4">
          {step === 1 && renderBillDetails()}
          {step === 2 && renderPaymentMethod()}
          {step === 3 && renderConfirmation()}
        </div>
      </DialogContent>
    </Dialog>
  );
}