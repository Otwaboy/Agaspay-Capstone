import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
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
} from "../components/ui/dialog";
import { Search, Eye, ClipboardList, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function SecretaryApplications() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  // Mock data - Replace with actual API call
  const applications = [
    {
      id: 1,
      trackingNo: "APP-2025-001",
      applicantName: "Juan Dela Cruz",
      category: "Business Permit",
      type: "New Application",
      dateSubmitted: "2025-01-15",
      status: "pending",
      priority: "normal"
    },
    {
      id: 2,
      trackingNo: "APP-2025-002",
      applicantName: "Maria Santos",
      category: "Complaint",
      type: "Noise Complaint",
      dateSubmitted: "2025-01-18",
      status: "in-progress",
      priority: "high"
    },
    {
      id: 3,
      trackingNo: "APP-2025-003",
      applicantName: "Pedro Garcia",
      category: "Assistance Request",
      type: "Financial Assistance",
      dateSubmitted: "2025-01-19",
      status: "completed",
      priority: "urgent"
    },
    {
      id: 4,
      trackingNo: "APP-2025-004",
      applicantName: "Ana Reyes",
      category: "Building Permit",
      type: "Renovation Permit",
      dateSubmitted: "2025-01-20",
      status: "pending",
      priority: "normal"
    },
    {
      id: 5,
      trackingNo: "APP-2025-005",
      applicantName: "Roberto Cruz",
      category: "Complaint",
      type: "Water Issue",
      dateSubmitted: "2025-01-21",
      status: "in-progress",
      priority: "high"
    },
  ];

  const categories = [
    "Business Permit",
    "Building Permit",
    "Complaint",
    "Assistance Request",
    "Certificate Request",
    "Other"
  ];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.trackingNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || app.status === filterStatus;
    const matchesCategory = filterCategory === "all" || app.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setViewDetailsOpen(true);
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
    "in-progress": { color: "bg-blue-100 text-blue-700", label: "In Progress" },
    completed: { color: "bg-green-100 text-green-700", label: "Completed" },
    rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
  };

  const priorityConfig = {
    normal: { color: "bg-gray-100 text-gray-700", label: "Normal" },
    high: { color: "bg-orange-100 text-orange-700", label: "High" },
    urgent: { color: "bg-red-100 text-red-700", label: "Urgent" },
  };

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
                Application Management
              </h1>
              <p className="text-gray-600 mt-2">
                Track and manage various resident applications and requests
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
                      <ClipboardList className="h-6 w-6 text-blue-600" />
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
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {applications.filter(a => a.status === "in-progress").length}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {applications.filter(a => a.status === "completed").length}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
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
                  View and manage all resident applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, tracking no, or type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-full md:w-56" data-testid="select-category-filter">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Tracking No.</TableHead>
                        <TableHead>Applicant</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date Submitted</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map((app) => (
                          <TableRow key={app.id} data-testid={`row-application-${app.id}`}>
                            <TableCell className="font-mono text-sm">{app.trackingNo}</TableCell>
                            <TableCell className="font-medium">{app.applicantName}</TableCell>
                            <TableCell>{app.category}</TableCell>
                            <TableCell>{app.type}</TableCell>
                            <TableCell>{new Date(app.dateSubmitted).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={priorityConfig[app.priority].color} data-testid={`badge-priority-${app.id}`}>
                                {priorityConfig[app.priority].label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusConfig[app.status].color} data-testid={`badge-status-${app.id}`}>
                                {statusConfig[app.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewDetails(app)}
                                data-testid={`button-view-${app.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
                  <label className="text-sm font-medium text-gray-700">Tracking Number</label>
                  <p className="text-gray-900 mt-1 font-mono">{selectedApplication.trackingNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Applicant Name</label>
                  <p className="text-gray-900 mt-1">{selectedApplication.applicantName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900 mt-1">{selectedApplication.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <p className="text-gray-900 mt-1">{selectedApplication.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date Submitted</label>
                  <p className="text-gray-900 mt-1">{new Date(selectedApplication.dateSubmitted).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <div className="mt-1">
                    <Badge className={priorityConfig[selectedApplication.priority].color}>
                      {priorityConfig[selectedApplication.priority].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={statusConfig[selectedApplication.status].color}>
                      {statusConfig[selectedApplication.status].label}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewDetailsOpen(false)} data-testid="button-close-dialog">
                  Close
                </Button>
                <Button data-testid="button-update-status">Update Status</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog> 
    </div>
  );
}
