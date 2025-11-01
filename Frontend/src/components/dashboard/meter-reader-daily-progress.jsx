import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { BarChart3, Clock, CheckCircle, AlertTriangle, Target, Trophy } from "lucide-react";

export default function MeterReaderDailyProgress() {
  const { data: dailyProgress, isLoading } = useQuery({
    queryKey: ['/api/v1/meter-reader/daily-progress'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock data for development
  const mockProgress = {
    overview: {
      totalAssigned: 50,
      completed: 32,
      pending: 13,
      issues: 4,
      inProgress: 1,
      completionRate: 64,
      estimatedFinishTime: "14:30",
      efficiency: 92
    },
    timeBreakdown: {
      startTime: "08:00",
      currentTime: "11:30",
      timeSpent: "3h 30m",
      avgTimePerReading: "6.5 min",
      breakTime: "15 min"
    },
    performance: {
      accuracyRate: 98.5,
      photoComplianceRate: 95,
      issueReportRate: 8,
      dailyTarget: 45,
      weeklyAverage: 42
    },
    zoneProgress: {
      zone: 2,
      streetsCovered: 8,
      totalStreets: 12,
      completionByStreet: [
        { street: "Barangay St", total: 8, completed: 8, percentage: 100 },
        { street: "Main Ave", total: 12, completed: 10, percentage: 83 },
        { street: "Side St", total: 6, completed: 6, percentage: 100 },
        { street: "Hill Road", total: 9, completed: 4, percentage: 44 },
        { street: "Valley Dr", total: 15, completed: 4, percentage: 27 }
      ]
    }
  };

  const progress = dailyProgress || mockProgress;

  const getProgressColor = (percentage) => {
    if (percentage >= 90) return "text-green-600 bg-green-100";
    if (percentage >= 70) return "text-blue-600 bg-blue-100"; 
    if (percentage >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-blue-500";
    if (percentage >= 50) return "bg-yellow-500"; 
    return "bg-red-500";
  };

  // if (isLoading) {
  //   return (
  //     <Card>
  //       <CardHeader>
  //         <CardTitle className="text-lg font-semibold text-gray-900">Daily Progress Summary</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  //           {Array.from({ length: 3 }).map((_, index) => (
  //             <div key={index} className="space-y-4">
  //               <Skeleton className="h-6 w-32" />
  //               <Skeleton className="h-4 w-full" />
  //               <Skeleton className="h-4 w-full" />
  //               <Skeleton className="h-4 w-3/4" />
  //             </div>
  //           ))}
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Daily Progress Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Progress */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Overall Progress
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">Completion Rate</span>
                  <span className="text-lg font-bold text-blue-900">{progress.overview.completionRate}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress.overview.completionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  {progress.overview.completed} of {progress.overview.totalAssigned} readings
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border border-gray-200 rounded text-center">
                  <p className="text-lg font-bold text-green-600">{progress.overview.completed}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div className="p-2 border border-gray-200 rounded text-center">
                  <p className="text-lg font-bold text-yellow-600">{progress.overview.pending}</p>
                  <p className="text-xs text-gray-600">Pending</p>
                </div>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Est. Finish Time</span>
                  <span className="font-medium text-gray-900">{progress.overview.estimatedFinishTime}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-600">Efficiency</span>
                  <Badge className={getProgressColor(progress.overview.efficiency)}>
                    {progress.overview.efficiency}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Time Tracking */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Time Tracking
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Started</span>
                    <span className="font-medium">{progress.timeBreakdown.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Time</span>
                    <span className="font-medium">{progress.timeBreakdown.currentTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time Spent</span>
                    <span className="font-medium text-blue-600">{progress.timeBreakdown.timeSpent}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-green-700">Avg Time Per Reading</p>
                  <p className="text-xl font-bold text-green-900">{progress.timeBreakdown.avgTimePerReading}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 border border-gray-200 rounded text-center">
                  <p className="text-sm font-bold text-purple-600">{progress.performance.accuracyRate}%</p>
                  <p className="text-xs text-gray-600">Accuracy</p>
                </div>
                <div className="p-2 border border-gray-200 rounded text-center">
                  <p className="text-sm font-bold text-indigo-600">{progress.performance.photoComplianceRate}%</p>
                  <p className="text-xs text-gray-600">Photo Rate</p>
                </div>
              </div>
            </div>
          </div>

          {/* Zone Progress */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Trophy className="h-4 w-4 mr-2" />
              Zone {progress.zoneProgress.zone} Progress
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Streets Covered</p>
                  <p className="text-xl font-bold text-gray-900">
                    {progress.zoneProgress.streetsCovered} / {progress.zoneProgress.totalStreets}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {progress.zoneProgress.completionByStreet.map((street) => (
                  <div key={street.street} className="p-2 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{street.street}</span>
                      <Badge className={getProgressColor(street.percentage)}>
                        {street.percentage}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(street.percentage)}`}
                        style={{ width: `${street.percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {street.completed}/{street.total} readings
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}