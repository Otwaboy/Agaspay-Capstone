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

// PayMongo test environment function
const createPayMongoTestCheckout = async (paymentData, formData) => {
  try {
    // PayMongo public test key (safe to use in frontend for testing)
    const PAYMONGO_PUBLIC_KEY = 'pk_test_2GpBbJLfHbFdLDKO4dWddPhc';
    
    console.log('Creating PayMongo test checkout session...');
    
    // Step 1: Create Payment Intent using PayMongo test API
    const paymentIntentResponse = await fetch('https://api.paymongo.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(PAYMONGO_PUBLIC_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: Math.round(paymentData.amount * 100), // Convert to cents
            currency: 'PHP',
            payment_method_allowed: ['gcash', 'paymaya'],
            capture_type: 'automatic',
            description: `AGASPAY Water Bill Payment - ${formData.accountNumber}`
          }
        }
      })
    });

    if (!paymentIntentResponse.ok) {
      throw new Error('Failed to create PayMongo payment intent');
    }

    const paymentIntentData = await paymentIntentResponse.json();
    const paymentIntentId = paymentIntentData.data.id;
    
    console.log('PayMongo Payment Intent created:', paymentIntentId);

    // Step 2: Create Checkout Session
    const checkoutResponse = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(PAYMONGO_PUBLIC_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          attributes: {
            line_items: [
              {
                name: `Water Bill Payment - ${formData.accountNumber}`,
                amount: Math.round(paymentData.amount * 100),
                currency: 'PHP',
                quantity: 1
              }
            ],
            payment_intent_id: paymentIntentId,
            payment_method_types: [paymentData.payment_method],
            success_url: `${window.location.origin}/payment/success?payment_intent_id=${paymentIntentId}&status=succeeded`,
            cancel_url: `${window.location.origin}/payment/cancel?payment_intent_id=${paymentIntentId}&status=failed`,
            description: 'AGASPAY Water Bill Payment'
          }
        }
      })
    });

    if (!checkoutResponse.ok) {
      throw new Error('Failed to create PayMongo checkout session');
    }

    const checkoutData = await checkoutResponse.json();
    const checkoutUrl = checkoutData.data.attributes.checkout_url;
    
    console.log('PayMongo Test Checkout URL created:', checkoutUrl);

    return {
      msg: "PayMongo test payment initialized",
      paymentId: 'test-payment-' + Date.now(),
      payment_intent_id: paymentIntentId,
      payment_method: paymentData.payment_method,
      payment_type: 'pending',
      checkoutUrl: checkoutUrl
    };

  } catch (error) {
    console.error('PayMongo test checkout error:', error);
    
    // Fallback to local demo if PayMongo API fails
    const baseUrl = window.location.origin;
    return {
      msg: "Local demo payment initialized",
      paymentId: 'demo-payment-' + Date.now(),
      payment_method: paymentData.payment_method,
      payment_type: 'pending',
      checkoutUrl: `${baseUrl}/payment/demo-checkout?amount=${paymentData.amount}&method=${paymentData.payment_method}&account=${formData.accountNumber}`
    };
  }
};




