import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import {
  AlertTriangle,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  User,
  UserCheck,
  FileText
} from "lucide-react";
import { apiClient } from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import GenerateIncidentReportModal from "../components/modals/generate-incident-report-modal";

export default function AdminIncidents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ['incidents', statusFilter],
    queryFn: () => apiClient.getIncidentReports({ status: statusFilter !== 'all' ? statusFilter : undefined })
  });

 const incidents = data?.reports || [];

  console.log('incidents', incidents);


  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.reported_issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reporter_id?.first_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const config = {
      open: { label: "Open", className: "bg-blue-100 text-blue-800", icon: Clock },
      "in-progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      "in progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      resolved: { label: "Resolved", className: "bg-green-100 text-green-800", icon: CheckCircle },
      closed: { label: "Closed", className: "bg-gray-100 text-gray-800", icon: XCircle }
    };
    return config[status] || config.open;
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { label: "High", className: "bg-red-100 text-red-800" },
      medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Low", className: "bg-blue-100 text-blue-800" }
    };
    return config[priority] || config.medium;
  };

  const getTaskStatusBadge = (status) => {
    if (!status) return null;
    const config = {
      "Unassigned": { label: "Unassigned", className: "bg-gray-100 text-gray-800" },
      "Assigned": { label: "Assigned", className: "bg-blue-100 text-blue-800" },
      "Pending": { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
      "Completed": { label: "Completed", className: "bg-green-100 text-green-800" },
      "Cancelled": { label: "Cancelled", className: "bg-red-100 text-red-800" }
    };
    return config[status] || { label: status, className: "bg-gray-100 text-gray-800" };
  };

  const stats = [
    {
      title: "Total Incidents",
      value: incidents.length,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Open",
      value: incidents.filter(i => i.reported_issue_status === "open").length,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "In Progress",
      value: incidents.filter(i => i.reported_issue_status === "in progress").length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Resolved",
      value: incidents.filter(i => i.reported_issue_status === "resolved").length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
          <TopHeader />
          <main className="flex-1 overflow-auto p-6 relative z-10">
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
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TopHeader />
        
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-incidents-title">
                      Incident Management
                    </h1>
                    <p className="text-gray-600">Track and resolve water service issues</p>
                  </div>
                </div>
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

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search incidents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-incidents"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => setIsReportModalOpen(true)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Incidents ({filteredIncidents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredIncidents.map((incident) => {
                    const statusConfig = getStatusBadge(incident.reported_issue_status);
                    const priorityConfig = getPriorityBadge(incident.priority || 'medium');
                    const reporterName = incident.reported_by || 'NA'
                    const reportedDate = incident.reported_at ?
                      new Date(incident.reported_date).toLocaleString() : 'N/A';

                    // Get assignment information from the backend response
                    const assignedPersonnel = incident.assigned_personnel;
                    const taskStatus = incident.task_status;

                    return (
                      <div key={incident._id} className="p-4 border rounded-lg" data-testid={`incident-${incident._id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">{incident.type}</h4>
                              <Badge className={priorityConfig.className}>
                                {priorityConfig.label}
                              </Badge>
                              <Badge className={`${statusConfig.className} flex items-center`}>
                                <statusConfig.icon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{incident.description || 'No description'}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Reporter: {reporterName}
                              </span>
                              <span>Location: {incident.location || 'N/A'}</span>
                              <span>{reportedDate}</span>
                            </div>
                            {assignedPersonnel && (
                              <div className="mt-2 flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded">
                                  <UserCheck className="w-3 h-3" />
                                  <span className="font-medium">Assigned to:</span>
                                  <span>{assignedPersonnel.name || assignedPersonnel}</span>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedIncident(incident);
                                setViewDetailsOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                            {taskStatus && (
                              <Badge className={`${getTaskStatusBadge(taskStatus).className} flex items-center justify-center py-1`}>
                                {getTaskStatusBadge(taskStatus).label}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredIncidents.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No incidents found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* View Details Modal */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Incident Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this incident report
            </DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-4 py-4">
              {/* Type and Status Section */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="text-base font-semibold text-gray-900">{selectedIncident.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge className={`${getStatusBadge(selectedIncident.reported_issue_status).className} flex items-center w-fit`}>
                      {React.createElement(getStatusBadge(selectedIncident.reported_issue_status).icon, { className: "w-3 h-3 mr-1" })}
                      {getStatusBadge(selectedIncident.reported_issue_status).label}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Priority and Task Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <div className="mt-1">
                    <Badge className={getPriorityBadge(selectedIncident.priority || 'medium').className}>
                      {getPriorityBadge(selectedIncident.priority || 'medium').label}
                    </Badge>
                  </div>
                </div>
                {selectedIncident.task_status && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Task Status</label>
                    <div className="mt-1">
                      <Badge className={getTaskStatusBadge(selectedIncident.task_status).className}>
                        {getTaskStatusBadge(selectedIncident.task_status).label}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-sm text-gray-900 mt-1">{selectedIncident.description || 'No description provided'}</p>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-gray-600">Location</label>
                <p className="text-sm text-gray-900 mt-1">{selectedIncident.location || 'N/A'}</p>
              </div>

              {/* Reporter Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Reporter</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedIncident.reported_by || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Reported Date</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedIncident.reported_at ? new Date(selectedIncident.reported_date).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Assigned Personnel */}
              {selectedIncident.assigned_personnel && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-green-700" />
                    <div>
                      <label className="text-sm font-medium text-green-900">Assigned To</label>
                      <p className="text-sm text-green-800 mt-1">
                        {selectedIncident.assigned_personnel.name || selectedIncident.assigned_personnel}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Resolution Notes (if resolved) */}
              {selectedIncident.resolution_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Resolution Notes</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedIncident.resolution_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Incident Report Modal */}
      <GenerateIncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
