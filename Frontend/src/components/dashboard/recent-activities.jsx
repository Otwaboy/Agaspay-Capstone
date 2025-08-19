import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Clock, User, Droplets, Settings, DollarSign } from "lucide-react";

export default function RecentActivities() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/dashboard/activities'],
    initialData: [
        {
          id: 1,
          type: "payment",
          user: "Juan Dela Cruz",
          action: "Paid water bill",
          amount: "₱450",
          time: "2 minutes ago",
          status: "completed"
        },
        {
          id: 2,
          type: "connection",
          user: "Maria Santos",
          action: "New water connection requested",
          time: "15 minutes ago",
          status: "pending"
        },
        {
          id: 3,
          type: "reading",
          user: "Pedro Rodriguez",
          action: "Meter reading updated",
          reading: "245 m³",
          time: "1 hour ago",
          status: "completed"
        },
        {
          id: 4,
          type: "maintenance",
          user: "System Admin",
          action: "Scheduled maintenance completed",
          time: "2 hours ago",
          status: "completed"
        },
        {
          id: 5,
          type: "payment",
          user: "Ana Garcia",
          action: "Payment failed",
          amount: "₱320",
          time: "3 hours ago",
          status: "failed"
        }
      ]
  });

  const getIcon = (type) => {
    switch (type) {
      case "payment": return DollarSign;
      case "connection": return Droplets;
      case "reading": return Clock;
      case "maintenance": return Settings;
      default: return User;
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
          <CardDescription>Latest system activities and transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>Latest system activities and transactions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities?.map((activity) => {
            const Icon = getIcon(activity.type);
            return (
              <div key={activity.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.user}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {activity.action}
                    {activity.amount && ` - ${activity.amount}`}
                    {activity.reading && ` - ${activity.reading}`}
                  </p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
                <div className="flex-shrink-0">
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}