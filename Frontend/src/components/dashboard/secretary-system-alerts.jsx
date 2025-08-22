import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { AlertTriangle, Info, CheckCircle, XCircle, X, Bell } from "lucide-react";

export default function SecretarySystemAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/secretary/alerts'],
    initialData: [
        {
          id: 1,
          type: "warning",
          title: "Pending Documents Review",
          message: "15 documents awaiting secretary approval",
          timestamp: "2024-08-19T14:30:00Z",
          severity: "medium",
          resolved: false
        },
        {
          id: 2,
          type: "info",
          title: "Appointment Reminder",
          message: "5 appointments scheduled for today",
          timestamp: "2024-08-19T13:15:00Z",
          severity: "low",
          resolved: false
        },
        {
          id: 3,
          type: "warning",
          title: "Application Deadline",
          message: "Water connection applications due in 2 days",
          timestamp: "2024-08-19T12:00:00Z",
          severity: "high",
          resolved: false
        },
        {
          id: 4,
          type: "success",
          title: "Monthly Report Completed",
          message: "Resident registration report generated successfully",
          timestamp: "2024-08-19T10:00:00Z",
          severity: "low",
          resolved: true
        }
      ]
  });

  const getIcon = (type) => {
    switch (type) {
      case "warning": return AlertTriangle;
      case "error": return XCircle;
      case "info": return Info;
      case "success": return CheckCircle;
      default: return Info;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "warning": return "text-yellow-600";
      case "error": return "text-red-600";
      case "info": return "text-blue-600";
      case "success": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            System Alerts
          </CardTitle>
          <CardDescription>Secretary notifications and reminders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeAlerts = alerts?.filter(alert => !alert.resolved) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-orange-600" />
              System Alerts
            </CardTitle>
            <CardDescription>Secretary notifications and reminders</CardDescription>
          </div>
          {activeAlerts.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {activeAlerts.length} active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts?.map((alert) => {
            const IconComponent = getIcon(alert.type);
            return (
              <div 
                key={alert.id} 
                className={`p-3 border rounded-lg transition-colors ${
                  alert.resolved ? "bg-gray-50 opacity-75" : "bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <IconComponent className={`h-5 w-5 ${getIconColor(alert.type)} mt-0.5 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900">{alert.title}</h4>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">{formatTime(alert.timestamp)}</p>
                        {alert.resolved && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Resolved
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 p-1 h-6 w-6"
                      data-testid={`button-dismiss-alert-${alert.id}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {activeAlerts.length === 0 && (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500">All caught up! No active alerts.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}