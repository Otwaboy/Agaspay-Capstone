import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Clock, User, FileText, Calendar, UserPlus } from "lucide-react";

export default function SecretaryRecentActivities() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/secretary/activities'],
    initialData: [
        {
          id: 1,
          type: "registration",
          user: "Maria Santos",
          action: "Registered new resident",
          details: "Completed registration for Biking Zone 2",
          time: "2 minutes ago",
          status: "completed"
        },
        {
          id: 2,
          type: "document",
          user: "Juan Dela Cruz",
          action: "Processed barangay certificate",
          details: "Certificate ready for pickup",
          time: "15 minutes ago",
          status: "completed"
        },
        {
          id: 3,
          type: "appointment",
          user: "Pedro Rodriguez",
          action: "Scheduled appointment",
          details: "Water connection consultation on Friday 2PM",
          time: "1 hour ago",
          status: "pending"
        },
        {
          id: 4,
          type: "document",
          user: "Ana Garcia",
          action: "Document verification",
          details: "Reviewed business permit requirements",
          time: "2 hours ago",
          status: "completed"
        },
        {
          id: 5,
          type: "registration",
          user: "Carlos Mendoza",
          action: "Updated resident record",
          details: "Contact information and address updated",
          time: "3 hours ago",
          status: "completed"
        }
      ]
  });

  const getIcon = (type) => {
    switch (type) {
      case "registration": return UserPlus;
      case "document": return FileText;
      case "appointment": return Calendar;
      default: return User;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "registration": return "text-green-600 bg-green-100";
      case "document": return "text-blue-600 bg-blue-100";
      case "appointment": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest secretary activities and tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-16" />
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
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest secretary activities and tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity) => {
            const IconComponent = getIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full ${getIconColor(activity.type)}`}>
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <Badge className={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{activity.user}</p>
                  <p className="text-sm text-gray-500 mt-1">{activity.details}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}