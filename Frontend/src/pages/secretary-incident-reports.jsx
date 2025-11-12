import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select"; 
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Search, Eye, AlertTriangle, CheckCircle, Clock, AlertCircle, Loader2, Calendar, Plus } from "lucide-react";
import { apiClient } from "../lib/api";
import { queryClient } from "../lib/query-client";
import { useToast } from "../hooks/use-toast";

export default function SecretaryIncidentReports() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false);

  // No task form state needed - will use incident report data directly

  // Status update state
  const [newStatus, setNewStatus] = useState("");

  // Fetch incident reports from backend
  const { data: reportsData, isLoading, error } = useQuery({
    queryKey: ['/api/v1/incident-reports'],
    queryFn: () => apiClient.getIncidentReports(),
  });

  // Fetch schedule tasks
  const { data: tasksData } = useQuery({
    queryKey: ['/api/v1/schedule-tasks'],
    queryFn: () => apiClient.getScheduleTasks(),
  });

  const reports = reportsData?.reports || [];
  const tasks = tasksData?.tasks || [];

  // Get related tasks for a report
  const getRelatedTasks = (reportId) => {
    return tasks.filter(task => task.report_id?._id === reportId || task.report_id === reportId);
  };

  // Issue types from backend schema
  const issueTypes = [
    "No Water Supply",
    "Low Water Pressure",
    "Pipe Leak",
    "Water Quality Issue",
    "Meter Problem",
    "Damaged Infrastructure",
    "Other"
  ];


  // Filter reports based on search and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reported_by?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || report.reported_issue_status === filterStatus;
    const matchesType = filterType === "all" || report.type === filterType;
    const matchesUrgency = filterUrgency === "all" || report.urgency_level === filterUrgency;
    
    return matchesSearch && matchesStatus && matchesType && matchesUrgency;
  });

  // Create schedule task mutation with automatic scheduling
  const createTaskMutation = useMutation({
    mutationFn: (taskData) => apiClient.createScheduleTask(taskData),
    onSuccess: (data) => {
      toast({
        title: "Task Scheduled Successfully",
        description: data.message || "Task has been automatically scheduled with available personnel",
        variant: "default",
        duration: 6000
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/schedule-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/incident-reports'] });
      setCreateTaskOpen(false);
    },
    onError: (error) => { 
      toast({
        title: "Error",
        description: error.message || "Failed to create schedule task",
        variant: "destructive",
      });
    },
  });

  // Update report status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ reportId, status }) => 
      apiClient.updateIncidentReport(reportId, { reported_issue_status: status }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Report status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/incident-reports'] });
      setUpdateStatusOpen(false);
      setNewStatus("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update report status",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (report) => {
    setSelectedReport(report);
    setViewDetailsOpen(true);
  };

  const handleCreateTask = () => {
    setCreateTaskOpen(true);
  };

  const handleUpdateStatus = () => {
    setNewStatus(selectedReport?.reported_issue_status || "Pending");
    setUpdateStatusOpen(true);
  };

  const submitCreateTask = () => {
    if (!selectedReport) {
      toast({
        title: "Error",
        description: "No report selected",
        variant: "destructive",
      });
      return;
    }

    // Use incident report data directly for task creation
    createTaskMutation.mutate({
      report_id: selectedReport._id,
      // schedule_type: selectedReport.type, // Use the incident report type
      description: `${selectedReport.type} reported at ${selectedReport.location}. ${selectedReport.description || ''}`.trim(),
    });
  };

  const submitUpdateStatus = () => {
    if (!newStatus) {
      toast({
        title: "Validation Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }

    updateStatusMutation.mutate({
      reportId: selectedReport._id,
      status: newStatus,
    });
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  // Status configuration
  const statusConfig = {
    Pending: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
    Cancelled: { color: "bg-red-100 text-blue-700", label: "Cancelled" },
    Completed: { color: "bg-green-100 text-green-700", label: "Completed" },
    Scheduled: { color: "bg-blue-100 text-green-700", label: "Scheduled" },
  };

  // Urgency configuration
  const urgencyConfig = {
    low: { color: "bg-gray-100 text-gray-700", label: "Low", icon: Clock },
    medium: { color: "bg-blue-100 text-blue-700", label: "Medium", icon: AlertCircle },
    high: { color: "bg-orange-100 text-orange-700", label: "High", icon: AlertTriangle },
    critical: { color: "bg-red-100 text-red-700", label: "Critical", icon: AlertTriangle },
  };

  // Task status configuration
  const taskStatusConfig = {
     Pending: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
    Cancelled: { color: "bg-red-100 text-blue-700", label: "Cancelled" },
    Completed: { color: "bg-green-100 text-green-700", label: "Completed" },
    Scheduled: { color: "bg-blue-100 text-green-700", label: "Scheduled" },
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SecretarySidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <SecretaryTopHeader />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">
                Incident Reports Management
              </h1>
              <p className="text-gray-600 mt-2">
                Monitor and manage water service incident reports from residents
              </p>
            </div> 

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Reports</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="stat-total">
                        {isLoading ? "..." : reports.length}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600" data-testid="stat-pending">
                        {isLoading ? "..." : reports.filter(r => r.reported_issue_status === "Pending").length}
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-blue-600" data-testid="stat-in-progress">
                        {isLoading ? "..." : reports.filter(r => r.reported_issue_status === "In Progress").length}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600" data-testid="stat-completed">
                        {isLoading ? "..." : reports.filter(r => r.reported_issue_status === "Completed").length}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Card>
              <CardHeader>
                <CardTitle>Incident Reports</CardTitle>
                <CardDescription>
                  View and manage all water service incident reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by location, type, or reporter name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-56" data-testid="select-type-filter">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {issueTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-urgency-filter">
                      <SelectValue placeholder="Filter by urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Urgency</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600">Loading incident reports...</span>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <p className="text-red-600">Failed to load incident reports: {error.message}</p>
                  </div>
                )}

                {/* Table */}
                {!isLoading && !error && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Report ID</TableHead>
                          <TableHead>Reporter</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Date Reported</TableHead>
                          <TableHead>Urgency</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReports.length > 0 ? (
                          filteredReports.map((report) => (
                            <TableRow key={report._id} data-testid={`row-report-${report._id}`}>
                              <TableCell className="font-mono text-sm">
                                {report._id?.substring(0, 8)}...
                              </TableCell>
                              <TableCell className="font-medium">
                                {report.reported_by || "Unknown"}
                              </TableCell>
                              <TableCell>{report.type}</TableCell>
                              <TableCell className="max-w-xs truncate">{report.location}</TableCell>
                              <TableCell>
                                {report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "N/A"}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={urgencyConfig[report.urgency_level]?.color || "bg-gray-100 text-gray-700"} 
                                  data-testid={`badge-urgency-${report._id}`}
                                >
                                  {urgencyConfig[report.urgency_level]?.label || report.urgency_level}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={statusConfig[report.reported_issue_status]?.color || "bg-gray-100 text-gray-700"} 
                                  data-testid={`badge-status-${report._id}`}
                                >
                                  {statusConfig[report.reported_issue_status]?.label || report.reported_issue_status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(report)}
                                  data-testid={`button-view-${report._id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                              No incident reports found matching your criteria
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Incident Report Details</DialogTitle>
            <DialogDescription>
              Complete information about the reported incident
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              {/* Reporter Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Reporter Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900 mt-1">{selectedReport.reported_by || "Unknown"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Report ID</label>
                    <p className="text-gray-900 mt-1 font-mono text-sm">{selectedReport._id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date Reported</label>
                    <p className="text-gray-900 mt-1">
                      {selectedReport.createdAt ? new Date(selectedReport.createdAt).toLocaleString() : "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reporter Type</label>
                    <p className="text-gray-900 mt-1">{selectedReport.reported_by_model || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Incident Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Incident Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Issue Type</label>
                    <p className="text-gray-900 mt-1">{selectedReport.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Urgency Level</label>
                    <div className="mt-1">
                      <Badge className={urgencyConfig[selectedReport.urgency_level]?.color || "bg-gray-100 text-gray-700"}>
                        {urgencyConfig[selectedReport.urgency_level]?.label || selectedReport.urgency_level}
                      </Badge>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="text-gray-900 mt-1">{selectedReport.location}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedReport.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Status Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Current Status</label>
                    <div className="mt-1">
                      <Badge className={statusConfig[selectedReport.reported_issue_status]?.color || "bg-gray-100 text-gray-700"}>
                        {statusConfig[selectedReport.reported_issue_status]?.label || selectedReport.reported_issue_status}
                      </Badge>
                    </div>
                  </div>
                  {selectedReport.resolved_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Resolved At</label>
                      <p className="text-gray-900 mt-1">
                        {new Date(selectedReport.resolved_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Tasks */}
              {getRelatedTasks(selectedReport._id).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Related Schedule Tasks</h3>
                  <div className="space-y-2">
                    {getRelatedTasks(selectedReport._id).map(task => (
                      <div key={task._id} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{task.task_type}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(task.schedule_date).toLocaleDateString()} at {task.schedule_time}
                            </p>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                          </div>
                          <Badge className={taskStatusConfig[task.task_status]?.color || "bg-gray-100 text-gray-700"}>
                            {task.task_status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setViewDetailsOpen(false)} 
                  data-testid="button-close-dialog"
                >
                  Close
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleUpdateStatus}
                  data-testid="button-update-status"
                >
                  Update Status
                </Button>
                <Button 
                  onClick={handleCreateTask}
                  data-testid="button-create-task"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Schedule Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Schedule Task Dialog */}
      <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Maintenance Task</DialogTitle>
            <DialogDescription>
              Create a maintenance task with automatic personnel assignment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedReport && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Incident Report Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">{selectedReport.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-gray-900">{selectedReport.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Urgency:</span>
                    <Badge className={urgencyConfig[selectedReport.urgency_level]?.color || "bg-gray-100 text-gray-700"}>
                      {urgencyConfig[selectedReport.urgency_level]?.label || selectedReport.urgency_level}
                    </Badge>
                  </div>
                  {selectedReport.description && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-600 block mb-1">Description:</span>
                      <p className="text-gray-900">{selectedReport.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Auto-scheduling Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Automatic Scheduling</p>
                  <p className="text-xs text-blue-700 mt-1">
                    The system will automatically create a task based on this incident report, assign it to the next available maintenance personnel, and schedule it for the next business day.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCreateTaskOpen(false)}
                data-testid="button-cancel-task"
              >
                Cancel
              </Button>
              <Button
                onClick={submitCreateTask}
                disabled={createTaskMutation.isPending}
                data-testid="button-submit-task"
              >
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Task
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateStatusOpen} onOpenChange={setUpdateStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Report Status</DialogTitle>
            <DialogDescription>
              Change the status of this incident report
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-status">New Status *</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger id="new-status" data-testid="select-new-status">
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedReport && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Current Status:</strong>{" "}
                  <Badge className={statusConfig[selectedReport.reported_issue_status]?.color}>
                    {selectedReport.reported_issue_status}
                  </Badge>
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setUpdateStatusOpen(false);
                  setNewStatus("");
                }}
                data-testid="button-cancel-status"
              >
                Cancel
              </Button>
              <Button
                onClick={submitUpdateStatus}
                disabled={updateStatusMutation.isPending}
                data-testid="button-submit-status"
              >
                {updateStatusMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}