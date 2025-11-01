import { useQuery } from "@tanstack/react-query";
import { Gauge, CheckCircle, Clock, AlertTriangle, Route, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function MeterReaderStatsCards() {
  const { data: readerStats, isLoading } = useQuery({
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
      title: "Issues Reported",
      value: (stats.issuesReported?.count || 0).toString(),
      subtitle: `${stats.issuesReported?.resolved || 0} resolved`,
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      testId: "card-issues-reported"
    },
    {
      title: "Route Progress",
      value: `${stats.routeProgress?.percentage || 0}%`,
      subtitle: `ETA: ${stats.routeProgress?.estimatedCompletion || 'N/A'}`,
      icon: Route,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      testId: "card-route-progress"
    },
    {
      title: "Reading Accuracy",
      value: `${stats.accuracy?.percentage || 0}%`,
      subtitle: `${stats.accuracy?.errors || 0} errors`,
      icon: Target,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      testId: "card-reading-accuracy"
    },
    {
      title: "Daily Target",
      value: `${stats.totalAssigned?.percentage || 0}%`,
      subtitle: `${stats.totalAssigned?.count || 0} of ${stats.totalAssigned?.target || 0}`,
      icon: Gauge,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600",
      testId: "card-daily-target"
    }
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900" data-testid={`text-${stat.testId}-value`}>
                {stat.value}
              </div>
              {stat.subtitle && (
                <div className="text-sm text-gray-500 mt-1">
                  {stat.subtitle}
                </div>
              )}
              {stat.percentage && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{stat.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${stat.iconColor.replace('text-', 'bg-')}`}
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}