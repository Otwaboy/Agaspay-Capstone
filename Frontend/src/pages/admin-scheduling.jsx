// import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import {
  Calendar,
  Plus,
  Clock,
  Users,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AdminScheduling() {
  const tasks = [
    {
      id: "TASK-001",
      title: "Meter Reading - Zone 1",
      assignedTo: "Mark Santos",
      type: "reading",
      date: "2024-01-20",
      time: "09:00 AM",
      status: "completed"
    },
    {
      id: "TASK-002",
      title: "Pipeline Maintenance - Purok 5",
      assignedTo: "Robert Cruz",
      type: "maintenance",
      date: "2024-01-22",
      time: "02:00 PM",
      status: "scheduled"
    },
    {
      id: "TASK-003",
      title: "New Connection Installation",
      assignedTo: "Mark Santos",
      type: "installation",
      date: "2024-01-23",
      time: "10:00 AM",
      status: "scheduled"
    },
    {
      id: "TASK-004",
      title: "Leak Repair - Zone 3",
      assignedTo: "Robert Cruz",
      type: "repair",
      date: "2024-01-21",
      time: "08:00 AM",
      status: "in-progress"
    }
  ];

  const getStatusBadge = (status) => {
    const config = {
      completed: { label: "Completed", className: "bg-green-100 text-green-800" },
      scheduled: { label: "Scheduled", className: "bg-blue-100 text-blue-800" },
      "in-progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-800" },
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
      value: tasks.filter(t => t.status === "scheduled").length,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "In Progress",
      value: tasks.filter(t => t.status === "in-progress").length,
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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
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

            {/* Stats Cards */}
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

            {/* Tasks List */}
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task) => {
                    const statusConfig = getStatusBadge(task.status);
                    const typeConfig = getTypeBadge(task.type);
                    return (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg" data-testid={`task-${task.id}`}>
                        <div className="flex items-center space-x-4 flex-1">
                          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-teal-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-sm text-gray-500">
                                <Users className="h-4 w-4 mr-1" />
                                {task.assignedTo}
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                {task.date} • {task.time}
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
