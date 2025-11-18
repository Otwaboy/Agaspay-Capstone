import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { 
  CreditCard, 
  Wallet,
  Building,
  Smartphone,
  Settings,
  Check,
  X
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";

export default function TreasurerPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "cash",
      name: "Cash Payment",
      icon: Wallet,
      enabled: true,
      description: "Accept cash payments at office",
      settings: {
        allowPartial: true,
        requireReceipt: true
      }
    },
    {
      id: "gcash",
      name: "GCash",
      icon: Smartphone,
      enabled: true,
      description: "Mobile wallet payment via GCash",
      settings: {
        merchantId: "GCASH-123456",
        apiKey: "****-****-****",
        feePercentage: 2.0
      }
    },
    {
      id: "paymongo",
      name: "PayMongo",
      icon: CreditCard,
      enabled: true,
      description: "Online payment gateway",
      settings: {
        publicKey: "pk_test_****",
        secretKey: "sk_test_****",
        feePercentage: 2.5
      }
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      icon: Building,
      enabled: true,
      description: "Direct bank deposit/transfer",
      settings: {
        accountName: "AGASPAY Water Services",
        accountNumber: "0123-4567-8901",
        bankName: "Land Bank",
        requireProof: true
      }
    }
  ]);

  const handleToggleMethod = (id) => {
    setPaymentMethods(prev =>
      prev.map(method =>
        method.id === id ? { ...method, enabled: !method.enabled } : method
      )
    );
    toast.success("Payment Method Updated", { description: "Payment method status has been changed" });
  };

  const formatTransactionCount = (id) => {
    const counts = {
      cash: 298,
      gcash: 412,
      paymongo: 57,
      bank_transfer: 125
    };
    return counts[id] || 0;
  };

  const formatTotalAmount = (id) => {
    const amounts = {
      cash: 67230,
      gcash: 98450,
      paymongo: 27350,
      bank_transfer: 45890
    };
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amounts[id] || 0);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <TreasurerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TreasurerTopHeader />
        
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="text-payment-methods-title">
                    Payment Methods
                  </h1>
                  <p className="text-gray-600">Configure and manage payment options</p>
                </div>
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Card key={method.id} data-testid={`payment-method-${method.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            method.enabled ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <Icon className={`h-6 w-6 ${
                              method.enabled ? 'text-blue-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{method.name}</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={method.enabled}
                          onCheckedChange={() => handleToggleMethod(method.id)}
                          data-testid={`switch-${method.id}`}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Transactions</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatTransactionCount(method.id)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-xl font-bold text-gray-900">
                            {formatTotalAmount(method.id)}
                          </p>
                        </div>
                      </div>

                      {/* Settings */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 text-sm">Configuration</h4>
                        {Object.entries(method.settings).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <span className="text-sm text-gray-600 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {typeof value === 'boolean' ? (
                                value ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-red-600" />
                                )
                              ) : (
                                value
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        variant="outline" 
                        className="w-full mt-4"
                        data-testid={`button-configure-${method.id}`}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Add New Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="method-name">Method Name</Label>
                    <Input
                      id="method-name"
                      placeholder="e.g., Maya, Credit Card"
                      data-testid="input-method-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method-type">Method Type</Label>
                    <Input
                      id="method-type"
                      placeholder="e.g., E-wallet, Online Banking"
                      data-testid="input-method-type"
                    />
                  </div>
                </div>
                <Button className="mt-4" data-testid="button-add-method">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>

            {/* Payment Statistics */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Payment Method Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => {
                    const totalTransactions = paymentMethods.reduce((sum, m) => sum + formatTransactionCount(m.id), 0);
                    const methodTransactions = formatTransactionCount(method.id);
                    const percentage = ((methodTransactions / totalTransactions) * 100).toFixed(1);
                    
                    return (
                      <div key={method.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <method.icon className="h-4 w-4 text-gray-600" />
                            <span className="font-medium text-gray-900">{method.name}</span>
                          </div>
                          <Badge variant="secondary">{percentage}%</Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
