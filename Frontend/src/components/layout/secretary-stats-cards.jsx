import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Users, FileText, ClipboardList, Calendar } from "lucide-react";

export default function SecretaryStatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/secretary/stats'],
    initialData: {
      totalResidents: 1247,
      processedDocuments: 89,
      pendingApplications: 23,
      scheduledAppointments: 15
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[60px] mb-2" />
              <Skeleton className="h-3 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Residents",
      value: stats?.totalResidents || 0,
      description: "+12 registered this month",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Documents Processed",
      value: stats?.processedDocuments || 0,
      description: "+5 completed this week",
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Pending Applications",
      value: stats?.pendingApplications || 0,
      description: "3 require urgent attention",
      icon: ClipboardList,
      color: "text-orange-600"
    },
    {
      title: "Scheduled Appointments",
      value: stats?.scheduledAppointments || 0,
      description: "5 appointments today",
      icon: Calendar,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}