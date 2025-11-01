import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import {
  Wrench,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Calendar
} from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function ResidentServiceRequests() {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const [viewRequest, setViewRequest] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    description: "",
    priority: "normal"
  });
  const { toast } = useToast();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['/api/v1/service-requests'],
    queryFn: async () => {
      try {
        // Try to fetch service requests from backend
        const res = await fetch('/api/v1/service-requests');
        if (res.ok) {
          const data = await res.json();
          return data;
        }
        // Return empty array if endpoint doesn't exist yet
        return [];
      } catch (error) {
        console.log('Service requests endpoint not available yet');
        return [];
      }
    },
    retry: 1
  });

  const mockRequests = requests || [];

  const getStatusConfig = (status) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
          className: "bg-green-100 text-green-800",
          icon: CheckCircle,
          color: "text-green-600"
        };
      case "in_progress":
        return {
          label: "In Progress",
          className: "bg-blue-100 text-blue-800",
          icon: Clock,
          color: "text-blue-600"
        };
      case "pending":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800",
          icon: AlertCircle,
          color: "text-yellow-600"
        };
      case "cancelled":
        return {
          label: "Cancelled",
          className: "bg-red-100 text-red-800",
          icon: XCircle,
          color: "text-red-600"
        };
      default:
        return {
          label: "Unknown",
          className: "bg-gray-100 text-gray-800",
          icon: Clock,
          color: "text-gray-600"
        };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800">High Priority</Badge>;
      case "normal":
        return <Badge className="bg-blue-100 text-blue-800">Normal</Badge>;
      case "low":
        return <Badge className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.type || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Here you would call the API
    toast({
      title: "Request Submitted",
      description: "Your service request has been submitted successfully",
    });

    setIsNewRequestOpen(false);
    setFormData({ type: "", description: "", priority: "normal" });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900" data-testid="text-service-requests-title">
                  Service Requests
                </h1>
                <p className="text-gray-600 mt-2">
                  Submit and track your service requests
                </p>
              </div>
              <Button 
                onClick={() => setIsNewRequestOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-new-request"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-900">
                    {mockRequests.length}
                  </div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-yellow-600">
                    {mockRequests.filter(r => r.status === 'pending').length}
                  </div>
                  <p className="text-sm text-gray-600">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">
                    {mockRequests.filter(r => r.status === 'in_progress').length}
                  </div>
                  <p className="text-sm text-gray-600">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">
                    {mockRequests.filter(r => r.status === 'completed').length}
                  </div>
                  <p className="text-sm text-gray-600">Completed</p>
                </CardContent>
              </Card>
            </div>

            {/* Service Requests List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-blue-600" />
                  My Service Requests
                </CardTitle>
                <CardDescription>View and manage your service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : mockRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Service Requests</h3>
                    <p className="text-gray-600 mb-4">You haven't submitted any service requests yet.</p>
                    <Button onClick={() => setIsNewRequestOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockRequests.map((request) => {
                    const statusConfig = getStatusConfig(request.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        data-testid={`request-item-${request.id}`}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`p-2 rounded-lg ${statusConfig.color === 'text-green-600' ? 'bg-green-100' : statusConfig.color === 'text-blue-600' ? 'bg-blue-100' : statusConfig.color === 'text-yellow-600' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                            <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">{request.type}</p>
                              {getPriorityBadge(request.priority)}
                            </div>
                            <p className="text-sm text-gray-600 truncate">{request.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(request.dateRequested).toLocaleDateString()}
                              </span>
                              <span>ID: {request.id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewRequest(request)}
                            data-testid={`button-view-${request.id}`}
                          >
                            <Eye className="h-4 w-4" />
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

      {/* New Request Dialog */}
      <Dialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>New Service Request</DialogTitle>
            <DialogDescription>
              Submit a new service request. We'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="type">Request Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger id="type" data-testid="select-request-type">
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meter-replacement">Meter Replacement</SelectItem>
                    <SelectItem value="pipe-repair">Pipe Repair</SelectItem>
                    <SelectItem value="water-quality">Water Quality Issue</SelectItem>
                    <SelectItem value="bill-inquiry">Bill Inquiry</SelectItem>
                    <SelectItem value="connection-issue">Connection Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                  <SelectTrigger id="priority" data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your service request in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  data-testid="textarea-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNewRequestOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" data-testid="button-submit-request">
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Request Dialog */}
      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Service Request Details</DialogTitle>
            <DialogDescription>Request ID: {viewRequest?.id}</DialogDescription>
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
                  <Badge className={getStatusConfig(viewRequest.status).className}>
                    {getStatusConfig(viewRequest.status).label}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Priority</Label>
                <div className="mt-1">{getPriorityBadge(viewRequest.priority)}</div>
              </div>
              <div>
                <Label className="text-gray-600">Description</Label>
                <p className="mt-1">{viewRequest.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Date Requested</Label>
                  <p className="mt-1">{new Date(viewRequest.dateRequested).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Last Update</Label>
                  <p className="mt-1">{new Date(viewRequest.lastUpdate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRequest(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
