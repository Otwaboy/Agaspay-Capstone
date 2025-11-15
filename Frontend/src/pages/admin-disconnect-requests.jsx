import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import {
  Search,
  AlertTriangle,
  UserX,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import apiClient from "../lib/api";
import { toast } from "sonner";

export default function AdminDisconnectRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const queryClient = useQueryClient();

  // Fetch all water connections with disconnection requests
  const { data: connections, isLoading } = useQuery({
    queryKey: ['disconnect-requests'],
    queryFn: () => apiClient.getAllWaterConnections()
  });
 
  console.log('all water connections', connections);
  
  // Filter only those with disconnection requests
  const disconnectRequests = (connections?.data || []).filter(
    conn => conn.connection_status === 'request_for_disconnection' && conn.disconnection_type === 'Voluntary'
  ); 

  console.log('disconnectionrequest list', disconnectRequests);
  

  // Filter based on search
  const filteredRequests = disconnectRequests.filter(req => {
    const residentName = `${req.resident_id?.first_name || ''} ${req.resident_id?.last_name || ''}`.toLowerCase();
    const meterNo = req.meter_no?.toLowerCase() || '';
    const accountNo = req.resident_id?.account_number?.toLowerCase() || '';

    return residentName.includes(searchTerm.toLowerCase()) ||
           meterNo.includes(searchTerm.toLowerCase()) ||
           accountNo.includes(searchTerm.toLowerCase());
  });

  // Approve disconnection mutation
  const approveDisconnectionMutation = useMutation({
    mutationFn: async (connectionId) => {
      // Update connection status to disconnected
      return await apiClient.approveDisconnection(connectionId);
    },
    onSuccess: () => {
      toast.success("Disconnection request approved successfully!");
      queryClient.invalidateQueries(['disconnect-requests']);
      setApprovalModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve disconnection request");
    }
  });

  // Reject disconnection mutation
  const rejectDisconnectionMutation = useMutation({
    mutationFn: async ({ connectionId, reason }) => {
      // Use the reject endpoint
      return await apiClient.rejectDisconnection(connectionId, reason);
    },
    onSuccess: () => {
      toast.success("Disconnection request rejected");
      queryClient.invalidateQueries(['disconnect-requests']);
      setRejectionModalOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject disconnection request");
    }
  });

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setApprovalModalOpen(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setRejectionModalOpen(true);
  };

  const confirmApproval = () => {
    if (selectedRequest) {
      // Use water_connection_id if _id is not available
      const connectionId = selectedRequest.connection_id || selectedRequest.water_connection_id;

      if (!connectionId) {
        toast.error("Cannot find connection ID");
        console.error("Selected request object:", selectedRequest);
        return;
      }

      approveDisconnectionMutation.mutate(connectionId);
    }
  };

  const confirmRejection = () => {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      toast.error("Please provide a rejection reason (minimum 10 characters)");
      return;
    }

    if (selectedRequest) {
      // Use water_connection_id if _id is not available
      const connectionId = selectedRequest.connection_id || selectedRequest.water_connection_id;

      if (!connectionId) {
        toast.error("Cannot find connection ID");
        console.error("Selected request object:", selectedRequest);
        return;
      }

      rejectDisconnectionMutation.mutate({
        connectionId: connectionId,
        reason: rejectionReason.trim()
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = [
    {
      title: "Pending Requests",
      value: disconnectRequests.length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
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
              <Skeleton className="h-10 w-64 mb-6" />
              <div className="grid grid-cols-1 gap-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-96" />
              </div>
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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <AlertTriangle className="mr-3 h-8 w-8 text-red-600" />
                Disconnect Requests
              </h1>
              <p className="text-gray-600 mt-2">
                Review and manage voluntary disconnection requests from residents
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                          <IconComponent className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Requests Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <CardTitle>Pending Disconnection Requests</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, meter no, or account..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full md:w-80"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <UserX className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No disconnection requests found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Resident Name</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Meter No.</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Request Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((request) => (
                          <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">
                                {request.full_name} 
                              </div>
                              <div className="text-sm text-gray-500">{request.resident_id?.email}</div>
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {request.meter_no}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {formatDate(request.disconnection_requested_date)}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className="bg-orange-100 text-orange-800">
                                {request.disconnection_type}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleApprove(request)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleReject(request)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Approval Confirmation Modal */}
        <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve Disconnection Request
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this disconnection request?
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="py-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">Resident:</span>{' '}
                    {selectedRequest.full_name} 
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Meter No:</span> {selectedRequest.meter_no}
                  </p>
                    <p className="text-sm">
                    <span className="font-semibold">Zone:</span>{' '}
                    {selectedRequest.zone}
                  </p>
                    <p className="text-sm">
                    <span className="font-semibold">Purok:</span>{' '}
                    {selectedRequest.purok}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  This will disconnect the water service and prevent the resident from accessing the system.
                </p>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setApprovalModalOpen(false)}
                disabled={approveDisconnectionMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={confirmApproval}
                disabled={approveDisconnectionMutation.isPending}
              >
                {approveDisconnectionMutation.isPending ? "Processing..." : "Approve"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Modal */}
        <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-red-600">
                <XCircle className="h-5 w-5 mr-2" />
                Reject Disconnection Request
              </DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedRequest && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="font-semibold">Resident:</span>{' '}
                    {selectedRequest.full_name} 
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Meter No:</span>{' '}
                    {selectedRequest.meter_no}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Zone:</span>{' '}
                    {selectedRequest.zone}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Purok:</span>{' '}
                    {selectedRequest.purok}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Explain why this disconnection request cannot be approved (minimum 10 characters)"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  {rejectionReason.length}/10 characters minimum
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectionModalOpen(false);
                  setRejectionReason("");
                }}
                disabled={rejectDisconnectionMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmRejection}
                disabled={rejectDisconnectionMutation.isPending || !rejectionReason || rejectionReason.trim().length < 10}
              >
                {rejectDisconnectionMutation.isPending ? "Processing..." : "Reject Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
