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
import { useToast } from "../hooks/use-toast";
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
  const { toast } = useToast();

  // Mock data - replace with actual API calls
  const { data: tasksData, isLoading, refetch } = useQuery({
    queryKey: ['/api/maintenance/tasks'],
    queryFn: async () => {
      // Replace with actual API call
      return [
        {
          id: 1,
          type: 'Installation',
          location: 'Purok 4, Biking 1',
          resident: 'Juan Dela Cruz',
          connectionId: 'WC-2024-001',
          status: 'pending',
          priority: 'high',
          scheduledDate: '2025-10-16',
          scheduledTime: '09:00 AM',
          assignedDate: '2025-10-15',
          description: 'New water meter installation for new connection'
        },
        {
          id: 2,
          type: 'Disconnection',
          location: 'Purok 2, Biking 2',
          resident: 'Maria Santos',
          connectionId: 'WC-2024-002',
          status: 'in_progress',
          priority: 'medium',
          scheduledDate: '2025-10-16',
          scheduledTime: '10:30 AM',
          assignedDate: '2025-10-15',
          description: 'Disconnection due to non-payment'
        },
        {
          id: 3,
          type: 'Reconnection',
          location: 'Purok 5, Biking 1',
          resident: 'Pedro Garcia',
          connectionId: 'WC-2024-003',
          status: 'pending',
          priority: 'high',
          scheduledDate: '2025-10-17',
          scheduledTime: '11:00 AM',
          assignedDate: '2025-10-16',
          description: 'Reconnection after payment settlement'
        },
        {
          id: 4,
          type: 'Repair',
          location: 'Purok 7, Biking 3',
          resident: 'Anna Reyes',
          connectionId: 'WC-2024-004',
          status: 'completed',
          priority: 'urgent',
          scheduledDate: '2025-10-15',
          scheduledTime: '02:00 PM',
          assignedDate: '2025-10-15',
          completedDate: '2025-10-15',
          description: 'Emergency pipe leak repair'
        },
        {
          id: 5,
          type: 'Installation',
          location: 'Purok 3, Biking 2',
          resident: 'Jose Cruz',
          connectionId: 'WC-2024-005',
          status: 'scheduled',
          priority: 'medium',
          scheduledDate: '2025-10-18',
          scheduledTime: '01:00 PM',
          assignedDate: '2025-10-16',
          description: 'Water meter installation'
        }
      ];
    },
    retry: 1
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status, remarks }) => {
      // Replace with actual API call
      console.log('Updating task:', { taskId, status, remarks });
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Task Updated",
        description: "Task status has been updated successfully.",
      });
      setIsUpdateModalOpen(false);
      setSelectedTask(null);
      setNewStatus("");
      setRemarks("");
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Scheduled</Badge>;
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
      toast({
        title: "Error",
        description: "Please select a status",
        variant: "destructive",
      });
      return;
    }
    updateTaskMutation.mutate({
      taskId: selectedTask.id,
      status: newStatus,
      remarks: remarks
    });
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
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

                          {task.status !== 'completed' && (
                            <Button
                              onClick={() => {
                                setSelectedTask(task);
                                setNewStatus(task.status === 'pending' ? 'in_progress' : 'completed');
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
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
