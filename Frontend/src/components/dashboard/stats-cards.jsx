import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Users, Droplets, DollarSign, AlertTriangle } from "lucide-react";
import { apiClient } from "../../lib/api";


export default function StatsCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats()
  });

  const stats = data?.stats || {};

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
      value: (stats?.users?.totalResidents || 0) + (stats?.users?.totalPersonnel || 0),
      description: `${stats?.users?.totalResidents || 0} Residents, ${stats?.users?.totalPersonnel || 0} Personnel`,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Active Connections",
      value: stats?.connections?.active || 0,
      description: `${stats?.connections?.pending || 0} pending, ${stats?.connections?.disconnected || 0} disconnected`,
      icon: Droplets,
      color: "text-green-600"
    },
    {
      title: "Total Revenue",
      value: `₱${(stats?.financial?.totalRevenue || 0).toLocaleString()}`,
      description: `₱${(stats?.financial?.pendingPayments || 0).toLocaleString()} pending`,
      icon: DollarSign,
      color: "text-yellow-600"
    },
    {
      title: "Open Incidents",
      value: stats?.incidents?.open || 0,
      description: `${stats?.incidents?.resolved || 0} resolved this month`,
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