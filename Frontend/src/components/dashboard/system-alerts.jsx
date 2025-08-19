import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { AlertTriangle, Info, CheckCircle, XCircle, X, Bell } from "lucide-react";

export default function SystemAlerts() {
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['/api/dashboard/alerts'],
    initialData: [
        {
          id: 1,
          type: "warning",
          title: "High Water Usage Detected",
          message: "Zone 3 showing 40% above normal consumption",
          timestamp: "2024-08-19T14:30:00Z",
          severity: "medium",
          resolved: false
        },
        {
          id: 2,
          type: "error",
          title: "Payment Gateway Issue",
          message: "GCash payments temporarily unavailable",
          timestamp: "2024-08-19T13:15:00Z",
          severity: "high",
          resolved: false
        },
        {
          id: 3,
          type: "info",
          title: "Scheduled Maintenance",
          message: "Water supply interruption in Zone 1 from 2-4 PM",
          timestamp: "2024-08-19T12:00:00Z",
          severity: "low",
          resolved: false
        },
        {
          id: 4,
          type: "success",
          title: "System Backup Completed",
          message: "Daily database backup finished successfully",
          timestamp: "2024-08-19T02:00:00Z",
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
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>Important system notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-3 w-[300px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unresolvedAlerts = alerts?.filter(alert => !alert.resolved) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>System Alerts</CardTitle>
          <CardDescription>
            {unresolvedAlerts.length} active alerts requiring attention
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts?.map((alert) => {
            const Icon = getIcon(alert.type);
            return (
              <div key={alert.id} className={`flex items-start space-x-4 p-4 border rounded-lg ${alert.resolved ? 'opacity-60' : ''}`}>
                <div className="flex-shrink-0">
                  <Icon className={`h-6 w-6 ${getIconColor(alert.type)}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </h4>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTime(alert.timestamp)}
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-2">
                  {alert.resolved ? (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Resolved
                    </Badge>
                  ) : (
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {unresolvedAlerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-500">No active alerts at this time.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}