import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { 
  FileText, 
  Download, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  Users,
  AlertCircle,
  BarChart3
} from "lucide-react";

export default function TreasurerQuickActions() {
  const handleAction = (action) => {
    console.log(`Executing action: ${action}`);
    // Add your action handlers here
  };

  const quickActions = [
    {
      title: "Generate Monthly Report",
      description: "Create financial report for current month",
      icon: FileText,
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      action: "generate-monthly-report",
      testId: "button-generate-monthly-report"
    },
    {
      title: "Export Payment Data",
      description: "Download payment records as CSV",
      icon: Download,
      color: "bg-green-50 text-green-600 hover:bg-green-100",
      action: "export-payment-data",
      testId: "button-export-payment-data"
    },
    {
      title: "Process Batch Payments",
      description: "Review and process pending payments",
      icon: CreditCard,
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
      action: "process-batch-payments",
      testId: "button-process-batch-payments"
    },
    {
      title: "Generate Bills",
      description: "Create bills for upcoming period",
      icon: Receipt,
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
      action: "generate-bills",
      testId: "button-generate-bills"
    },
    {
      title: "Revenue Analytics",
      description: "View detailed revenue insights",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
      action: "revenue-analytics",
      testId: "button-revenue-analytics"
    },
    {
      title: "Account Management",
      description: "Manage customer accounts and billing",
      icon: Users,
      color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
      action: "account-management",
      testId: "button-account-management"
    },
    {
      title: "Payment Alerts",
      description: "Review overdue and pending alerts",
      icon: AlertCircle,
      color: "bg-red-50 text-red-600 hover:bg-red-100",
      action: "payment-alerts",
      testId: "button-payment-alerts"
    },
    {
      title: "Financial Dashboard",
      description: "View comprehensive financial overview",
      icon: BarChart3,
      color: "bg-teal-50 text-teal-600 hover:bg-teal-100",
      action: "financial-dashboard",
      testId: "button-financial-dashboard"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.action}
                variant="ghost"
                className={`justify-start h-auto p-4 ${action.color} transition-colors`}
                onClick={() => handleAction(action.action)}
                data-testid={action.testId}
              >
                <div className="flex items-start space-x-3 w-full">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="text-left flex-1">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs opacity-75 mt-1">{action.description}</div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}