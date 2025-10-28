import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import {
  Calendar,
  Plus,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Trash2
} from "lucide-react";
import { scheduleTaskApi } from "../services/adminApi";
import { useToast } from "../hooks/use-toast";

export default function AdminScheduling() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['scheduleTasks'],
    queryFn: () => scheduleTaskApi.getAll()
  });

  const tasks = data?.tasks || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => scheduleTaskApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduleTasks']);
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to delete task",
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => scheduleTaskApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduleTasks']);
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to update task",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status) => {
    const config = {
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
      pending: { label: "Pending", className: "bg-blue-100 text-blue-800" },
      "in-progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-800" },
      "in progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-800" },
      cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" }
    };
    return config[status] || config.scheduled;
  };

  const getTypeBadge = (type) => {
    const config = {
      reading: { label: "Reading", className: "bg-purple-100 text-purple-800" },
      maintenance: { label: "Maintenance", className: "bg-orange-100 text-orange-800" },
      installation: { label: "Installation", className: "bg-cyan-100 text-cyan-800" },
      repair: { label: "Repair", className: "bg-red-100 text-red-800" }
    };
    return config[type] || { label: type, className: "bg-gray-100 text-gray-800" };
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCompleteTask = (id) => {
    updateMutation.mutate({ id, data: { status: 'completed' } });
  };

  const stats = [
    {
      title: "Total Tasks",
      value: tasks.length,
      icon: Calendar,
      color: "text-teal-600",
      bgColor: "bg-teal-50"
    },
    {
      title: "Scheduled",
      value: tasks.filter(t => t.status === "scheduled" || t.status === "pending").length,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "In Progress",
      value: tasks.filter(t => t.status === "in progress").length,
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Completed",
      value: tasks.filter(t => t.status === "completed").length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto">
              <Skeleton className="h-8 w-64 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
              <Skeleton className="h-96" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-scheduling-title">
                      Task Scheduling
                    </h1>
                    <p className="text-gray-600">Schedule and manage maintenance tasks</p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.dispatchEvent(new Event("openTaskModal"))}
                  data-testid="button-schedule-task"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Task
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => {
                    const statusConfig = getStatusBadge(task.status);
                    const typeConfig = getTypeBadge(task.task_type);
                    const assignedTo = task.assigned_to ? 
                      `${task.assigned_to.first_name} ${task.assigned_to.last_name}` : 'Unassigned';
                    const scheduledDate = task.scheduled_date ? 
                      new Date(task.scheduled_date).toLocaleDateString() : 'N/A';
                    const scheduledTime = task.scheduled_time || 'N/A';
                    
                    return (
                      <div key={task._id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`task-${task._id}`}>
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{task.task_name || 'Untitled Task'}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="h-4 w-4 mr-1" />
                                {assignedTo}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                {scheduledDate} • {scheduledTime}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={typeConfig.className}>
                            {typeConfig.label}
                          </Badge>
                          <Badge className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                          {task.status !== 'completed' && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleCompleteTask(task._id)}
                              disabled={updateMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDelete(task._id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {tasks.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No tasks scheduled
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
