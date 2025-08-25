import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { AlertTriangle, Clock, CreditCard, Bell, Eye } from "lucide-react";

export default function TreasurerPaymentAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/payment-alerts'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mock data for development
  const mockAlerts = [
    {
      id: "ALERT-001",
      type: "overdue",
      title: "Overdue Payments",
      description: "23 accounts have overdue payments",
      amount: 28350,
      accountsCount: 23,
      urgency: "high",
      createdAt: "2024-08-25T08:00:00Z"
    },
    {
      id: "ALERT-002",
      type: "failed_payment",
      title: "Failed Payment Processing",
      description: "5 payment attempts failed in the last hour",
      amount: 4250,
      accountsCount: 5,
      urgency: "medium",
      createdAt: "2024-08-25T10:15:00Z"
    },
    {
      id: "ALERT-003",
      type: "low_collection",
      title: "Low Collection Rate",
      description: "Collection rate below target for this week",
      percentage: 87.3,
      target: 95.0,
      urgency: "medium",
      createdAt: "2024-08-24T16:30:00Z"
    },
    {
      id: "ALERT-004",
      type: "pending_verification",
      title: "Payments Pending Verification",
      description: "12 manual payments require verification",
      amount: 15680,
      accountsCount: 12,
      urgency: "low",
      createdAt: "2024-08-24T14:20:00Z"
    },
    {
      id: "ALERT-005",
      type: "system_issue",
      title: "Payment Gateway Warning",
      description: "PayMongo gateway experiencing delays",
      urgency: "high",
      createdAt: "2024-08-25T09:45:00Z"
    }
  ];

  const paymentAlerts = alerts || mockAlerts;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
                // naay urgency ani tapad sa type  urgency
  const getAlertConfig = (type) => {
    const configs = {
      overdue: {
        icon: AlertTriangle,
        bgColor: "bg-red-50",
        iconColor: "text-red-600",
        borderColor: "border-red-200"
      },
      failed_payment: {
        icon: CreditCard,
        bgColor: "bg-orange-50",
        iconColor: "text-orange-600",
        borderColor: "border-orange-200"
      },
      low_collection: {
        icon: Clock,
        bgColor: "bg-yellow-50",
        iconColor: "text-yellow-600",
        borderColor: "border-yellow-200"
      },
      pending_verification: {
        icon: Bell,
        bgColor: "bg-blue-50",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200"
      },
      system_issue: {
        icon: AlertTriangle,
        bgColor: "bg-purple-50",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200"
      }
    };

    return configs[type] || configs.pending_verification;
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      high: {
        variant: "destructive",
        className: "bg-red-100 text-red-800 hover:bg-red-100"
      },
      medium: {
        variant: "secondary", 
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      },
      low: {
        variant: "outline",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-100"
      }
    };

    const config = urgencyConfig[urgency] || urgencyConfig.low;

    return (
      <Badge variant={config.variant} className={config.className}>
        {urgency.toUpperCase()}
      </Badge>
    );
  };

  const handleViewAlert = (alertId) => {
    console.log(`Viewing alert: ${alertId}`);
    // Add navigation to detailed alert view
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Payment Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Payment Alerts
          {paymentAlerts.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {paymentAlerts.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paymentAlerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No active alerts</p>
              <p className="text-sm text-gray-400">All payment systems are operating normally</p>
            </div>
          ) : (
            paymentAlerts.map((alert) => {
              const config = getAlertConfig(alert.type, alert.urgency);
              const Icon = config.icon;

              return (
                <div 
                  key={alert.id}
                  className={`p-3 border rounded-lg transition-colors hover:bg-gray-50 ${config.borderColor}`}
                  data-testid={`alert-${alert.id}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`h-4 w-4 ${config.iconColor}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm" data-testid={`text-alert-title-${alert.id}`}>
                            {alert.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {alert.description}
                          </p>
                          
                          {/* Alert-specific details */}
                          <div className="mt-2 space-y-1">
                            {alert.amount && (
                              <p className="text-xs text-gray-500">
                                Amount: <span className="font-medium text-gray-700">{formatCurrency(alert.amount)}</span>
                              </p>
                            )}
                            {alert.accountsCount && (
                              <p className="text-xs text-gray-500">
                                Accounts: <span className="font-medium text-gray-700">{alert.accountsCount}</span>
                              </p>
                            )}
                            {alert.percentage && (
                              <p className="text-xs text-gray-500">
                                Rate: <span className="font-medium text-gray-700">{alert.percentage}%</span> 
                                (Target: {alert.target}%)
                              </p>
                            )}
                            <p className="text-xs text-gray-400">
                              {formatDate(alert.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-3">
                          {getUrgencyBadge(alert.urgency)}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewAlert(alert.id)}
                          className="text-xs"
                          data-testid={`button-view-alert-${alert.id}`}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {paymentAlerts.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              className="w-full text-sm text-blue-600 hover:text-blue-800"
              data-testid="button-view-all-alerts"
            >
              View All Alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}