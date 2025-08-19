import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Users, Droplets, DollarSign, AlertTriangle } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
    initialData: {
      totalUsers: 1250,
      activeConnections: 892,
      monthlyRevenue: 45000,
      pendingIssues: 12
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
      title: "Total Users",
      value: stats?.totalUsers || 0,
      description: "+12% from last month",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Connections",
      value: stats?.activeConnections || 0,
      description: "+5% from last month",
      icon: Droplets,
      color: "text-green-600"
    },
    {
      title: "Monthly Revenue",
      value: `₱${(stats?.monthlyRevenue || 0).toLocaleString()}`,
      description: "+8% from last month",
      icon: DollarSign,
      color: "text-yellow-600"
    },
    {
      title: "Pending Issues",
      value: stats?.pendingIssues || 0,
      description: "-3% from last month",
      icon: AlertTriangle,
      color: "text-red-600"
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