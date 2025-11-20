import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
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
  DialogFooter,
} from "../components/ui/dialog";
import { 
  Search, 
  ClipboardList, 
  UserPlus, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Wrench
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../lib/api";

export default function SecretaryAssignments() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("Priority");
  const [filterStatus, setFilterStatus] = useState("Status");
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  // Data states
  const [unassignedTasks, setUnassignedTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [maintenancePersonnel, setMaintenancePersonnel] = useState([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Reschedule states
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [reschedulePersonnel, setReschedulePersonnel] = useState("");
  const [availabilityData, setAvailabilityData] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [unassignedResponse, assignmentsResponse, personnelResponse] = await Promise.all([
        apiClient.getUnassignedTasks(),
        apiClient.getAssignments(),
        apiClient.getMaintenancePersonnel(),
      ]);

      console.log('📋 Unassigned Tasks:', unassignedResponse);
      console.log('✅ Assignments:', assignmentsResponse);
      console.log('👷 Personnel:', personnelResponse);

      setUnassignedTasks(unassignedResponse.tasks || []);
      setAssignments(assignmentsResponse.assignments || []);
      setMaintenancePersonnel(personnelResponse.personnel || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error("Error", { description: "Failed to load data. Please refresh the page." });
    } finally {
      setLoading(false);
    }
  };

  // Combine unassigned tasks and assignments for display
  const allTasks = [
    ...unassignedTasks.map(task => ({
      id: task.id,
      type: task.task_type === 'disconnection' ? 'Water Disconnection'
            : task.task_type === 'reconnection' ? 'Water Reconnection'
            : task.report?.type || 'Incident',
      location: task.report?.location || task.location || 'N/A',
      scheduledDate: task.schedule_date,
      timeSlot: task.schedule_time,
      priority: task.report?.urgency_level?.toLowerCase() || task.priority || 'medium',
      status: 'Unassigned',
      assignedTo: null,
      notes: '',
      reportDescription: task.description || task.report?.description || '',
    })),

    ...assignments.map(assignment => ({
      id: assignment.task.id,
      assignmentId: assignment.id,
      type: assignment.task.task_type === 'disconnection' ? 'Water Disconnection'
            : assignment.task.task_type === 'reconnection' ? 'Water Reconnection'
            : assignment.task.type || 'Incident',
      location: assignment.task.location || 'N/A',
      scheduledDate: assignment.task.schedule_date,
      timeSlot: assignment.task.schedule_time,
      priority: assignment.task.urgency_lvl?.toLowerCase() || assignment.task.priority || 'medium',
      status: assignment.task.task_status,
      assignedTo: assignment.personnel.name,
      assignedToId: assignment.personnel.id,
      assignedToContact: assignment.personnel.contact_no,
      notes: '',
      reportDescription: assignment.task.description || '',
    })),
  ];

  // Filter tasks
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = 
      task.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = filterPriority === "Priority" || task.priority === filterPriority;
    
    const matchesStatus = 
      filterStatus === "Status" ||
      (filterStatus === "Unassigned" && task.status === "Unassigned") ||
      (filterStatus === "Assigned" && task.status === "Assigned") ||
      (filterStatus === "Pending" && task.status === "Pending") ||
      (filterStatus === "Completed" && task.status === "Completed") ||
      (filterStatus === "Cancelled" && task.status === "Cancelled");
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleAssignTask = async (task) => {
    setSelectedTask(task);
    setSelectedPersonnel("");
    
    // Fetch personnel with availability for this task's date/time
    try {
      const personnelResponse = await apiClient.getMaintenancePersonnel(
        task.scheduledDate,
        task.timeSlot
      );
      
      console.log('👷 Personnel with availability:', personnelResponse);
      setMaintenancePersonnel(personnelResponse.personnel || []);
    } catch (error) {
      console.error('Error fetching personnel availability:', error);
      toast.success("Warning", { description: "Could not check personnel availability. Showing all personnel." });
    }
    
    setAssignModalOpen(true);
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setViewDetailsOpen(true);
  };

  const handleSubmitAssignment = async () => {
    if (!selectedPersonnel) {
      toast.error("Validation Error", { description: "Please select a maintenance personnel" });
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.createAssignment({
        task_id: selectedTask.id,
        assigned_to: selectedPersonnel,
      });

      toast.success("Success", { description: "Task assigned successfully" });

      setAssignModalOpen(false);
      await fetchAllData();
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error("Assignment Failed", { description: error.message || "Failed to assign task. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReassignTask = async (task) => {
    try {
      const newPersonnel = prompt(
        "Select new maintenance personnel ID (or enter contact to search):"
      );
      if (!newPersonnel) return;

      await apiClient.updateAssignment(task.assignmentId, {
        assigned_to: newPersonnel,
      });

      toast.success("Success", { description: "Task reassigned successfully" });

      await fetchAllData();
    } catch (error) {
      console.error('Reassignment error:', error);
      toast.error("Reassignment Failed", { description: error.message || "Failed to reassign task." });
    }
  };

  const handleUnassignTask = async (task) => {
    if (!confirm("Are you sure you want to unassign this task?")) return;

    try {
      await apiClient.deleteAssignment(task.assignmentId);

      toast.success("Success", { description: "Task unassigned successfully" });

      await fetchAllData();
    } catch (error) {
      console.error('Unassignment error:', error);
      toast.error("Unassignment Failed", { description: error.message || "Failed to unassign task." });
    }
  };

  const handleRescheduleTask = async (task) => {
    setSelectedTask(task);
    // Initialize with current values
    setRescheduleDate(task.scheduledDate?.split('T')[0] || "");
    setRescheduleTime(task.timeSlot || "");
    setReschedulePersonnel(task.assignedToId || "");
    setRescheduleModalOpen(true);
  };

  const checkAvailability = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      toast.error("Missing Information", { description: "Please select both date and time to check availability" });
      return;
    }

    try {
      setLoadingAvailability(true);
      const response = await apiClient.getPersonnelAvailability(rescheduleDate, rescheduleTime);
      setAvailabilityData(response.personnel || []);
    } catch (error) {
      console.error('Availability check error:', error);
      toast.error("Error", { description: "Failed to check personnel availability" });
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime || !reschedulePersonnel) {
      toast.error("Missing Information", { description: "Please fill all required fields" });
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.rescheduleAssignment(
        selectedTask.assignmentId,
        rescheduleDate,
        rescheduleTime,
        reschedulePersonnel
      );

      toast.success("Success!", { description: "Task rescheduled successfully" });

      setRescheduleModalOpen(false);
      await fetchAllData();
    } catch (error) {
      console.error('Reschedule error:', error);
      toast.error("Reschedule Failed", { description: error.response?.data?.message || error.message || "Failed to reschedule task" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const priorityConfig = {
    low: { color: "bg-blue-100 text-blue-700", label: "Low", icon: Clock },
    medium: { color: "bg-yellow-100 text-yellow-700", label: "Medium", icon: AlertTriangle },
    high: { color: "bg-orange-100 text-orange-700", label: "High", icon: AlertTriangle },
    critical: { color: "bg-red-100 text-red-700", label: "Critical", icon: AlertTriangle },
  };

  const statusConfig = {
    Unassigned: { color: "bg-gray-100 text-gray-700", label: "Unassigned" },
    Assigned: { color: "bg-blue-100 text-blue-700", label: "Assigned" },
    Completed: { color: "bg-green-100 text-green-700", label: "Completed" },
    Pending: { color: "bg-orange-100 text-orange-700", label: "Pending" },
    Cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled" },
  };

  const unassignedCount = allTasks.filter(t => t.status === "Unassigned").length;
  const assignedCount = allTasks.filter(t => t.status !== "Unassigned").length;
  const urgentCount = allTasks.filter(t => t.priority === "high" || t.priority === "critical").length;

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
                Task Assignment Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Assign scheduled maintenance tasks to personnel
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="stat-total-tasks">
                        {allTasks.length}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <ClipboardList className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Unassigned</p>
                      <p className="text-2xl font-bold text-yellow-600" data-testid="stat-unassigned">
                        {unassignedCount}
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
                      <p className="text-sm font-medium text-gray-600">Assigned</p>
                      <p className="text-2xl font-bold text-green-600" data-testid="stat-assigned">
                        {assignedCount}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Urgent Tasks</p>
                      <p className="text-2xl font-bold text-red-600" data-testid="stat-urgent">
                        {urgentCount}
                      </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Task Assignments</CardTitle>
                    <CardDescription>
                      Manage task assignments to maintenance personnel
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by task type, location, or personnel..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-priority-filter">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Priority">All Priorities</SelectItem>
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
                      <SelectItem value="Status">All Status</SelectItem>
                      <SelectItem value="Assigned">Assigned</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                       <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading tasks...</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Task Type</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Scheduled</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTasks.length > 0 ? (
                          filteredTasks.map((task) => (
                            <TableRow key={task.id} data-testid={`row-task-${task.id}`}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <Wrench className="h-4 w-4 text-gray-400" />
                                  {task.type}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  {task.location}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  <div>
                                    <div className="text-sm">
                                      {new Date(task.scheduledDate).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-500">{task.timeSlot}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={priorityConfig[task.priority]?.color} 
                                  data-testid={`badge-priority-${task.id}`}
                                >
                                  {priorityConfig[task.priority]?.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  className={statusConfig[task.status]?.color}
                                  data-testid={`badge-status-${task.id}`}
                                >
                                  {statusConfig[task.status]?.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {task.assignedTo ? (
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm">{task.assignedTo}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">Unassigned</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {task.status === "Unassigned" ? (
                                    <Button
                                      size="sm"
                                      onClick={() => handleAssignTask(task)}
                                      data-testid={`button-assign-${task.id}`}
                                    >
                                      <UserPlus className="h-4 w-4 mr-1" />
                                      Assign
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewDetails(task)}
                                        data-testid={`button-view-${task.id}`}
                                      >
                                        View
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleRescheduleTask(task)}
                                        data-testid={`button-reschedule-${task.id}`}
                                      >
                                        Reschedule
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              No tasks found matching your criteria
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

      {/* Assign Task Modal */}
      <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Task to Maintenance Personnel</DialogTitle>
            <DialogDescription>
              Select a maintenance personnel to assign this task
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              {/* Task Summary Card */}
              <Card className="bg-gray-50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Task Type</label>
                      <p className="text-gray-900 mt-1">{selectedTask.type}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Priority</label>
                      <div className="mt-1">
                        <Badge className={priorityConfig[selectedTask.priority]?.color}>
                          {priorityConfig[selectedTask.priority]?.label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Location</label>
                      <p className="text-gray-900 mt-1">{selectedTask.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Scheduled</label>
                      <p className="text-gray-900 mt-1">
                        {new Date(selectedTask.scheduledDate).toLocaleDateString()} - {selectedTask.timeSlot}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personnel Selection */}
              <div>
                <Label htmlFor="personnel">Select Maintenance Personnel</Label>
                <p className="text-xs text-gray-500 mt-1 mb-2">
                  {maintenancePersonnel.some(p => !p.isAvailable) && 
                    "⚠️ Personnel with red badges are already scheduled at this time"}
                </p>
                <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                  <SelectTrigger className="mt-2" data-testid="select-personnel">
                    <SelectValue placeholder="Choose personnel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenancePersonnel.length > 0 ? (
                      maintenancePersonnel.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          <div className="flex items-center justify-between w-full gap-3">
                            <div className="flex-1">
                              <div className="font-medium">{person.name}</div>
                              <div className="text-xs text-gray-500">
                                {person.contact_no}
                                {person.assigned_zone && ` • Zone ${person.assigned_zone}`}
                              </div>
                              {!person.isAvailable && person.conflictingTasks?.length > 0 && (
                                <div className="text-xs text-red-600 mt-0.5">
                                  Conflict: {person.conflictingTasks[0].time}
                                  {person.conflictingTasks.length > 1 && 
                                    ` (+${person.conflictingTasks.length - 1} more)`}
                                </div>
                              )}
                            </div>
                            <Badge 
                              className={
                                person.isAvailable 
                                  ? "bg-green-100 text-green-700 shrink-0" 
                                  : "bg-red-100 text-red-700 shrink-0"
                              }
                            >
                              {person.isAvailable ? "✓ Available" : "✗ Busy"}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No maintenance personnel available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                
                {/* Show warning if selected personnel is not available */}
                {selectedPersonnel && !maintenancePersonnel.find(p => p.id === selectedPersonnel)?.isAvailable && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-900">Scheduling Conflict Warning</p>
                        <p className="text-yellow-700 mt-1">
                          This personnel is already scheduled at this time. Assigning this task may cause conflicts.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setAssignModalOpen(false)} 
              disabled={submitting}
              data-testid="button-cancel-assign"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAssignment} 
              disabled={submitting || !selectedPersonnel}
              data-testid="button-confirm-assign"
            >
              {submitting ? "Assigning..." : "Assign Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Task Assignment Details</DialogTitle>
            <DialogDescription>
              Complete information about the task and assignment
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Task Type</label>
                  <p className="text-gray-900 mt-1">{selectedTask.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <div className="mt-1">
                    <Badge className={priorityConfig[selectedTask.priority]?.color}>
                      {priorityConfig[selectedTask.priority]?.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <p className="text-gray-900 mt-1">{selectedTask.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={statusConfig[selectedTask.status]?.color}>
                      {statusConfig[selectedTask.status]?.label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Scheduled Date</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(selectedTask.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Time Slot</label>
                  <p className="text-gray-900 mt-1">{selectedTask.timeSlot}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Assigned To</label>
                  <p className="text-gray-900 mt-1">
                    {selectedTask.assignedTo || "Not assigned"}
                  </p>
                  {selectedTask.assignedToContact && (
                    <p className="text-sm text-gray-500 mt-1">
                      Contact: {selectedTask.assignedToContact}
                    </p>
                  )}
                </div>
                {selectedTask.notes && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-gray-900 mt-1">{selectedTask.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setViewDetailsOpen(false)} 
                  data-testid="button-close-details"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reschedule Task</DialogTitle>
            <DialogDescription>
              Update the schedule and assignment for this task
            </DialogDescription>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-4">
              {/* Current Task Info */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Task Type</p>
                      <p className="font-medium">{selectedTask.type}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Location</p>
                      <p className="font-medium">{selectedTask.location}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Current Schedule</p>
                      <p className="font-medium">
                        {new Date(selectedTask.scheduledDate).toLocaleDateString()} at {selectedTask.timeSlot}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Currently Assigned To</p>
                      <p className="font-medium">{selectedTask.assignedTo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* New Schedule Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reschedule-date">New Date *</Label>
                    <Input
                      id="reschedule-date"
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reschedule-time">New Time *</Label>
                    <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                      <SelectTrigger id="reschedule-time">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="09:30">09:30 AM</SelectItem>
                        <SelectItem value="10:30">10:30 AM</SelectItem>
                        <SelectItem value="13:30">01:30 PM</SelectItem>
                        <SelectItem value="14:30">02:30 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Check Availability Button */}
                <Button
                  onClick={checkAvailability}
                  disabled={!rescheduleDate || !rescheduleTime || loadingAvailability}
                  className="w-full"
                  variant="outline"
                >
                  {loadingAvailability ? "Checking..." : "Check Personnel Availability"}
                </Button>

                {/* Personnel Selection with Availability */}
                {availabilityData.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Personnel *</Label>
                    <div className="grid gap-2 max-h-60 overflow-y-auto">
                      {availabilityData.map((person) => (
                        <Card
                          key={person.id}
                          className={`cursor-pointer transition-all ${
                            reschedulePersonnel === person.id
                              ? 'border-blue-500 bg-blue-50'
                              : person.available
                                ? 'hover:border-gray-400'
                                : 'opacity-60'
                          }`}
                          onClick={() => person.available && setReschedulePersonnel(person.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <User className="h-4 w-4 text-gray-400" />
                                <div>
                                  <p className="font-medium">{person.name}</p>
                                  <p className="text-xs text-gray-500">Zone: {person.assigned_zone || 'N/A'}</p>
                                </div>
                              </div>
                              <Badge
                                className={
                                  person.available
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }
                              >
                                {person.available ? "Available" : "Busy"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRescheduleModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmReschedule}
                  disabled={!rescheduleDate || !rescheduleTime || !reschedulePersonnel || submitting}
                >
                  {submitting ? "Rescheduling..." : "Confirm Reschedule"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}