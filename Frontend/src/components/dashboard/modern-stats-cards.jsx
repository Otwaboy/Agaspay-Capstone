import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Users, Droplets, DollarSign, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { dashboardApi } from "../../services/adminApi";

export default function ModernStatsCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats
  });

  const stats = data?.stats || {};

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: "Active Connections",
      value: stats?.connections?.active || 0,
      change: "+8.95%",
      trend: "up",
      subtitle: "Since last week",
      icon: Droplets,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      chartColor: "bg-blue-500"
    },
    {
      title: "New This Week",
      value: stats?.connections?.pending || 0,
      change: "+4.11%",
      trend: "up",
      subtitle: "Since last week",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      chartColor: "bg-green-500"
    },
    {
      title: "Overdue Bills",
      value: stats?.financial?.delinquentAccounts || 0,
      change: "+92.05%",
      trend: "down",
      subtitle: "Since last week",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      chartColor: "bg-red-500"
    },
    {
      title: "Scheduled Tasks",
      value: stats?.tasks?.pending || 0,
      change: "+27.47%",
      trend: "up",
      subtitle: "Since last week",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      chartColor: "bg-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-blue-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
              </div>
              
              {/* Mini trend chart */}
              <div className="flex items-end gap-0.5 h-12 ml-2">
                {[30, 45, 35, 50, 40, 60, 55, 70, 65, 75].map((height, i) => (
                  <div
                    key={i}
                    className={`w-1.5 ${stat.chartColor} opacity-${i === 9 ? '100' : '40'} rounded-sm`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
