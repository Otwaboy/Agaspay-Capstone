import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import {
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar,
} from "lucide-react";
import { apiClient } from "../lib/api";

export default function ResidentServiceRequests() {
  const [viewRequest, setViewRequest] = useState(null);
 

  const { data: requests, isLoading } = useQuery({
    queryKey: ["service-requests"],
    queryFn: async () => {
      try {
        const res = await apiClient.getIncidentReports();
        return res.reports || [];
      } catch (error) {
        console.error("Error fetching service requests:", error);
        return [];
      }
    },
    retry: 1,
  });

  const mockRequests = Array.isArray(requests) ? requests : [];

  const getStatusConfig = (status) => {
    switch (status) {
      case "Completed":
        return { label: "Completed", className: "bg-green-100 text-green-800", icon: CheckCircle, color: "text-green-600" };
      case "Scheduled":
        return { label: "Scheduled", className: "bg-blue-100 text-blue-800", icon: Wrench, color: "text-blue-600" };
      case "Pending":
        return { label: "Pending", className: "bg-yellow-100 text-yellow-800", icon: AlertCircle, color: "text-yellow-600" };
      case "Cancelled":
        return { label: "Cancelled", className: "bg-red-100 text-red-800", icon: XCircle, color: "text-red-600" };
      default:
        return { label: "Unknown", className: "bg-gray-100 text-gray-800", icon: Clock, color: "text-gray-600" };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-yellow-100 text-yellow-800">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ResidentSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Service Requests</h1>
                <p className="text-gray-600 mt-2">Submit and track your service requests</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-900">{mockRequests.length}</div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">{mockRequests.filter(r => r.reported_issue_status === 'Pending').length}</div>
                  <p className="text-sm text-gray-600">Pending</p>
                </CardContent>
              </Card>
               <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{mockRequests.filter(r => r.reported_issue_status === 'Scheduled').length}</div>
                  <p className="text-sm text-gray-600">Scheduled</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{mockRequests.filter(r => r.reported_issue_status === 'Completed').length}</div>
                  <p className="text-sm text-gray-600">Completed</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{mockRequests.filter(r => r.reported_issue_status === 'Cancelled').length}</div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                </CardContent>
              </Card>
            </div>

            {/* Service Requests List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Wrench className="h-5 w-5 mr-2 text-blue-600"/>My Reported Issues</CardTitle>
                <CardDescription>View and manage your reported issues</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full " />)}</div>
                ) : mockRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Issue Reported</h3>
                    <p className="text-gray-600 mb-4">You haven't submitted any report yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 md:space-y-0 md:space-x-0">
                    {mockRequests.map(request => {
                      const statusConfig = getStatusConfig(request.reported_issue_status);
                      const StatusIcon = statusConfig.icon;

                      return ( 
                        <div
                          key={request._id || request.id}
                          className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border rounded-lg mb-2 hover:bg-gray-50 transition-colors"
                        >
                          {/* Left content */}
                          <div className="flex items-start md:items-center space-x-4 flex-1">
                            <div className={`p-2 rounded-lg ${statusConfig.color === 'text-green-600' ? 'bg-green-100' : statusConfig.color === 'text-blue-600' ? 'bg-blue-100' : statusConfig.color === 'text-yellow-600' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                              <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <p className="font-medium text-gray-900">{request.type}</p>
                                {getPriorityBadge(request.urgency_level)}
                              </div>
                              <p className="text-sm text-gray-600 truncate">{request.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {request.reported_at ? new Date(request.reported_at).toLocaleDateString() : "N/A"}
                                </span>
                                <span>ID: {request._id || request.id}</span>
                              </div>
                            </div>
                          </div>

                          {/* Right badge & button */}
                          <div className="flex items-center space-x-3 mt-3 md:mt-0">
                            <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
                            <Button variant="outline" size="sm" onClick={() => setViewRequest(request)}>
                              <Eye className="h-4 w-4"/>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* View Request Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Service Request Details</DialogTitle>
            <DialogDescription>Request ID: {viewRequest?._id || viewRequest?.id}</DialogDescription>
          </DialogHeader>
          {viewRequest && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-gray-600">Request Type</Label>
                <p className="font-medium mt-1">{viewRequest.type}</p>
              </div>
              <div>
                <Label className="text-gray-600">Status</Label>
                <div className="mt-1">
                  <Badge className={getStatusConfig(viewRequest.reported_issue_status).className}>
                    {getStatusConfig(viewRequest.reported_issue_status).label}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Priority</Label>
                <div className="mt-1">{getPriorityBadge(viewRequest.urgency_level)}</div>
              </div>
              <div>
                <Label className="text-gray-600">Description</Label>
                <p className="mt-1">{viewRequest.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Date Requested</Label>
                  <p className="mt-1">{viewRequest.reported_at ? new Date(viewRequest.reported_at).toLocaleDateString() : "N/A"}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Last Update</Label>
                  <p className="mt-1">{viewRequest.reported_issue_status || "N/A"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRequest(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
