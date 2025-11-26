import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { CreditCard, Smartphone, Building, Wallet, CheckCircle, Clock, Barcode } from "lucide-react";
import { apiClient } from "../../lib/api";
import { useQuery } from "@tanstack/react-query";



export default function PayBillModal({ isOpen, onClose, selectedMeter }) {

  const [formData, setbillingData] = useState({
    paymentMethod: "",
    paymentType: "", // 'full' or 'partial'
    partialAmount: "",
    referenceNumber: "",
    phoneNumber: "",
    email: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Bill Details, 1.5: Payment Type, 2: Payment Method, 3: Confirmation

  // Reset form and step when modal opens or meter changes
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setbillingData({
        paymentMethod: "",
        paymentType: "",
        partialAmount: "",
        referenceNumber: "",
        phoneNumber: "",
        email: ""
      });
    }
  }, [isOpen, selectedMeter?.connection_id]);

  const {data: billingData, isLoadingBilling, error: queryError, refetch} = useQuery({
        queryKey: ["Amount-to-pay", selectedMeter?.connection_id || selectedMeter?.meter_no],
        queryFn: async () => {
            try {
              const res = await apiClient.getCurrentBill()
              const data = res.data

              console.log("🔍 Modal API response:", res);
              console.log("🔍 Modal data array:", data);
              console.log("🔍 Selected meter prop:", selectedMeter);

              if(!data || data.length === 0){
                console.warn("⚠️ No data in API response");
                return null
              }

              // Find the bill matching the selectedMeter
              let billToPay;
              if (selectedMeter) {
                billToPay = data.find(bill => bill.meter_no === selectedMeter.meter_no);
                console.log("🔍 Found bill for selected meter:", billToPay);
              }

              // Fallback to last bill if no meter selected
              if (!billToPay) {
                billToPay = data[data.length - 1];
                console.log("🔍 Using fallback - last bill:", billToPay);
              }

              console.log("🔍 Bill to pay object:", billToPay);
              console.log("🔍 Bill _id:", billToPay._id);
              console.log("🔍 Bill full_name:", billToPay.full_name);
              console.log("🔍 Bill due_date:", billToPay.due_date);

              const result = {
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
                    originalAmount: billToPay.total_amount,
                    amountPaid: billToPay.amount_paid || 0,
                    remainingBalance: billToPay.balance || (billToPay.total_amount - (billToPay.amount_paid || 0)),
                }
              };
              console.log("✅ Modal query result:", result);
              return result;
            } catch (error) {
              console.error("❌ Error in modal query:", error);
              console.error("❌ Error details:", error.message);
              return null;
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
    },
     {
      id: "orph",
      name: "QRPH",
      icon: Barcode,
      color: "text-green-600",
      description: "Pay using QRPH digital wallet via PayMongo"
    }
    
  ];

 const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  try {
    console.log("💳 Form submission - billingData:", billingData);
    console.log("💳 Form submission - billDetails:", billingData?.billDetails);

    if (!billingData?.billDetails?.id) {
      throw new Error("No bill found. Please refresh.");
    }

    // Calculate the amount to pay based on payment type
    const amountToPay = formData.paymentType === 'partial'
      ? parseFloat(formData.partialAmount)
      : billingData.billDetails.remainingBalance;

    const paymentData = {
      bill_id: billingData.billDetails.id,   // ✅ real bill id from backend
      payment_method: formData.paymentMethod,
      amount: amountToPay
    };

    console.log('📦 Payment data being sent:', paymentData);

    const result = await apiClient.createPayment(paymentData);
    console.log('✅ Payment created successfully:', result);

    if (result.checkoutUrl) {
      localStorage.setItem('pending_payment', JSON.stringify({
      payment_intent_id: result.payment_intent_id,
      amount: amountToPay,
      method: formData.paymentMethod,
      accountName: billingData.billDetails.accountName,
      paymentType: formData.paymentType
}));

      window.location.href = result.checkoutUrl;
      setStep(3);
    } else {
      toast.success("Payment Successful", {
        description: `Payment of ₱${paymentData.amount.toFixed(2)} processed successfully`
      });
      setStep(3);
    }

  } catch (error) {
    console.error('Payment error:', error);
    toast.error("Payment Failed", {
      description: error.message || "Payment processing failed. Please try again."
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
      paymentMethod: "",
      paymentType: "",
      partialAmount: "",
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
          <div className="space-y-2">
            {billingData?.billDetails?.amountPaid > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Original Total:</span>
                  <span>
                    ₱{billingData?.billDetails?.originalAmount?.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Already Paid:</span>
                  <span className="text-green-600">
                    -₱{billingData?.billDetails?.amountPaid?.toFixed(2)}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Remaining Balance Due:</span>
              <span className="text-blue-600">
                ₱{billingData?.billDetails?.remainingBalance !== undefined
                  ? billingData.billDetails.remainingBalance.toFixed(2)
                  : "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="flex justify-end space-x-3">
      <Button variant="outline" onClick={handleClose}>
        Cancel
      </Button>
      <Button
        onClick={() => setStep(1.5)}
        data-testid="button-proceed-payment"
      >
        Proceed to Payment
      </Button>
    </div>
  </div>
);


// step 1.5 - Payment Type Selection
const renderPaymentType = () => (
  <div className="space-y-6">
    {/* Bill Summary */}
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining Balance Due:</span>
            <span className="font-semibold text-gray-900">
              ₱{billingData?.billDetails?.remainingBalance?.toFixed(2)}
            </span>
          </div>
          {billingData?.billDetails?.amountPaid > 0 && (
            <div className="flex justify-between text-xs text-gray-600">
              <span>Original Total: ₱{billingData?.billDetails?.originalAmount?.toFixed(2)}</span>
              <span>Already Paid: ₱{billingData?.billDetails?.amountPaid?.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Account Name:</span>
            <span className="font-medium">{billingData?.billDetails?.accountName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Meter Number:</span>
            <span className="font-medium">{billingData?.billDetails?.meter_no}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Payment Type Options */}
    <div>
      <Label className="text-base font-medium mb-3 block">Choose Payment Type</Label>
      <div className="grid grid-cols-1 gap-3">
        {/* Full Payment Option */}
        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.paymentType === 'full'
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => {
            handleChange("paymentType")('full');
            handleChange("partialAmount")("");
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                <p className="font-semibold text-gray-900">Full Payment</p>
              </div>
              <p className="text-sm text-gray-600 mt-1">Pay the remaining balance in full</p>
              <p className="text-lg font-bold text-blue-600 mt-2">
                ₱{billingData?.billDetails?.remainingBalance?.toFixed(2)}
              </p>
            </div>
            {formData.paymentType === 'full' && (
              <CheckCircle className="h-5 w-5 text-blue-600" />
            )}
          </div>
        </div>

        {/* Partial Payment Option */}
        <div
          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
            formData.paymentType === 'partial'
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => handleChange("paymentType")('partial')}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-orange-600" />
                <p className="font-semibold text-gray-900">Partial Payment</p>
              </div>
              <p className="text-sm text-gray-600 mt-1">Pay any amount you want</p>

              {formData.paymentType === 'partial' && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="partialAmount" className="text-sm">Enter Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                    <Input
                      id="partialAmount"
                      type="number"
                      step="0.01"
                      min="1"
                      max={billingData?.billDetails?.remainingBalance}
                      value={formData.partialAmount}
                      onChange={(e) => handleChange("partialAmount")(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Maximum: ₱{billingData?.billDetails?.remainingBalance?.toFixed(2)}
                  </p>
                  {formData.partialAmount && parseFloat(formData.partialAmount) > 0 && (
                    <p className="text-sm font-medium text-orange-600">
                      Remaining balance after payment: ₱
                      {(billingData?.billDetails?.remainingBalance - parseFloat(formData.partialAmount)).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
            {formData.paymentType === 'partial' && (
              <CheckCircle className="h-5 w-5 text-orange-600" />
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Navigation Buttons */}
    <div className="flex justify-between space-x-3">
      <Button variant="outline" onClick={() => setStep(1)}>
        Back to Bill Details
      </Button>
      <Button
        onClick={() => setStep(2)}
        disabled={
          !formData.paymentType ||
          (formData.paymentType === 'partial' && (!formData.partialAmount || parseFloat(formData.partialAmount) <= 0 || parseFloat(formData.partialAmount) > billingData?.billDetails?.totalAmount))
        }
      >
        Continue to Payment Method
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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payment Type:</span>
              <span className="font-medium capitalize">{formData.paymentType} Payment</span>
            </div>
            {formData.paymentType === 'partial' && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Current Balance:</span>
                  <span>₱{billingData?.billDetails?.remainingBalance?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Remaining After Payment:</span>
                  <span className="text-orange-600 font-medium">
                    ₱{(billingData?.billDetails?.remainingBalance ? (billingData.billDetails.remainingBalance - parseFloat(formData.partialAmount)) : 0).toFixed(2)}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-lg font-medium">Amount to Pay:</span>
              <span className="text-2xl font-bold text-blue-600">
                ₱{formData.paymentType === 'partial'
                  ? parseFloat(formData.partialAmount).toFixed(2)
                  : billingData.billDetails.remainingBalance.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between space-x-3">
        <Button variant="outline" onClick={() => setStep(1.5)}>
          Back to Payment Type
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!formData.paymentMethod || isLoading || !billingData?.billDetails?.id}
          data-testid="button-pay-now"
        >
          {isLoading ? "Processing..." : !billingData?.billDetails?.id ? "Loading..." : `Pay ₱${formData.paymentType === 'partial'
            ? parseFloat(formData.partialAmount).toFixed(2)
            : billingData.billDetails.remainingBalance.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );


  // step 3
  const renderConfirmation = () => {
    const pendingPayment = localStorage.getItem('pending_payment');
    const isPending = !!pendingPayment;
    const paymentInfo = pendingPayment ? JSON.parse(pendingPayment) : null;

    // Calculate the amount paid
    const amountPaid = formData.paymentType === 'partial'
      ? parseFloat(formData.partialAmount)
      : billingData.billDetails.totalAmount;

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
                    ? paymentInfo.payment_intent_id?.slice(-8) || 'Processing...'
                    : `PAY-2024-${Date.now().toString().slice(-6)}`
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Account Name:</span>
                <span className="font-medium">{billingData.billDetails.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Type:</span>
                <span className="font-medium capitalize">{formData.paymentType} Payment</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-medium text-blue-600">₱{amountPaid.toFixed(2)}</span>
              </div>
              {formData.paymentType === 'partial' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Balance:</span>
                    <span className="font-medium">₱{billingData.billDetails.remainingBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Remaining Balance After Payment:</span>
                    <span className="font-medium text-orange-600">
                      ₱{(billingData.billDetails.remainingBalance - amountPaid).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
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
            {step === 1.5 && "Payment Type"}
            {step === 2 && "Payment Method"}
            {step === 3 && "Payment Confirmation"}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Review your bill details before proceeding to payment"}
            {step === 1.5 && "Choose between full payment or partial payment"}
            {step === 2 && "Choose your preferred payment method and complete the transaction"}
            {step === 3 && "Payment completed successfully"}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {step === 1 && renderBillDetails()}
          {step === 1.5 && renderPaymentType()}
          {step === 2 && renderPaymentMethod()}
          {step === 3 && renderConfirmation()}
        </div>
      </DialogContent>
    </Dialog>
  );
}