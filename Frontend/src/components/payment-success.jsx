import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PaymentSuccess() {
  const [, setLocation] = useLocation();
  const [paymentStatus, setPaymentStatus] = useState("checking"); // checking, processing, success, failed
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [verificationDetails, setVerificationDetails] = useState(null);
  const maxAttempts = 15; // Try for 45 seconds (15 attempts x 3 seconds)

  // 🔹 Use your deployed backend URL
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const pendingPayment = localStorage.getItem("pending_payment");
    if (pendingPayment) {
      setPaymentDetails(JSON.parse(pendingPayment));
    }

    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");
    const paymentIntentId = urlParams.get("payment_intent_id");

    console.log("🔍 URL Params:", { status, paymentIntentId });

    if (status === "failed") {
      setPaymentStatus("failed");
      toast.error("Payment Failed", { description: "Your payment could not be processed. Please try again." });
      return;
    }

    if (paymentIntentId) {
      verifyPaymentInDatabase(paymentIntentId);
    } else if (status === "succeeded" || status === "paid" || status === "success") {
      setPaymentStatus("processing");
    } else {
      setPaymentStatus("processing");
    }
  }, [toast]);

  const verifyPaymentInDatabase = async (paymentIntentId, attemptNumber = 0) => {
    try {
      console.log(`🔄 Verification attempt ${attemptNumber + 1}/${maxAttempts}`);

      const response = await fetch(
        `${API_BASE_URL}/api/v1/payment/verify?payment_intent_id=${paymentIntentId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("agaspay_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      console.log("📊 Verification result:", result);

      if (result.payment_recorded) {
        console.log("✅ [PaymentSuccess] Payment recorded! Details:", result.payment_details);
        setPaymentStatus("success");
        setVerificationDetails(result.payment_details);
        localStorage.removeItem("pending_payment");

        // Dispatch event to refresh billing data in dashboard
        console.log("📢 [PaymentSuccess] Dispatching 'paymentSuccess' event");
        window.dispatchEvent(new Event("paymentSuccess"));

        // Also dispatch refresh event for modal
        console.log("📢 [PaymentSuccess] Dispatching 'paymentCompleted' event");
        window.dispatchEvent(new Event("paymentCompleted"));

        toast.success("Payment Successful", { description: "Your water bill payment has been processed successfully" });
      } else if (result.status === "succeeded" || result.status === "pending") {
        if (attemptNumber < maxAttempts) {
          setPaymentStatus("processing");
          setAttempts(attemptNumber + 1);

          setTimeout(() => {
            verifyPaymentInDatabase(paymentIntentId, attemptNumber + 1);
          }, 3000);
        } else {
          setPaymentStatus("processing");
          toast.success("Payment Processing", { description: "Your payment is being processed. Please check your account in a few minutes." });
        }
      } else {
        setPaymentStatus("failed");
        toast.error("Payment Failed", { description: "Your payment could not be processed. Please try again." });
      }
    } catch (error) {
      console.error("❌ Error verifying payment:", error);

      if (attemptNumber < maxAttempts) {
        setAttempts(attemptNumber + 1);
        setTimeout(() => {
          verifyPaymentInDatabase(paymentIntentId, attemptNumber + 1);
        }, 3000);
      } else {
        setPaymentStatus("failed");
        toast.error("Verification Failed", { description: "Unable to verify payment. Please contact support." });
      }
    }
  };

  const handleReturnToDashboard = () => {
    setLocation("/resident-dashboard");
  };

  const handleRetry = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentIntentId = urlParams.get("payment_intent_id");

    if (paymentIntentId) {
      setPaymentStatus("checking");
      setAttempts(0);
      verifyPaymentInDatabase(paymentIntentId);
    }
  };

  const renderStatusIcon = () => {
    switch (paymentStatus) {
      case "success":
        return <CheckCircle className="h-16 w-16 text-green-600" />;
      case "failed":
        return <AlertTriangle className="h-16 w-16 text-red-600" />;
      case "processing":
        return <Clock className="h-16 w-16 text-blue-600" />;
      case "checking":
        return <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-16 w-16 text-blue-600" />;
    }
  };

  const renderStatusMessage = () => {
    switch (paymentStatus) {
      case "success":
        return {
          title: "Payment Successful!",
          description:
            "Your water bill payment has been processed and saved successfully. Your account has been updated.",
        };
      case "failed":
        return {
          title: "Payment Failed",
          description:
            "We were unable to process your payment. Please try again or contact support if the issue persists.",
        };
      case "processing":
        return {
          title: "Payment Processing",
          description:
            "Your payment was received by PayMongo and is being processed in our system. This usually takes less than a minute.",
        };
      case "checking":
        return {
          title: "Verifying Payment",
          description: "Please wait while we verify your payment with PayMongo...",
        };
      default:
        return {
          title: "Processing Payment",
          description: "Your payment is being processed. This may take a few moments to complete.",
        };
    }
  };

  const statusMessage = renderStatusMessage();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">{renderStatusIcon()}</div>
          <CardTitle className="text-xl">{statusMessage.title}</CardTitle>
          <p className="text-gray-600 text-sm">{statusMessage.description}</p>

          {paymentStatus === "checking" && (
            <p className="text-xs text-gray-500 mt-2">
              Verification attempt {attempts + 1} of {maxAttempts}
            </p>
          )}
        </CardHeader>

        <CardContent>
          {verificationDetails && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-2">✅ Payment Confirmed</p>
              <div className="space-y-2 text-xs text-green-700">
                <div className="flex justify-between">
                  <span>Payment ID:</span>
                  <span className="font-mono">{verificationDetails._id?.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>₱{verificationDetails.amount_paid?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="capitalize">{verificationDetails.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium">Paid</span>
                </div>
              </div>
            </div>
          )}

          {paymentDetails && !verificationDetails && (
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

          {paymentStatus === "processing" && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-2">What's happening?</p>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>✓ Payment received by PayMongo</li>
                <li>⏳ Being recorded in our database</li>
                <li>• You'll receive a confirmation shortly</li>
                <li>• Check your transaction history</li>
              </ul>
            </div>
          )}

          <div className="space-y-3">
            {paymentStatus === "success" && (
              <Button onClick={handleReturnToDashboard} className="w-full">
                Return to Dashboard
              </Button>
            )}

            {paymentStatus === "processing" && (
              <>
                <Button onClick={handleRetry} variant="outline" className="w-full">
                  Check Status Again
                </Button>
                <Button onClick={handleReturnToDashboard} className="w-full">
                  Continue to Dashboard
                </Button>
              </>
            )}

            {paymentStatus === "failed" && (
              <>
                <Button onClick={handleReturnToDashboard} className="w-full">
                  Return to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/resident-dashboard")}
                  className="w-full"
                >
                  Try Payment Again
                </Button>
              </>
            )}

            {paymentStatus === "checking" && (
              <Button onClick={handleReturnToDashboard} variant="outline" className="w-full">
                Continue to Dashboard
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
