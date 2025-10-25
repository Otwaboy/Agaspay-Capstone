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
import { useToast } from "../hooks/use-toast";
import { apiClient } from "../lib/api";

export default function SecretaryAssignments() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("unassigned");
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  
  // Data states
  const [unassignedTasks, setUnassignedTasks] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [maintenancePersonnel, setMaintenancePersonnel] = useState([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Combine unassigned tasks and assignments for display
  const allTasks = [
    ...unassignedTasks.map(task => ({
      id: task.id,
      type: task.task_type,
      location: task.report?.description || 'N/A',
      scheduledDate: task.schedule_date,
      timeSlot: task.schedule_time,
      priority: task.report?.urgency_level?.toLowerCase() || 'medium',
      status: 'Unassigned',
      assignedTo: null,
      notes: '',
      reportDescription: task.report?.description || '',
    })),
    ...assignments.map(assignment => ({
      id: assignment.task.id,
      assignmentId: assignment.id,
      type: assignment.task.task_type,
      location: 'N/A',
      scheduledDate: assignment.task.schedule_date,
      timeSlot: assignment.task.schedule_time,
      priority: 'medium',
      status: assignment.task.task_status,
      assignedTo: assignment.personnel.name,
      assignedToId: assignment.personnel.id,
      assignedToContact: assignment.personnel.contact_no,
      notes: '',
      reportDescription: '',
    })),
  ];

  // Filter tasks
  const filteredTasks = allTasks.filter(task => {
    const matchesSearch = 
      task.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    
    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "unassigned" && task.status === "Unassigned") ||
      (filterStatus === "assigned" && task.status !== "Unassigned");
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleAssignTask = (task) => {
    setSelectedTask(task);
    setSelectedPersonnel("");
    setAssignModalOpen(true);
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setViewDetailsOpen(true);
  };

  const handleSubmitAssignment = async () => {
    if (!selectedPersonnel) {
      toast({
        title: "Validation Error",
        description: "Please select a maintenance personnel",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await apiClient.createAssignment({
        task_id: selectedTask.id,
        assigned_to: selectedPersonnel,
      });

      toast({
        title: "Success",
        description: "Task assigned successfully",
      });

      setAssignModalOpen(false);
      await fetchAllData();
    } catch (error) {
      console.error('Assignment error:', error);
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign task. Please try again.",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Task reassigned successfully",
      });

      await fetchAllData();
    } catch (error) {
      console.error('Reassignment error:', error);
      toast({
        title: "Reassignment Failed",
        description: error.message || "Failed to reassign task.",
        variant: "destructive",
      });
    }
  };

  const handleUnassignTask = async (task) => {
    if (!confirm("Are you sure you want to unassign this task?")) return;

    try {
      await apiClient.deleteAssignment(task.assignmentId);

      toast({
        title: "Success",
        description: "Task unassigned successfully",
      });

      await fetchAllData();
    } catch (error) {
      console.error('Unassignment error:', error);
      toast({
        title: "Unassignment Failed",
        description: error.message || "Failed to unassign task.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const priorityConfig = {
    low: { color: "bg-blue-100 text-blue-700", label: "Low", icon: Clock },
    medium: { color: "bg-yellow-100 text-yellow-700", label: "Medium", icon: AlertTriangle },
    high: { color: "bg-red-100 text-red-700", label: "High", icon: AlertTriangle },
  };

  const statusConfig = {
    Unassigned: { color: "bg-gray-100 text-gray-700", label: "Unassigned" },
    Scheduled: { color: "bg-blue-100 text-blue-700", label: "Scheduled" },
    Completed: { color: "bg-green-100 text-green-700", label: "Completed" },
    Cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled" },
  };

  const unassignedCount = allTasks.filter(t => t.status === "Unassigned").length;
  const assignedCount = allTasks.filter(t => t.status !== "Unassigned").length;
  const urgentCount = allTasks.filter(t => t.priority === "high").length;

  return (
    <div className="flex h-screen bg-gray-100">
      <SecretarySidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SecretaryTopHeader />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
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
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unassigned">Unassigned Only</SelectItem>
                      <SelectItem value="assigned">Assigned Only</SelectItem>
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
                                        onClick={() => handleUnassignTask(task)}
                                        data-testid={`button-unassign-${task.id}`}
                                      >
                                        Unassign
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
                <Select value={selectedPersonnel} onValueChange={setSelectedPersonnel}>
                  <SelectTrigger className="mt-2" data-testid="select-personnel">
                    <SelectValue placeholder="Choose personnel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {maintenancePersonnel.length > 0 ? (
                      maintenancePersonnel.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name} - {person.contact_no}
                          {person.assigned_zone && ` (Zone ${person.assigned_zone})`}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No maintenance personnel available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
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
    </div>
  );
}