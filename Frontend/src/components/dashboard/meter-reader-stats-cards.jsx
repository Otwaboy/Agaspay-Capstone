import { useQuery } from "@tanstack/react-query";
import { Users, AlertTriangle, MapPin, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function MeterReaderStatsCards() {
  const { data: readerStats  } = useQuery({
    queryKey: ['/api/v1/meter-reader/daily-stats'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Extract stats from API response
  const stats = readerStats?.stats || {
    totalResidents: 0,
    reportedIssues: 0, 
    zonesCovered: 0,
    residentChange: "+0%",
    issuesChange: "0%",
    zonesChange: "0%",
  };

  // Determine trend direction based on change value
  const getTrend = (changeStr) => {
    if (!changeStr) return "up";
    const numValue = parseFloat(changeStr.replace('%', ''));
    return numValue >= 0 ? "up" : "down";
  };

  const statsCards = [
    {
      title: "Total Residents in Zone",
      value: stats.totalResidents || 0,
      change: stats.residentChange || "+0%",
      trend: getTrend(stats.residentChange),
      subtitle: "Residents in assigned area",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      chartColor: "bg-blue-500",
      testId: "card-total-residents"
    },
    {
      title: "Total Reported Issues",
      value: stats.reportedIssues || 0,
      change: stats.issuesChange || "0%",
      trend: getTrend(stats.issuesChange),
      subtitle: "Issues you've reported",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      chartColor: "bg-orange-500",
      testId: "card-reported-issues"
    },
    {
      title: "Zones Covered",
      value: stats.zonesCovered || 0,
      change: stats.zonesChange || "0%",
      trend: getTrend(stats.zonesChange),
      subtitle: "Areas you manage",
      icon: MapPin,
      color: "text-green-600",
      bgColor: "bg-green-50",
      chartColor: "bg-green-500",
      testId: "card-zones-covered"
    },
  ];

  // Show loading skeleton while fetching data
  // if (isLoading) {
  //   return (
  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  //       {[1, 2, 3].map((i) => (
  //         <Card key={i} className="border-none shadow-sm">
  //           <CardContent className="p-6">
  //             <Skeleton className="h-24 w-full" />
  //           </CardContent>
  //         </Card>
  //       ))}
  //     </div>
  //   );
  // }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {statsCards.map((stat, index) => (
        <Card key={index} data-testid={stat.testId} className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900" data-testid={`text-${stat.testId}-value`}>{stat.value}</h3>
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