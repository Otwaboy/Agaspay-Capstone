import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  AlertTriangle, 
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Trash2
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";

export default function TreasurerFinancialAlerts() {
  const [filterUrgency, setFilterUrgency] = useState("all");

  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/alerts', filterUrgency],
    staleTime: 1 * 60 * 1000,
  });

  const mockAlerts = [
    {
      id: "ALERT-001",
      type: "overdue_payment",
      title: "High Overdue Payment Volume",
      description: "23 accounts have overdue payments exceeding grace period",
      urgency: "high",
      amount: 28350,
      accountsAffected: 23,
      createdAt: "2024-08-25T08:00:00Z",
      status: "active"
    },
    {
      id: "ALERT-002",
      type: "low_collection",
      title: "Collection Rate Below Target",
      description: "Current collection rate is 87.3%, below 95% target",
      urgency: "medium",
      targetRate: 95,
      currentRate: 87.3,
      createdAt: "2024-08-24T16:30:00Z",
      status: "active"
    },
    {
      id: "ALERT-003",
      type: "failed_transaction",
      title: "Multiple Failed Transactions",
      description: "5 payment transactions failed in the last hour",
      urgency: "high",
      failedCount: 5,
      amount: 4250,
      createdAt: "2024-08-25T10:15:00Z",
      status: "active"
    },
    {
      id: "ALERT-004",
      type: "pending_verification",
      title: "Payments Awaiting Verification",
      description: "12 manual payments require treasurer verification",
      urgency: "low",
      pendingCount: 12,
      amount: 15680,
      createdAt: "2024-08-24T14:20:00Z",
      status: "active"
    },
    {
      id: "ALERT-005",
      type: "revenue_drop",
      title: "Revenue Drop Detected",
      description: "Monthly revenue 15% lower than previous month",
      urgency: "medium",
      percentageChange: -15,
      createdAt: "2024-08-23T09:00:00Z",
      status: "resolved"
    }
  ];

  const alertData = alerts || mockAlerts;

  const filteredData = alertData.filter(alert => {
    return filterUrgency === "all" || alert.urgency === filterUrgency;
  });

  const activeAlerts = alertData.filter(a => a.status === "active").length;
  const highUrgencyAlerts = alertData.filter(a => a.urgency === "high" && a.status === "active").length;
  const resolvedAlerts = alertData.filter(a => a.status === "resolved").length;

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUrgencyConfig = (urgency) => {
    switch (urgency) {
      case "high":
        return {
          label: "High",
          className: "bg-red-100 text-red-800",
          icon: AlertTriangle,
          iconColor: "text-red-600"
        };
      case "medium":
        return {
          label: "Medium",
          className: "bg-yellow-100 text-yellow-800",
          icon: Clock,
          iconColor: "text-yellow-600"
        };
      case "low":
        return {
          label: "Low",
          className: "bg-blue-100 text-blue-800",
          icon: Bell,
          iconColor: "text-blue-600"
        };
      default:
        return {
          label: urgency,
          className: "bg-gray-100 text-gray-800",
          icon: Bell,
          iconColor: "text-gray-600"
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "dismissed":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleResolveAlert = (alertId) => {
    console.log(`Resolving alert: ${alertId}`);
  };

  const handleDismissAlert = (alertId) => {
    console.log(`Dismissing alert: ${alertId}`);
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
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="text-financial-alerts-title">
                    Financial Alerts
                  </h1>
                  <p className="text-gray-600">Monitor and manage financial alerts and warnings</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                      <p className="text-2xl font-bold text-orange-600" data-testid="text-active-alerts">
                        {activeAlerts}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">High Urgency</p>
                      <p className="text-2xl font-bold text-red-600">
                        {highUrgencyAlerts}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resolved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {resolvedAlerts}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex gap-2">
                  <Button
                    variant={filterUrgency === "all" ? "default" : "outline"}
                    onClick={() => setFilterUrgency("all")}
                    data-testid="button-filter-all"
                  >
                    All
                  </Button>
                  <Button
                    variant={filterUrgency === "high" ? "default" : "outline"}
                    onClick={() => setFilterUrgency("high")}
                    data-testid="button-filter-high"
                  >
                    High
                  </Button>
                  <Button
                    variant={filterUrgency === "medium" ? "default" : "outline"}
                    onClick={() => setFilterUrgency("medium")}
                    data-testid="button-filter-medium"
                  >
                    Medium
                  </Button>
                  <Button
                    variant={filterUrgency === "low" ? "default" : "outline"}
                    onClick={() => setFilterUrgency("low")}
                    data-testid="button-filter-low"
                  >
                    Low
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alerts List */}
            <div className="space-y-4">
              {filteredData.map((alert) => {
                const urgencyConfig = getUrgencyConfig(alert.urgency);
                const UrgencyIcon = urgencyConfig.icon;
                
                return (
                  <Card key={alert.id} data-testid={`alert-${alert.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            alert.urgency === "high" ? "bg-red-100" : 
                            alert.urgency === "medium" ? "bg-yellow-100" : "bg-blue-100"
                          }`}>
                            <UrgencyIcon className={`h-6 w-6 ${urgencyConfig.iconColor}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                              <Badge className={urgencyConfig.className}>
                                {urgencyConfig.label}
                              </Badge>
                              {getStatusIcon(alert.status)}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{alert.description}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              {alert.amount && (
                                <span className="flex items-center">
                                  <span className="font-medium text-gray-900 ml-1">
                                    {formatCurrency(alert.amount)}
                                  </span>
                                </span>
                              )}
                              {alert.accountsAffected && (
                                <span>
                                  Accounts: <span className="font-medium text-gray-900">{alert.accountsAffected}</span>
                                </span>
                              )}
                              {alert.failedCount && (
                                <span>
                                  Failed: <span className="font-medium text-gray-900">{alert.failedCount}</span>
                                </span>
                              )}
                              {alert.currentRate && (
                                <span>
                                  Rate: <span className="font-medium text-gray-900">{alert.currentRate}%</span>
                                </span>
                              )}
                              <span className="text-gray-400">
                                {formatDate(alert.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            data-testid={`button-view-${alert.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {alert.status === "active" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleResolveAlert(alert.id)}
                                data-testid={`button-resolve-${alert.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDismissAlert(alert.id)}
                                data-testid={`button-dismiss-${alert.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
