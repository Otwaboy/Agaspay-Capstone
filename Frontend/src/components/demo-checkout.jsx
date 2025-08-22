import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Smartphone, CreditCard, Loader2 } from "lucide-react";

export default function DemoCheckout() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const amount = urlParams.get('amount');
    const method = urlParams.get('method');
    const account = urlParams.get('account');

    setPaymentDetails({
      amount: parseFloat(amount) || 450.00,
      method: method || 'gcash',
      account: account || 'WS-2024-001247'
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const handleSuccessfulPayment = () => {
    setLocation('/payment/success?status=succeeded&payment_intent_id=pi_mock_' + Date.now());
  };

  const handleFailedPayment = () => {
    setLocation('/payment/cancel?status=failed');
  };

  const getPaymentIcon = () => {
    return paymentDetails?.method === 'gcash' ? 
      <Smartphone className="h-8 w-8 text-blue-600" /> : 
      <CreditCard className="h-8 w-8 text-green-600" />;
  };

  const getPaymentName = () => {
    return paymentDetails?.method === 'gcash' ? 'GCash' : 'PayMaya';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Connecting to PayMongo</h2>
            <p className="text-gray-600">Please wait while we redirect you to the secure payment page...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 bg-blue-50 rounded-full w-fit">
            {getPaymentIcon()}
          </div>
          <CardTitle className="text-xl">PayMongo Demo Checkout</CardTitle>
          <p className="text-gray-600 text-sm">Complete your {getPaymentName()} payment</p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Water Bill Payment</span>
                <span className="font-medium">AGASPAY</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-medium">{paymentDetails?.account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="text-xl font-bold">₱{paymentDetails?.amount.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Demo Mode:</strong> This is a simulated PayMongo checkout. 
                Click "Pay Now" to simulate successful payment or "Cancel" for failed payment.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 p-3 border rounded-lg">
              {getPaymentIcon()}
              <span className="font-medium">{getPaymentName()} Wallet</span>
            </div>

            <div className="space-y-3 pt-4">
              <Button 
                onClick={handleSuccessfulPayment}
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-demo-pay"
              >
                Pay ₱{paymentDetails?.amount.toFixed(2)} with {getPaymentName()}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleFailedPayment}
                className="w-full"
                data-testid="button-demo-cancel"
              >
                Cancel Payment
              </Button>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                🔒 Secured by PayMongo • Demo Environment
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}