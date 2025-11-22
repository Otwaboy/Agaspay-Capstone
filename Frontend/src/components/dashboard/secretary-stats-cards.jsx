import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Users, AlertTriangle, Bell, UserPlus, TrendingUp, TrendingDown } from "lucide-react";
import apiClient from "../../lib/api";

export default function SecretaryStatsCards() {
  // Fetch total residents (active water connections)
  const { data: residentsData, isLoading: residentsLoading } = useQuery({
    queryKey: ["total-residents"],
    queryFn: () => apiClient.getActiveWaterConnections(),
  });

  // Fetch pending connections (inactive connections)
  const { data: pendingConnectionsData, isLoading: pendingConnectionsLoading } = useQuery({
    queryKey: ["pending-connections"],
    queryFn: () => apiClient.getInactiveWaterConnections(),
  });

  // Fetch incident reports
  const { data: incidentData, isLoading: incidentLoading } = useQuery({
    queryKey: ["incident-reports"],
    queryFn: () => apiClient.getIncidentReports(),
  });

  // Fetch published announcements
  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ["published-announcements"],
    queryFn: () => apiClient.getAnnouncements({ status: 'published' }),
  });

  const isLoading = residentsLoading || pendingConnectionsLoading || incidentLoading || announcementsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

  // Extract data safely
  const totalResidents = residentsData?.data?.length || 0;
  const pendingConnections = pendingConnectionsData?.data?.length || 0;
  const incidentReports = incidentData?.count || 0;
  const publishedAnnouncements = announcementsData?.data?.length || 0;

  const statCards = [
    {
      title: "Total Residents",
      value: totalResidents,
      description: "Active water connections",
      change: "+5.2%",
      trend: "up",
      icon: Users,
      color: "text-blue-600",
      chartColor: "bg-blue-500"
    },
    {
      title: "Pending Connections",
      value: pendingConnections,
      description: "Awaiting activation",
      change: "+12.8%",
      trend: "up",
      icon: UserPlus,
      color: "text-orange-600",
      chartColor: "bg-orange-500"
    },
    {
      title: "Incident Reports",
      value: incidentReports,
      description: "Total reported incidents",
      change: "-8.3%",
      trend: "down",
      icon: AlertTriangle,
      color: "text-red-600",
      chartColor: "bg-red-500"
    },
    {
      title: "Published Announcements",
      value: publishedAnnouncements,
      description: "Currently published",
      change: "+18.5%",
      trend: "up",
      icon: Bell,
      color: "text-purple-600",
      chartColor: "bg-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-xs font-medium ${
                    stat.trend === "up" ? "text-blue-600" : "text-red-600"
                  }`}>
                    {stat.change}
                  </span>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{stat.description}</p>
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