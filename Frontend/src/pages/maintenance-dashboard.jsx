import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import MaintenanceSidebar from "../components/layout/maintenance-sidebar";
import MaintenanceTopHeader from "../components/layout/maintenance-top-header";
import MaintenanceFooter from "../components/layout/maintenance-footer";
import {
  Wrench,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Users
} from "lucide-react";
import { Link } from "wouter";

export default function MaintenanceDashboard() {
  // Fetch real incident data from backend
  const { data: incidentsData, isLoading: incidentsLoading } = useQuery({
    queryKey: ['/api/v1/incident-reports/all'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Process incidents data from API
  const processedIncidentsData = incidentsData?.incidents
    ? {
        total: incidentsData.incidents.length,
        pending: incidentsData.incidents.filter(i => i.reported_issue_status === 'Pending').length,
        inProgress: incidentsData.incidents.filter(i => i.reported_issue_status === 'In Progress').length,
        resolved: incidentsData.incidents.filter(i => i.reported_issue_status === 'Resolved').length,
        recentIncidents: incidentsData.incidents.slice(0, 2).map(incident => ({
          id: incident._id,
          type: incident.type,
          location: incident.location,
          reporter: incident.reported_by || 'Unknown',
          status: incident.reported_issue_status?.toLowerCase().replace(' ', '_') || 'pending',
          reportedDate: new Date(incident.createdAt).toLocaleDateString('en-US'),
          priority: incident.urgency_level?.toLowerCase() || 'medium'
        }))
      }
    : {
        total: 0,
        pending: 0,
        inProgress: 0,
        resolved: 0,
        recentIncidents: []
      };

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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <MaintenanceSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <MaintenanceTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Modern Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Incidents</p>
                      <h3 className="text-3xl font-bold text-gray-900">{processedIncidentsData.total || 0}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-blue-600">+12.5%</span>
                        <TrendingUp className="h-3 w-3 text-blue-600" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">All reported incidents</p>
                    </div>
                    <div className="flex items-end gap-0.5 h-12 ml-2">
                      {[30, 45, 35, 50, 40, 60, 55, 70, 65, 75].map((height, i) => (
                        <div
                          key={i}
                          className={`w-1.5 bg-blue-500 opacity-${i === 9 ? "100" : "40"} rounded-sm`}
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">Pending Tasks</p>
                      <h3 className="text-3xl font-bold text-gray-900">{processedIncidentsData.pending || 0}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-red-600">-8.2%</span>
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Awaiting assignment</p>
                    </div>
                    <div className="flex items-end gap-0.5 h-12 ml-2">
                      {[30, 45, 35, 50, 40, 60, 55, 70, 65, 75].map((height, i) => (
                        <div
                          key={i}
                          className={`w-1.5 bg-yellow-500 opacity-${i === 9 ? "100" : "40"} rounded-sm`}
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">In Progress</p>
                      <h3 className="text-3xl font-bold text-gray-900">{processedIncidentsData.inProgress || 0}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-blue-600">+5.3%</span>
                        <TrendingUp className="h-3 w-3 text-blue-600" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Being handled</p>
                    </div>
                    <div className="flex items-end gap-0.5 h-12 ml-2">
                      {[30, 45, 35, 50, 40, 60, 55, 70, 65, 75].map((height, i) => (
                        <div
                          key={i}
                          className={`w-1.5 bg-orange-500 opacity-${i === 9 ? "100" : "40"} rounded-sm`}
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
                      <h3 className="text-3xl font-bold text-gray-900">{processedIncidentsData.resolved || 0}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-medium text-blue-600">+18.7%</span>
                        <TrendingUp className="h-3 w-3 text-blue-600" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Fixed incidents</p>
                    </div>
                    <div className="flex items-end gap-0.5 h-12 ml-2">
                      {[30, 45, 35, 50, 40, 60, 55, 70, 65, 75].map((height, i) => (
                        <div
                          key={i}
                          className={`w-1.5 bg-green-500 opacity-${i === 9 ? "100" : "40"} rounded-sm`}
                          style={{ height: `${height}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Welcome Information Section */}
            <div className="mb-6 py-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Wrench className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    Welcome to AGASPAY Maintenance Portal
                  </h2>
                  <p className="text-base text-gray-700 mb-5 leading-relaxed">
                    As a maintenance personnel for Barangay Biking's water service, you are essential to maintaining
                    reliable water delivery to our community. This portal enables you to efficiently manage installation
                    tasks, handle disconnections, respond to incidents, and track your work assignments—all in one centralized system.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Wrench className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Task Management</h3>
                        <p className="text-sm text-gray-600">Track installations, repairs, and disconnections</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Incident Response</h3>
                        <p className="text-sm text-gray-600">Respond to and resolve reported incidents quickly</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">Work Tracking</h3>
                        <p className="text-sm text-gray-600">Monitor progress and update task status in real-time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Tasks */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                        Recent Incidents
                      </CardTitle>
                      <CardDescription>Latest reported incidents</CardDescription>
                    </div>
                    <Link href="/maintenance-dashboard/tasks">
                      <Button variant="outline" size="sm" data-testid="button-view-all-tasks">
                        View All
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent>
                    {incidentsLoading ? (
                      <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : processedIncidentsData.recentIncidents?.length > 0 ? (
                      <div className="space-y-3">
                        {processedIncidentsData.recentIncidents.map((task) => (
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
                                    Reporter: {task.reporter}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    <Clock className="h-3 w-3 inline mr-1" />
                                    {task.reportedDate}
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
                        <p className="text-gray-500">No recent incidents</p>
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
                    ) : processedIncidentsData?.recentIncidents?.length > 0 ? (
                      <div className="space-y-3">
                        {processedIncidentsData.recentIncidents.slice(0, 2).map((incident) => (
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
                        <span className="font-bold text-gray-900">{processedIncidentsData.total || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="font-bold text-yellow-600">{processedIncidentsData.pending || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">In Progress</span>
                        <span className="font-bold text-blue-600">{processedIncidentsData.inProgress || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Resolved</span>
                        <span className="font-bold text-green-600">{processedIncidentsData.resolved || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Footer */}
            <MaintenanceFooter />
          </div>
        </main>
      </div>
    </div>
  );
}
