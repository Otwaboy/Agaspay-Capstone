import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
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
import { Search, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { apiClient } from "../lib/api";
import { queryClient } from "../lib/query-client";
import { toast } from "sonner";

export default function SecretaryScheduleReconnection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);

  // Fetch disconnected connections
  const { data: connectionsData, isLoading, error } = useQuery({
    queryKey: ['/api/v1/water-connection/disconnected'],
    queryFn: () => apiClient.getDisconnectedConnections(),
  });

  // Fetch all assignments to check which connections already have scheduled tasks
  const { data: assignmentsData } = useQuery({
    queryKey: ['/api/v1/assignments'],
    queryFn: () => apiClient.getAssignments(),
  });

  const connections = connectionsData?.data || [];

  // Get list of connection IDs that already have scheduled reconnection tasks
  const scheduledConnectionIds = new Set(
    (assignmentsData?.assignments || [])
      .filter(assignment => assignment.task?.task_type === 'reconnection')
      .map(assignment => assignment.task?.connection_id?._id || assignment.task?.connection_id)
      .filter(Boolean)
  );

  // Filter connections based on search
  const filteredConnections = connections.filter(conn => {
    const matchesSearch =
      conn.residentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.meter_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conn.purok?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Create schedule task mutation with automatic scheduling
  const createTaskMutation = useMutation({
    mutationFn: (taskData) => apiClient.createScheduleTask(taskData),
    onSuccess: (data) => {
      toast.success("Reconnection Task Scheduled", {
        description: data.message || "Task has been automatically scheduled with available personnel",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/schedule-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/water-connection/disconnected'] });
      setScheduleDialogOpen(false);
      setSelectedConnection(null);
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to schedule reconnection task",
      });
    },
  });

  const handleScheduleReconnection = (connection) => {
    setSelectedConnection(connection);
    setScheduleDialogOpen(true);
  };

  const handleConfirmSchedule = () => {
    if (!selectedConnection) return;

    // Create task data similar to disconnection flow
    const taskData = {
      title: `Water Reconnection - ${selectedConnection.residentName}`,
      description: `Reconnect water service for meter ${selectedConnection.meter_no} at Purok ${selectedConnection.purok}. Resident: ${selectedConnection.residentName}`,
      task_type: "reconnection",
      priority: "medium",
      connection_id: selectedConnection.connection_id,
      resident_id: selectedConnection.resident_id,
    };

    createTaskMutation.mutate(taskData);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      for_disconnection: { label: "For Disconnection", className: "bg-orange-100 text-orange-800" },
      disconnected: { label: "Disconnected", className: "bg-red-100 text-red-800" },
      active: { label: "Active", className: "bg-green-100 text-green-800" },
    };

    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <SecretarySidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <SecretarySidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-600">Error loading connections: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SecretarySidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <SecretaryTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Schedule Reconnections
                  </h1>
                  <p className="text-gray-600">Manage and schedule water service reconnections</p>
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Disconnected Connections</p>
                    <p className="text-2xl font-bold text-red-600">
                      {filteredConnections.length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by name, meter number, or purok..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Connections Table */}
            <Card>
              <CardHeader>
                <CardTitle>Disconnected Connections</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredConnections.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No disconnected connections found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Meter No.</TableHead>
                          <TableHead>Resident Name</TableHead>
                          <TableHead>Purok</TableHead>
                          <TableHead>Contact No.</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredConnections.map((connection) => {
                          const isScheduled = scheduledConnectionIds.has(connection.connection_id);

                          return (
                            <TableRow key={connection.connection_id}>
                              <TableCell className="font-medium">{connection.meter_no}</TableCell>
                              <TableCell>{connection.residentName}</TableCell>
                              <TableCell>{connection.purok}</TableCell>
                              <TableCell>{connection.contactNo}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(connection.connection_status)}
                                  {isScheduled && (
                                    <Badge className="bg-blue-100 text-blue-800">
                                      Already Scheduled
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleScheduleReconnection(connection)}
                                  disabled={isScheduled}
                                >
                                  <Calendar className="h-4 w-4 mr-2" />
                                  {isScheduled ? "Scheduled" : "Schedule"}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schedule Dialog */}
            <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Reconnection Task</DialogTitle>
                  <DialogDescription>
                    This will automatically create and assign a reconnection task to available personnel.
                  </DialogDescription>
                </DialogHeader>

                {selectedConnection && (
                  <div className="py-4 space-y-3">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-2">Connection Details</h4>
                      <div className="space-y-1 text-sm text-green-800">
                        <p><span className="font-medium">Resident:</span> {selectedConnection.residentName}</p>
                        <p><span className="font-medium">Meter No:</span> {selectedConnection.meter_no}</p>
                        <p><span className="font-medium">Purok:</span> {selectedConnection.purok}</p>
                        <p><span className="font-medium">Contact:</span> {selectedConnection.contactNo}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      A reconnection task will be created and automatically assigned to available personnel based on their workload.
                    </p>
                  </div>
                )}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setScheduleDialogOpen(false);
                      setSelectedConnection(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmSchedule}
                    disabled={createTaskMutation.isPending}
                  >
                    {createTaskMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="h-4 w-4 mr-2" />
                        Confirm Schedule
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </div>
        </main>
      </div>
    </div>
  );
}
