import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
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
import { Search, UserPlus, CheckCircle, XCircle, Clock, Eye, FileText } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function SecretaryRegistration() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");

  // Mock data - Replace with actual API call
  const applications = [
    {
      id: 1,
      applicantName: "Roberto Cruz",
      contactNo: "09171234567",
      email: "roberto@email.com",
      address: "567 Maple St, Brgy. Biking",
      applicationType: "New Water Connection",
      dateSubmitted: "2025-01-15",
      status: "pending",
      documents: ["Valid ID", "Proof of Residence", "Barangay Clearance"]
    },
    {
      id: 2,
      applicantName: "Linda Fernandez",
      contactNo: "09181234567",
      email: "linda@email.com",
      address: "890 Cedar Ave, Brgy. Biking",
      applicationType: "New Water Connection",
      dateSubmitted: "2025-01-18",
      status: "approved",
      documents: ["Valid ID", "Proof of Residence", "Barangay Clearance"]
    },
    {
      id: 3,
      applicantName: "Carlos Mendoza",
      contactNo: "09191234567",
      email: "carlos@email.com",
      address: "234 Birch Rd, Brgy. Biking",
      applicationType: "Reconnection",
      dateSubmitted: "2025-01-20",
      status: "rejected",
      documents: ["Valid ID", "Proof of Payment"],
      rejectionReason: "Incomplete documents"
    },
    {
      id: 4,
      applicantName: "Teresa Santos",
      contactNo: "09201234567",
      email: "teresa@email.com",
      address: "456 Willow St, Brgy. Biking",
      applicationType: "New Water Connection",
      dateSubmitted: "2025-01-21",
      status: "pending",
      documents: ["Valid ID", "Proof of Residence"]
    },
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.contactNo.includes(searchQuery) ||
                         app.applicationType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || app.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setViewDetailsOpen(true);
  };

  const handleProcessApplication = (application, action) => {
    setSelectedApplication(application);
    setActionType(action);
    setProcessModalOpen(true);
  };

  const confirmProcessAction = () => {
    toast({
      title: actionType === "approve" ? "Application Approved" : "Application Rejected",
      description: `${selectedApplication.applicantName}'s application has been ${actionType === "approve" ? "approved" : "rejected"}.`,
    });
    setProcessModalOpen(false);
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
    approved: { color: "bg-green-100 text-green-700", label: "Approved" },
    rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
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
                Registration Applications
              </h1>
              <p className="text-gray-600 mt-2">
                Process new water connection and reconnection applications
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Applications</p>
                      <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {applications.filter(a => a.status === "pending").length}
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
                      <p className="text-sm font-medium text-gray-600">Approved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {applications.filter(a => a.status === "approved").length}
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
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">
                        {applications.filter(a => a.status === "rejected").length}
                      </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Card>
              <CardHeader>
                <CardTitle>Application Records</CardTitle>
                <CardDescription>
                  Review and process water connection applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, contact, or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Applicant</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map((app) => (
                          <TableRow key={app.id} data-testid={`row-application-${app.id}`}>
                            <TableCell className="font-medium">{app.applicantName}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{app.contactNo}</div>
                                <div className="text-gray-500">{app.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{app.applicationType}</TableCell>
                            <TableCell>{new Date(app.dateSubmitted).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={statusConfig[app.status].color} data-testid={`badge-status-${app.id}`}>
                                {statusConfig[app.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(app)}
                                  data-testid={`button-view-${app.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {app.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 hover:text-green-700"
                                      onClick={() => handleProcessApplication(app, "approve")}
                                      data-testid={`button-approve-${app.id}`}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => handleProcessApplication(app, "reject")}
                                      data-testid={`button-reject-${app.id}`}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No applications found matching your criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Complete information about the application
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Applicant Name</label>
                  <p className="text-gray-900 mt-1">{selectedApplication.applicantName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Application Type</label>
                  <p className="text-gray-900 mt-1">{selectedApplication.applicationType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact Number</label>
                  <p className="text-gray-900 mt-1">{selectedApplication.contactNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1">{selectedApplication.email}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900 mt-1">{selectedApplication.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date Submitted</label>
                  <p className="text-gray-900 mt-1">{new Date(selectedApplication.dateSubmitted).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={statusConfig[selectedApplication.status].color}>
                      {statusConfig[selectedApplication.status].label}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Submitted Documents</label>
                  <ul className="mt-2 space-y-1">
                    {selectedApplication.documents.map((doc, index) => (
                      <li key={index} className="text-gray-900 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-blue-600" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedApplication.rejectionReason && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-700">Rejection Reason</label>
                    <p className="text-red-600 mt-1">{selectedApplication.rejectionReason}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewDetailsOpen(false)} data-testid="button-close-dialog">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Application Dialog */}
      <Dialog open={processModalOpen} onOpenChange={setProcessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve Application" : "Reject Application"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" 
                ? "Confirm that you want to approve this application."
                : "Provide a reason for rejecting this application."
              }
            </DialogDescription>
          </DialogHeader>
          {selectedApplication && (
            <div className="space-y-4">
              <div>
                <Label>Applicant</Label>
                <p className="text-sm text-gray-900">{selectedApplication.applicantName}</p>
              </div>
              {actionType === "reject" && (
                <div>
                  <Label htmlFor="rejection-reason">Rejection Reason</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Enter reason for rejection..."
                    className="mt-2"
                    data-testid="input-rejection-reason"
                  />
                </div> 
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessModalOpen(false)} data-testid="button-cancel-process">
              Cancel
            </Button>
            <Button
              onClick={confirmProcessAction}
              className={actionType === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              data-testid={actionType === "approve" ? "button-confirm-approve" : "button-confirm-reject"}
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
