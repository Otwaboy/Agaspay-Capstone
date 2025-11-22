import { useQuery } from "@tanstack/react-query";
import { Gauge, CheckCircle, Clock, AlertTriangle, Route, Target, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function MeterReaderStatsCards() {
  const { data: readerStats } = useQuery({
    queryKey: ['/api/v1/meter-reader/daily-stats'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mock data structure for development
  const mockStats = {
    totalAssigned: {
      count: 45, 
      target: 50,
      percentage: 90
    },
    readingsCompleted: {
      count: 32,
      target: 45,
      percentage: 71
    },
    pendingReadings: {
      count: 13,
      urgent: 3
    },
    issuesReported: {
      count: 4,
      resolved: 2
    },
    routeProgress: {
      percentage: 68,
      estimatedCompletion: "14:30"
    },
    accuracy: {
      percentage: 98.5,
      errors: 2
    }
  };

  const stats = readerStats || mockStats;

  const statsCards = [
    {
      title: "Readings Completed",
      value: `${stats.readingsCompleted?.count || 0}/${stats.totalAssigned?.count || 0}`,
      percentage: stats.readingsCompleted?.percentage || 0,
      icon: CheckCircle,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      testId: "card-readings-completed"
    },
    {
      title: "Pending Readings",
      value: (stats.pendingReadings?.count || 0).toString(),
      subtitle: `${stats.pendingReadings?.urgent || 0} urgent`,
      icon: Clock,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      testId: "card-pending-readings"
    },
    {
      title: "Reading Status",
      value: (stats.issuesReported?.count || 0).toString(),
      subtitle: `${stats.issuesReported?.resolved || 0} resolved`,
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      testId: "card-issues-reported"
    },
  ];

  // if (isLoading) {
  //   return (
  //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  //       {Array.from({ length: 6 }).map((_, index) => (
  //         <Card key={index}>
  //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  //             <Skeleton className="h-4 w-24" />
  //             <Skeleton className="h-8 w-8 rounded" />
  //           </CardHeader>
  //           <CardContent>
  //             <Skeleton className="h-8 w-20 mb-2" />
  //             <Skeleton className="h-4 w-16" />
  //           </CardContent>
  //         </Card>
  //       ))}
  //     </div>
  //   );
  // }

  return (
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} data-testid={stat.testId} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900" data-testid={`text-${stat.testId}-value`}>
                    {stat.value}
                  </h3>
                  {stat.percentage ? (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium text-green-600">
                        {stat.percentage}%
                      </span>
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    </div>
                  ) : (
                    <div className="h-5 mt-2"></div>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {stat.subtitle || "Today's progress"}
                  </p>
                </div>

                {/* Mini bar chart */}
                <div className="flex items-end gap-0.5 h-12 ml-2">
                  {[30, 45, 35, 50, 40, 60, 55, 70, 65, 75].map((height, i) => (
                    <div
                      key={i}
                      className={`w-1.5 ${stat.iconColor.replace('text-', 'bg-')} opacity-${
                        i === 9 ? "100" : "40"
                      } rounded-sm`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}