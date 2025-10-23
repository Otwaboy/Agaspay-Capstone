import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [paymentStatus, setPaymentStatus] = useState('processing');
  const [paymentDetails, setPaymentDetails] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    const pendingPayment = localStorage.getItem('pending_payment');
    if (pendingPayment) {
      setPaymentDetails(JSON.parse(pendingPayment));
    }

    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const paymentIntentId = urlParams.get('payment_intent_id');

    if (status === 'succeeded') {
      setPaymentStatus('success');
      toast({
        title: "Payment Successful",
        description: "Your water bill payment has been processed successfully",
        variant: "default"
      });
      
      localStorage.removeItem('pending_payment');
      
    } else if (status === 'failed') {
      setPaymentStatus('failed');
      toast({
        title: "Payment Failed", 
        description: "Your payment could not be processed. Please try again.",
        variant: "destructive"
      });
      
    } else {
      if (paymentIntentId && pendingPayment) {
        checkPaymentStatus(paymentIntentId);
      }
    }
  }, [toast]);

  const checkPaymentStatus = async (paymentIntentId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/v1/payments/status/${paymentIntentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('agaspay_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        if (result.status === 'succeeded' || result.payment_status === 'completed') {
          setPaymentStatus('success');
          localStorage.removeItem('pending_payment');
        } else if (result.status === 'failed' || result.payment_status === 'failed') {
          setPaymentStatus('failed');
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setPaymentStatus('failed');
    }
  };

  const handleReturnToDashboard = () => {
    setLocation('/resident-dashboard');
  };

  const renderStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case 'failed':
        return <AlertTriangle className="h-16 w-16 text-red-600" />;
      default:
        return <Clock className="h-16 w-16 text-blue-600" />;
    }
  };

  const renderStatusMessage = () => {
    switch (paymentStatus) {
      case 'success':
        return {
          title: "Payment Successful!",
          description: "Your water bill payment has been processed successfully. Your account has been updated."
        };
      case 'failed':
        return {
          title: "Payment Failed",
          description: "We were unable to process your payment. Please try again or contact support if the issue persists."
        };
      default:
        return {
          title: "Processing Payment",
          description: "Your payment is being processed. This may take a few moments to complete."
        };
    }
  };

  const statusMessage = renderStatusMessage();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {renderStatusIcon()}
          </div>
          <CardTitle className="text-xl">{statusMessage.title}</CardTitle>
          <p className="text-gray-600 text-sm">{statusMessage.description}</p>
        </CardHeader>
        
        <CardContent>
          {paymentDetails && (
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Account Number:</span>
                <span className="font-medium">{paymentDetails.accountNumber}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">₱{paymentDetails.amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">{paymentDetails.method}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <Button 
              onClick={handleReturnToDashboard} 
              className="w-full"
              data-testid="button-return-dashboard"
            >
              Return to Dashboard
            </Button>
            
            {paymentStatus === 'failed' && (
              <Button 
                variant="outline" 
                onClick={() => setLocation('/resident-dashboard')}
                className="w-full"
              >
                Try Payment Again
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}