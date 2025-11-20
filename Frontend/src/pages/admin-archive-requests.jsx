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
  Archive,
  FileArchive,
  Check,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Briefcase
} from "lucide-react";
import apiClient from "../lib/api";
import { toast } from "sonner";

export default function AdminArchiveRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [viewReasonModal, setViewReasonModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("residents"); // residents or personnel
  const queryClient = useQueryClient();

  // Fetch all water connections with archive requests
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['archive-requests'],
    queryFn: () => apiClient.getAllWaterConnections()
  });

  // Fetch all personnel with archive requests
  const { data: personnelData, isLoading: isLoadingPersonnel } = useQuery({
    queryKey: ['personnel-archive-requests'],
    queryFn: () => apiClient.getAllPersonnel()
  });

  console.log('get all first the conenction', connections);
  console.log('get all personnel', personnelData);

  // Filter resident archive requests
  const residentArchiveRequests = (connections?.data || []).filter(
    conn => conn.archive_status === 'pending_archive'
  );

  // Filter personnel archive requests
  const personnelArchiveRequests = (personnelData?.personnel || []).filter(
    person => person.archive_status === 'pending_archive'
  );

  console.log('list of resident archive request', residentArchiveRequests);
  console.log('list of personnel archive request', personnelArchiveRequests);

  // Determine which list to use based on active tab
  const currentRequests = activeTab === "residents" ? residentArchiveRequests : personnelArchiveRequests;

  // Filter based on search
  const filteredRequests = currentRequests.filter(req => {
    if (activeTab === "residents") {
      const residentName = `${req.resident_id?.first_name || ''} ${req.resident_id?.last_name || ''}`.toLowerCase();
      const meterNo = req.meter_no?.toLowerCase() || '';
      const accountNo = req.resident_id?.account_number?.toLowerCase() || '';

      return residentName.includes(searchTerm.toLowerCase()) ||
             meterNo.includes(searchTerm.toLowerCase()) ||
             accountNo.includes(searchTerm.toLowerCase());
    } else {
      // Personnel search
      const personnelName = `${req.first_name || ''} ${req.last_name || ''}`.toLowerCase();
      const email = req.email?.toLowerCase() || '';
      const role = req.role?.toLowerCase() || '';

      return personnelName.includes(searchTerm.toLowerCase()) ||
             email.includes(searchTerm.toLowerCase()) ||
             role.includes(searchTerm.toLowerCase());
    }
  });

  // Approve archive mutation
  const approveArchiveMutation = useMutation({
    mutationFn: async ({ id, type }) => {
      if (type === "residents") {
        return await apiClient.approveArchive(id);
      } else {
        return await apiClient.approvePersonnelArchive(id);
      }
    },
    onSuccess: () => {
      toast.success("Archive request approved successfully!");
      queryClient.invalidateQueries(['archive-requests']);
      queryClient.invalidateQueries(['personnel-archive-requests']);
      setApprovalModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve archive request");
    }
  });

  // Reject archive mutation
  const rejectArchiveMutation = useMutation({
    mutationFn: async ({ id, type, reason }) => {
      if (type === "residents") {
        return await apiClient.rejectArchive(id, reason);
      } else {
        return await apiClient.rejectPersonnelArchive(id, reason);
      }
    },
    onSuccess: () => {
      toast.success("Archive request rejected");
      queryClient.invalidateQueries(['archive-requests']);
      queryClient.invalidateQueries(['personnel-archive-requests']);
      setRejectionModalOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject archive request");
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

  const handleViewReason = (request) => {
    setSelectedRequest(request);
    setViewReasonModal(true);
  };

  const confirmApproval = () => {
    if (selectedRequest) {
      console.log('Selected request for approval:', selectedRequest);

      let requestId;
      if (activeTab === "residents") {
        requestId = selectedRequest.connection_id || selectedRequest.water_connection_id || selectedRequest._id;
      } else {
        requestId = selectedRequest._id;
      }

      if (!requestId) {
        toast.error("Cannot find request ID");
        console.error("Selected request object:", selectedRequest);
        return;
      }

      approveArchiveMutation.mutate({ id: requestId, type: activeTab });
    }
  };

  const confirmRejection = () => {
    if (!rejectionReason || rejectionReason.trim().length < 10) {
      toast.error("Please provide a rejection reason (minimum 10 characters)");
      return;
    }

    if (selectedRequest) {
      let requestId;
      if (activeTab === "residents") {
        requestId = selectedRequest._id || selectedRequest.water_connection_id;
      } else {
        requestId = selectedRequest._id;
      }

      if (!requestId) {
        toast.error("Cannot find request ID");
        console.error("Selected request object:", selectedRequest);
        return;
      }

      rejectArchiveMutation.mutate({
        id: requestId,
        type: activeTab,
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
      title: "Pending Resident Archives",
      value: residentArchiveRequests.length,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Pending Personnel Archives",
      value: personnelArchiveRequests.length,
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Total Pending",
      value: residentArchiveRequests.length + personnelArchiveRequests.length,
      icon: Archive,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  const isLoading = isLoadingConnections || isLoadingPersonnel;

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
                <Archive className="mr-3 h-8 w-8 text-orange-600" />
                Archive Requests
              </h1>
              <p className="text-gray-600 mt-2">
                Review and manage account archive requests from residents and personnel
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
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Pending Archive Requests</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={activeTab === "residents" ? "Search by name, meter no, or account..." : "Search by name, email, or role..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full md:w-80"
                      />
                    </div>
                  </div>

                  {/* Tab Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant={activeTab === "residents" ? "default" : "outline"}
                      onClick={() => {
                        setActiveTab("residents");
                        setSearchTerm("");
                      }}
                      className={activeTab === "residents" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Residents ({residentArchiveRequests.length})
                    </Button>
                    <Button
                      variant={activeTab === "personnel" ? "default" : "outline"}
                      onClick={() => {
                        setActiveTab("personnel");
                        setSearchTerm("");
                      }}
                      className={activeTab === "personnel" ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Personnel ({personnelArchiveRequests.length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <FileArchive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No archive requests found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {activeTab === "residents" ? (
                            <>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Resident Name</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Meter No.</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Request Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </>
                          ) : (
                            <>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Personnel Name</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Request Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((request) => (
                          <tr key={request._id} className="border-b border-gray-100 hover:bg-gray-50">
                            {activeTab === "residents" ? (
                              <>
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
                                  {formatDate(request.archive_requested_date)}
                                </td>
                                <td className="py-3 px-4">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() => handleViewReason(request)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
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
                              </>
                            ) : (
                              <>
                                <td className="py-3 px-4">
                                  <div className="font-medium text-gray-900">
                                    {request.first_name} {request.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">{request.email}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant="outline" className="capitalize">
                                    {request.role?.replace('_', ' ')}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {request.department || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {formatDate(request.archive_requested_date)}
                                </td>
                                <td className="py-3 px-4">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() => handleViewReason(request)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
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
                              </>
                            )}
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

        {/* View Reason Modal */}
        <Dialog open={viewReasonModal} onOpenChange={setViewReasonModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-orange-600">
                <Eye className="h-5 w-5 mr-2" />
                Archive Reason
              </DialogTitle>
            </DialogHeader>

            {selectedRequest && (
              <div className="py-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 mb-4">
                  {activeTab === "residents" ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-semibold">Personnel:</span>{' '}
                        {selectedRequest.first_name} {selectedRequest.last_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Email:</span>{' '}
                        {selectedRequest.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Role:</span>{' '}
                        <span className="capitalize">{selectedRequest.role?.replace('_', ' ')}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Department:</span>{' '}
                        {selectedRequest.department || 'N/A'}
                      </p>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Reason for Archive</Label>
                  <div className="p-4 bg-white border rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedRequest.archive_reason || 'No reason provided'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button onClick={() => setViewReasonModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Confirmation Modal */}
        <Dialog open={approvalModalOpen} onOpenChange={setApprovalModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-green-600">
                <CheckCircle className="h-5 w-5 mr-2" />
                Approve Archive Request
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this archive request?
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="py-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  {activeTab === "residents" ? (
                    <>
                      <p className="text-sm">
                        <span className="font-semibold">Resident:</span>{' '}
                        {selectedRequest.full_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Meter No:</span> {selectedRequest.meter_no}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Zone:</span> {selectedRequest.zone}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Purok:</span> {selectedRequest.purok}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-semibold">Personnel:</span>{' '}
                        {selectedRequest.first_name} {selectedRequest.last_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Email:</span> {selectedRequest.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Role:</span>{' '}
                        <span className="capitalize">{selectedRequest.role?.replace('_', ' ')}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Department:</span> {selectedRequest.department || 'N/A'}
                      </p>
                    </>
                  )}
                  <p className="text-sm mt-3">
                    <span className="font-semibold">Reason:</span>
                  </p>
                  <p className="text-sm text-gray-600 bg-white p-2 rounded">
                    {selectedRequest.archive_reason}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  This will archive the account and prevent {activeTab === "residents" ? "the resident" : "the personnel"} from logging in.
                </p>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setApprovalModalOpen(false)}
                disabled={approveArchiveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={confirmApproval}
                disabled={approveArchiveMutation.isPending}
              >
                {approveArchiveMutation.isPending ? "Processing..." : "Approve"}
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
                Reject Archive Request
              </DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this request
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedRequest && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-2 mb-4">
                  {activeTab === "residents" ? (
                    <>
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
                    </>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-semibold">Personnel:</span>{' '}
                        {selectedRequest.first_name} {selectedRequest.last_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Email:</span>{' '}
                        {selectedRequest.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Role:</span>{' '}
                        <span className="capitalize">{selectedRequest.role?.replace('_', ' ')}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Department:</span>{' '}
                        {selectedRequest.department || 'N/A'}
                      </p>
                    </>
                  )}
                  <p className="text-sm mt-3">
                    <span className="font-semibold">Their Reason:</span>
                  </p>
                  <p className="text-sm text-gray-600 bg-white p-2 rounded">
                    {selectedRequest.archive_reason}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Explain why this archive request cannot be approved (minimum 10 characters)"
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
                disabled={rejectArchiveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={confirmRejection}
                disabled={rejectArchiveMutation.isPending || !rejectionReason || rejectionReason.trim().length < 10}
              >
                {rejectArchiveMutation.isPending ? "Processing..." : "Reject Request"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