export default function PayBillModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    meterNumber: "MTR-000125",
    amount: 450.00,
    paymentMethod: "",
    referenceNumber: "",
    phoneNumber: "",
    email: ""
  });

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Bill Details, 2: Payment Method, 3: Confirmation
  const { toast } = useToast();

  const billDetails = {
    billPeriod: "July 2024",
    dueDate: "2024-08-25",
    currentReading: 1245,
    previousReading: 1230,
    consumption: 15,
    waterCharge: 375.00,
    sewerageCharge: 50.00,
    environmentalFee: 25.00,
    totalAmount: 450.00
  };

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
      // For demo purposes, create mock bill data since backend isn't available
      // In production, this would fetch from your MongoDB backend
      const billData = {
        _id: 'mock-bill-id-' + Date.now(),
        bill_id: 'BILL-2024-001247',
        total_amount: formData.amount,
        status: 'unpaid',
        billing_period: 'July 2024'
      };

      // Get real bill data using API client
      try {
        const response = await apiClient.getCurrentBill();
        console.log('✅ Bill response from API client:', response);
        
        if (response.billingDetails && response.billingDetails.length > 0) {
          const currentBill = response.billingDetails[0];
          billData._id = currentBill.connection_id;
          billData.total_amount = currentBill.total_amount;
          billData.full_name = currentBill.full_name;
          billData.purok_no = currentBill.purok_no;
          console.log('Real bill data loaded:', billData);
        }
      } catch (billError) {
        console.log('Using mock bill data - API client error:', billError.message);
      }

      // Prepare payment data for PayMongo (matching your backend controller)
      const paymentData = {
        bill_id: billData._id || billData.bill_id,
        payment_method: formData.paymentMethod,
        amount: formData.amount
      };

      // Use API client for PayMongo payment
      let result;
      try {
        console.log('🔄 Creating payment using API client');
        console.log('📦 Payment data being sent:', paymentData);
        console.log('🔑 Auth token:', localStorage.getItem('agaspay_token') ? 'Present' : 'Missing');
        
        result = await apiClient.createPayment(paymentData);
        console.log('✅ Payment created successfully:', result);
        
        // API client handles errors automatically, if we reach here, payment was successful
      } catch (backendError) {
        console.error('❌ API client error:', backendError);
        
        // Handle different types of backend errors using the API client's enhanced error handling
        if (backendError.message.includes('Failed to fetch') || backendError.message.includes('fetch')) {
          toast({
            title: "Backend Server Offline",
            description: "Your MongoDB backend server is not running on port 3000. Please start it first.",
            variant: "destructive"
          });
        } else if (backendError.message.includes('404') || backendError.message.includes('not found')) {
          toast({
            title: "Payment Route Missing", 
            description: "Backend is running but /api/v1/payment route is missing or not configured properly.",
            variant: "destructive"
          });
        } else if (backendError.message.includes('401') || backendError.message.includes('Unauthorized')) {
          toast({
            title: "Authentication Error",
            description: "JWT token is invalid or missing. Try logging in again.",
            variant: "destructive"
          });
        } else if (backendError.message.includes('403') || backendError.message.includes('Forbidden')) {
          toast({
            title: "Access Denied",
            description: "You don't have resident role permissions for payments.",
            variant: "destructive"
          });
        } else if (backendError.message.includes('500')) {
          toast({
            title: "Backend Server Error",
            description: "Internal server error. Check your PayMongo configuration and server logs.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Payment Error",
            description: backendError.message || "Payment processing failed. Please try again.",
            variant: "destructive"
          });
        }
        
        // Switch to demo mode when backend has issues
        const isRealPayMongoMode = false; // Use demo mode until backend is properly running
        
        if (isRealPayMongoMode) {
          throw new Error("MongoDB backend required for PayMongo payments");
        } else {
          // Use PayMongo's real demo/test API for realistic testing
          result = await createPayMongoTestCheckout(paymentData, formData);
          
          toast({
            title: "Demo Mode",
            description: "Using PayMongo test environment. MongoDB backend not running on port 3000.",
            variant: "default"
          });
        }
      }

      // Check if we got a checkout URL from PayMongo
      if (result.checkoutUrl) {
        // Store payment details for when user returns
        localStorage.setItem('pending_payment', JSON.stringify({
          paymentId: result.paymentId,
          amount: formData.amount,
          method: formData.paymentMethod,
          accountNumber: formData.accountNumber
        }));

        // Redirect to PayMongo checkout in the same window for better UX
        window.location.href = result.checkoutUrl;
        
        toast({
          title: "Redirecting to Payment",
          description: "You will be redirected to complete your payment with PayMongo",
          variant: "default"
        });

        // Set a pending state instead of success
        setStep(3);
        
      } else {
        // Handle direct payment success (if any)
        toast({
          title: "Payment Successful",
          description: `Payment of ₱${formData.amount.toFixed(2)} has been processed successfully`,
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClose = () => {
    setStep(1);
    setFormData({
      accountNumber: "WS-2024-001247",
      amount: 450.00,
      paymentMethod: "",
      referenceNumber: "",
      phoneNumber: "",
      email: ""
    });
    onClose();
  };

  const renderBillDetails = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Bill Details</CardTitle>
          <CardDescription>Billing period: {billDetails.billPeriod}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Account Number:</span>
              <span className="font-medium">{formData.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Due Date:</span>
              <span className="font-medium">{new Date(billDetails.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Water Consumption:</span>
              <span className="font-medium">{billDetails.consumption} cubic meters</span>
            </div>
            <hr className="my-3" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Water Charge:</span>
                <span>₱{billDetails.waterCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sewerage Charge:</span>
                <span>₱{billDetails.sewerageCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Environmental Fee:</span>
                <span>₱{billDetails.environmentalFee.toFixed(2)}</span>
              </div>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount Due:</span>
              <span>₱{billDetails.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={() => setStep(2)} data-testid="button-proceed-payment">
          Proceed to Payment
        </Button>
      </div>
    </div>
  );

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
                  {formData.paymentMethod === method.id && (
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
          <div className="space-y-2">
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
          </div>
        </div>
      )}

      <div className="space-y-2">
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
      </div>

      <Card className="bg-gray-50">
        <CardContent className="pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Amount to Pay:</span>
            <span className="text-2xl font-bold text-blue-600">₱{formData.amount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between space-x-3">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back to Bill Details
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!formData.paymentMethod || isLoading}
          data-testid="button-pay-now"
        >
          {isLoading ? "Processing..." : `Pay ₱${formData.amount.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );

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
                <span className="font-medium">{formData.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₱{formData.amount.toFixed(2)}</span>
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