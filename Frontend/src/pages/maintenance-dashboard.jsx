import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import MaintenanceSidebar from "../components/layout/maintenance-sidebar";
import MaintenanceTopHeader from "../components/layout/maintenance-top-header";
import {
  Wrench,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import { Link } from "wouter";

export default function MaintenanceDashboard() {
  // Mock data - replace with actual API calls
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/maintenance/tasks'],
    queryFn: async () => {
      // Replace with actual API call
      return {
        total: 24,
        pending: 8,
        inProgress: 5,
        completed: 11,
        todayTasks: [
          {
            id: 1,
            type: 'Installation',
            location: 'Purok 4, Biking 1',
            resident: 'Juan Dela Cruz',
            status: 'pending',
            priority: 'high',
            scheduledTime: '09:00 AM'
          },
          {
            id: 2,
            type: 'Disconnection',
            location: 'Purok 2, Biking 2',
            resident: 'Maria Santos',
            status: 'in_progress',
            priority: 'medium',
            scheduledTime: '10:30 AM'
          },
          {
            id: 3,
            type: 'Repair',
            location: 'Purok 7, Biking 3',
            resident: 'Pedro Garcia',
            status: 'pending',
            priority: 'urgent',
            scheduledTime: '02:00 PM'
          }
        ]
      };
    },
    retry: 1
  });

  const { data: incidentsData, isLoading: incidentsLoading } = useQuery({
    queryKey: ['/api/maintenance/incidents'],
    queryFn: async () => {
      // Replace with actual API call
      return {
        total: 15,
        pending: 6,
        inProgress: 4,
        resolved: 5,
        recentIncidents: [
          {
            id: 1,
            type: 'Pipe Leak',
            location: 'Purok 5, Biking 1',
            reporter: 'Anna Cruz',
            status: 'pending',
            reportedDate: '2025-10-15',
            priority: 'urgent'
          },
          {
            id: 2,
            type: 'Water Outage',
            location: 'Purok 3, Biking 2',
            reporter: 'Jose Reyes',
            status: 'in_progress',
            reportedDate: '2025-10-14',
            priority: 'high'
          }
        ]
      };
    },
    retry: 1
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{priority}</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <MaintenanceSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MaintenanceTopHeader />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-dashboard-title">
                Maintenance Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your assigned tasks and incident reports
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Wrench className="h-4 w-4 mr-2" />
                    Total Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">
                    {tasksData?.total || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">All assigned tasks</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {tasksData?.pending || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Awaiting action</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Activity className="h-4 w-4 mr-2" />
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {tasksData?.inProgress || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Currently working</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {tasksData?.completed || 0}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">This month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Tasks */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                        Today's Schedule
                      </CardTitle>
                      <CardDescription>Tasks assigned for today</CardDescription>
                    </div>
                    <Link href="/maintenance-dashboard/tasks">
                      <Button variant="outline" size="sm" data-testid="button-view-all-tasks">
                        View All
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {tasksLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : tasksData?.todayTasks?.length > 0 ? (
                      <div className="space-y-3">
                        {tasksData.todayTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                            data-testid={`task-card-${task.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold text-gray-900">{task.type}</h4>
                                  {getStatusBadge(task.status)}
                                  {getPriorityBadge(task.priority)}
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm text-gray-600">
                                    <MapPin className="h-3 w-3 inline mr-1" />
                                    {task.location}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Resident: {task.resident}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {task.scheduledTime}
                                  </p>
                                </div>
                              </div>
                              <Button size="sm" variant="outline" data-testid={`button-update-${task.id}`}>
                                Update Status
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No tasks scheduled for today</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Incidents */}
              <div>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-base">
                        <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                        Recent Incidents
                      </CardTitle>
                    </div>
                    <Link href="/maintenance-dashboard/incidents">
                      <Button variant="ghost" size="sm" data-testid="button-view-all-incidents">
                        View All
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {incidentsLoading ? (
                      <div className="space-y-3">
                        {[...Array(2)].map((_, i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : incidentsData?.recentIncidents?.length > 0 ? (
                      <div className="space-y-3">
                        {incidentsData.recentIncidents.map((incident) => (
                          <div
                            key={incident.id}
                            className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                            data-testid={`incident-card-${incident.id}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-sm text-gray-900">{incident.type}</h5>
                              {getPriorityBadge(incident.priority)}
                            </div>
                            <p className="text-xs text-gray-600 mb-1">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              {incident.location}
                            </p>
                            <p className="text-xs text-gray-500">
                              Reporter: {incident.reporter}
                            </p>
                            {getStatusBadge(incident.status)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <AlertTriangle className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No recent incidents</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                      Incident Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Reports</span>
                        <span className="font-bold text-gray-900">{incidentsData?.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="font-bold text-yellow-600">{incidentsData?.pending || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">In Progress</span>
                        <span className="font-bold text-blue-600">{incidentsData?.inProgress || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Resolved</span>
                        <span className="font-bold text-green-600">{incidentsData?.resolved || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
