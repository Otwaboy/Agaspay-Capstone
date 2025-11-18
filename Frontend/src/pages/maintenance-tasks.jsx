import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import MaintenanceSidebar from "../components/layout/maintenance-sidebar";
import MaintenanceTopHeader from "../components/layout/maintenance-top-header";
import { toast } from "sonner";
import { apiClient } from "../lib/api";
import {
  Wrench,
  MapPin,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Calendar,
  User
} from "lucide-react";

export default function MaintenanceTasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  // Fetch assignments from backend (filtered by maintenance role automatically)
  const { data: assignmentsResponse, isLoading, refetch } = useQuery({
    queryKey: ['/api/v1/assignments'],
    queryFn: async () => {
      const response = await apiClient.getAssignments();
      return response;
    },
    retry: 1
  });

  console.log('list', assignmentsResponse);
  

  // Transform backend data to match UI format
const tasksData = assignmentsResponse?.assignments?.map(assignment => {
  const task = assignment.task;

  // Determine task type display name
  let taskType = 'N/A';
  if (task?.task_type === 'disconnection') {
    taskType = 'Water Disconnection';
  } else if (task?.task_type === 'reconnection') {
    taskType = 'Water Reconnection';
  } else if (task?.task_type === 'meter_installation') {
    taskType = 'Meter Installation';
  } else if (task?.task_type === 'maintenance') {
    taskType = 'Maintenance';
  } else if (task?.type) {
    taskType = task.type;
  }

  return {
    id: task?.id,
    assignmentId: assignment.id,
    type: taskType,
    location: task?.location || 'Biking',
    resident: assignment.personnel?.name || 'N/A',
    connectionId: task?.connection_id?._id || task?.connection_id || 'N/A',
    status: task?.task_status || 'Assigned',
    priority: task?.urgency_lvl || task?.priority || 'Medium',
    scheduledDate: task?.schedule_date
      ? new Date(task.schedule_date).toLocaleDateString()
      : 'N/A',
    scheduledTime: task?.schedule_time || 'N/A',
    assignedDate: assignment.assigned_at
      ? new Date(assignment.assigned_at).toLocaleDateString()
      : 'N/A',
    description: `${taskType} scheduled`,
    personnelName: assignment.personnel?.name,
    personnelContact: assignment.personnel?.contact_no,
  };
});

    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, task_status, remarks }) => {
          return await apiClient.updateTaskStatus(taskId, { task_status, remarks });
        },
        onSuccess: () => { 
          toast.success("Task Updated", { description: "Task status has been updated successfully." });
          setIsUpdateModalOpen(false);
          setSelectedTask(null);
          setNewStatus("");
          setRemarks("");
          refetch();
        },
        onError: (error) => {
          toast.error("Error", { description: error?.message || "Failed to update task status." });
        }
});

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Unassigned':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Unassigned</Badge>;
      case 'Scheduled':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>;
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      case 'Pending':
        return <Badge className="bg-red-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      default:
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">{status}</Badge>;
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

  const filteredTasks = tasksData?.filter((task) => {
    const matchesSearch = searchTerm === "" ||
      task.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.resident?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      task.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesType = typeFilter === "all" ||
      task.type?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  const handleUpdateTask = () => {
    if (!newStatus) {
      toast.error("Error", { description: "Please select a status" });
      return;
    }
updateTaskMutation.mutate({
  taskId: selectedTask.id,
  task_status: newStatus,
  remarks
});
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
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-tasks-title">
                My Tasks
              </h1>
              <p className="text-gray-600 mt-2">
                View and manage your assigned maintenance tasks
              </p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-blue-600" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tasks..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-tasks"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Unassigned">Unassigned</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger data-testid="select-type-filter">
                      <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="disconnection">Disconnection</SelectItem>
                      <SelectItem value="reconnection">Reconnection</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tasks List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-orange-600" />
                  Assigned Tasks
                </CardTitle>
                <CardDescription>
                  {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : filteredTasks.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTasks.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        data-testid={`task-item-${task.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{task.type}</h3>
                              {getStatusBadge(task.status)}
                              {getPriorityBadge(task.priority)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{task.location}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <User className="h-4 w-4 mr-2" />
                                <span>{task.resident}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{task.scheduledDate}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{task.scheduledTime}</span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                            <p className="text-xs text-gray-500 mt-1">Connection ID: {task.connectionId}</p>
                          </div>

                          {task.status !== 'Completed' && task.status !== 'Cancelled' && (
                            <Button
                              onClick={() => {
                                setSelectedTask(task);
                                setNewStatus('Completed');
                                setIsUpdateModalOpen(true);
                              }}
                              data-testid={`button-update-task-${task.id}`}
                            >
                              Update Status
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No tasks found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'No tasks assigned yet'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Update Task Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent data-testid="dialog-update-task">
          <DialogHeader>
            <DialogTitle>Update Task Status</DialogTitle>
            <DialogDescription>
              Update the status of: {selectedTask?.type} - {selectedTask?.resident}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger data-testid="select-new-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Remarks (Optional)</label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any notes or remarks about this task..."
                rows={4}
                data-testid="textarea-remarks"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateTask}
              disabled={updateTaskMutation.isPending}
              data-testid="button-confirm-update"
            >
              {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}