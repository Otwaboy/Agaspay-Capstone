import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Users, Droplets, DollarSign, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import apiClient from "../../lib/api";

export default function ModernStatsCards() {
  // ✅ Fetch active connections
  const { data: activeData, isLoading: activeLoading } = useQuery({
    queryKey: ["active-connections"],
    queryFn: () => apiClient.getActiveWaterConnections(),
  });

  // ✅ Fetch inactive connections
  const { data: inactiveData, isLoading: inactiveLoading } = useQuery({
    queryKey: ["inactive-connections"],
    queryFn: () => apiClient.getInactiveWaterConnections(),
  });

   const { data: overdueData, isLoading: overdueLoading } = useQuery({
    queryKey: ["overdue-billing"],
    queryFn: () => apiClient.getOverdueBilling(),
  });

  // ✅ Extract connection counts safely
  const activeConnections = activeData?.data?.length || 0;
  const inactiveConnections = inactiveData?.data?.length || 0;
  const overdueBilling = overdueData?.data?.length || 0

  console.log("Active Connections:", activeData?.data);
  console.log("Inactive Connections:", inactiveData?.data);

  // ✅ Loading state skeleton
  // if (activeLoading || inactiveLoading || overdueLoading) {
  //   return (
  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  //       {[...Array(4)].map((_, i) => (
  //         <Card key={i} className="border-none shadow-sm">
  //           <CardContent className="p-6">
  //             <Skeleton className="h-20 w-full" />
  //           </CardContent>
  //         </Card>
  //       ))}
  //     </div>
  //   );
  // }

  // ✅ Stat Cards Data
  const statCards = [
    {
      title: "Active Connections",
      value: activeConnections,
      change: "+8.95%",
      trend: "up",
      subtitle: "Total currently active",
      icon: Droplets,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      chartColor: "bg-blue-500",
    },
    {
      title: "Inactive Connections",
      value: inactiveConnections,
      change: "-3.42%",
      trend: "down",
      subtitle: "Temporarily inactive users",
      icon: Users,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      chartColor: "bg-gray-500",
    },
    {
      title: "Overdue Bills",
      value: overdueBilling,
      change: "+92.05%",
      trend: "down",
      subtitle: "Since last week",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      chartColor: "bg-red-500",
    },
    {
      title: "Scheduled Tasks",
      value: 7, // Replace with actual backend data later
      change: "+27.47%",
      trend: "up",
      subtitle: "Upcoming maintenance",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      chartColor: "bg-purple-500",
    },
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
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === "up" ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
              </div>

              {/* Mini bar chart */}
              <div className="flex items-end gap-0.5 h-12 ml-2">
                {[30, 45, 35, 50, 40, 60, 55, 70, 65, 75].map((height, i) => (
                  <div
                    key={i}
                    className={`w-1.5 ${stat.chartColor} opacity-${
                      i === 9 ? "100" : "40"
                    } rounded-sm`}
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
