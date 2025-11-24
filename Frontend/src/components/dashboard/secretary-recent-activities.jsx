import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { AlertTriangle, Calendar, Clock, ArrowRight, XCircle, User } from "lucide-react";
import { Link } from "wouter";
import apiClient from "../../lib/api";

export default function SecretaryRecentActivities() {
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ["cancelled-pending-tasks"],
    queryFn: () => apiClient.getScheduleTasks(),
  });

  // Filter to get only cancelled and pending tasks, then get the 5 most recent
  const filteredTasks = tasksData?.tasks?.filter(task =>
    task.task_status?.toLowerCase() === 'cancelled' ||
    task.task_status?.toLowerCase() === 'pending'
  ).slice(0, 5) || [];
  console.log(filteredTasks);


  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return "bg-red-100 text-red-800 border-red-200";
      case 'high':
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 'medium':
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 'low':
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cancelled & Pending Tasks</CardTitle>
          <CardDescription>Tasks requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cancelled & Pending Tasks</CardTitle>
          <CardDescription>Tasks requiring attention</CardDescription>
        </div>
        <Link href="/secretary-dashboard/appointments">
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No cancelled or pending tasks found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task._id || task.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                <div className={`p-2 rounded-full ${
                  task.task_status?.toLowerCase() === 'cancelled'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {task.task_status?.toLowerCase() === 'cancelled' ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{task.type || task.title || "Task"}</p>
                    {getStatusBadge(task.task_status)}
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-gray-600 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(task.schedule_date)}
                    </p>
                    {task.schedule_time && (
                      <p className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {task.schedule_time}
                      </p>
                    )}
                  </div>
                  {task.priority && (
                    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold mt-2 ${getPriorityBadge(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                  )}
                  {task.location && (
                    <p className="text-xs text-gray-500 mt-1">
                      Location: {task.location}
                    </p>
                  )}
                  {task.assigned_to ? (
                    <p className="text-xs text-gray-600 mt-1 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      Assigned to: <span className="font-medium ml-1">{task.assigned_to.name}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1 italic flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      No personnel assigned
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}