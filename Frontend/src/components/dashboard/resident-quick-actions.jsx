import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  CreditCard,
  AlertTriangle,
  FileText,
  Calendar,
  Phone,
  Download
} from "lucide-react";

export default function ResidentQuickActions() {
  
  const actions = [
    {
      icon: CreditCard,
      title: "Pay Bill",
      description: "Make a payment",
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => window.dispatchEvent(new Event("openPayBillModal")),
      testId: "button-pay-bill"
    },
    {
      icon: AlertTriangle,
      title: "Report Issue",
      description: "Report water problems",
      color: "bg-red-500 hover:bg-red-600",
      onClick: () => window.dispatchEvent(new Event("openReportIssueModal")),
      testId: "button-report-issue"
    },
    {
      icon: FileText,
      title: "View Bills",
      description: "Check billing history",
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => console.log("View bills"),
      testId: "button-view-bills"
    },
    {
      icon: Download,
      title: "Download Receipt",
      description: "Get payment receipt",
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: () => console.log("Download receipt"),
      testId: "button-download-receipt"
    },
    {
      icon: Calendar,
      title: "Schedule Service",
      description: "Book maintenance",
      color: "bg-orange-500 hover:bg-orange-600",
      onClick: () => console.log("Schedule service"),
      testId: "button-schedule-service"
    },
    {
      icon: Phone,
      title: "Contact Support",
      description: "Get help",
      color: "bg-teal-500 hover:bg-teal-600",
      onClick: () => console.log("Contact support"),
      testId: "button-contact-support"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Common tasks and services
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200 ${action.color} hover:text-white border-2`}
                onClick={action.onClick}
                data-testid={action.testId}
              >
                <IconComponent className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium text-sm leading-tight">{action.title}</p>
                  <p className="text-xs opacity-70 mt-1">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>

        {/* Service Hours */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Service Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Customer Service</span>
              <span className="text-gray-600">8:00 AM - 5:00 PM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Emergency Hotline</span>
              <span className="text-gray-600">24/7 Available</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Office Days</span>
              <span className="text-gray-600">Monday - Friday</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}