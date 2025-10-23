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
import { Search, FileText, FilePlus, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function SecretaryDocuments() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [issueModalOpen, setIssueModalOpen] = useState(false);

  // Mock data - Replace with actual API call
  const documents = [
    {
      id: 1,
      documentType: "Barangay Clearance",
      residentName: "Juan Dela Cruz",
      purpose: "Job Application",
      dateRequested: "2025-01-15",
      dateIssued: "2025-01-16",
      status: "issued",
      documentNo: "BC-2025-001"
    },
    {
      id: 2,
      documentType: "Certificate of Residency",
      residentName: "Maria Santos",
      purpose: "School Enrollment",
      dateRequested: "2025-01-18",
      dateIssued: null,
      status: "pending",
      documentNo: "CR-2025-002"
    },
    {
      id: 3,
      documentType: "Barangay Identification",
      residentName: "Pedro Garcia",
      purpose: "Government Transaction",
      dateRequested: "2025-01-19",
      dateIssued: "2025-01-20",
      status: "issued",
      documentNo: "BI-2025-003"
    },
    {
      id: 4,
      documentType: "Indigency Certificate",
      residentName: "Ana Reyes",
      purpose: "Medical Assistance",
      dateRequested: "2025-01-20",
      dateIssued: null,
      status: "processing",
      documentNo: "IC-2025-004"
    },
    {
      id: 5,
      documentType: "Certificate of Residency",
      residentName: "Roberto Cruz",
      purpose: "Bank Application",
      dateRequested: "2025-01-21",
      dateIssued: null,
      status: "pending",
      documentNo: "CR-2025-005"
    },
  ];

  const documentTypes = [
    "Barangay Clearance",
    "Certificate of Residency",
    "Barangay Identification",
    "Indigency Certificate",
    "Business Clearance",
    "Certificate of Good Moral"
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.documentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || doc.status === filterStatus;
    const matchesType = filterType === "all" || doc.documentType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleIssueDocument = () => {
    toast({
      title: "Document Issued",
      description: "The document has been successfully issued.",
    });
    setIssueModalOpen(false);
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
    processing: { color: "bg-blue-100 text-blue-700", label: "Processing" },
    issued: { color: "bg-green-100 text-green-700", label: "Issued" },
    rejected: { color: "bg-red-100 text-red-700", label: "Rejected" },
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
                Document Management
              </h1>
              <p className="text-gray-600 mt-2">
                Issue and manage barangay certificates and clearances
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Requests</p>
                      <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
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
                        {documents.filter(d => d.status === "pending").length}
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
                      <p className="text-sm font-medium text-gray-600">Issued</p>
                      <p className="text-2xl font-bold text-green-600">
                        {documents.filter(d => d.status === "issued").length}
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
                      <p className="text-sm font-medium text-gray-600">Processing</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {documents.filter(d => d.status === "processing").length}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600" />
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
                    <CardTitle>Document Requests</CardTitle>
                    <CardDescription>
                      Manage certificate and clearance requests
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIssueModalOpen(true)} data-testid="button-issue-document">
                    <FilePlus className="h-4 w-4 mr-2" />
                    Issue New Document
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by resident name, document no, or purpose..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-56" data-testid="select-type-filter">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {documentTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
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
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Document No.</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Resident</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Date Requested</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => (
                          <TableRow key={doc.id} data-testid={`row-document-${doc.id}`}>
                            <TableCell className="font-mono text-sm">{doc.documentNo}</TableCell>
                            <TableCell>{doc.documentType}</TableCell>
                            <TableCell className="font-medium">{doc.residentName}</TableCell>
                            <TableCell>{doc.purpose}</TableCell>
                            <TableCell>{new Date(doc.dateRequested).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge className={statusConfig[doc.status].color} data-testid={`badge-status-${doc.id}`}>
                                {statusConfig[doc.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {doc.status === "issued" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    data-testid={`button-download-${doc.id}`}
                                  >
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-700"
                                    data-testid={`button-process-${doc.id}`}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Process
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No documents found matching your criteria
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

      {/* Issue Document Dialog */}
      <Dialog open={issueModalOpen} onOpenChange={setIssueModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue New Document</DialogTitle>
            <DialogDescription>
              Fill in the details to issue a new barangay document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resident-name">Resident Name</Label>
              <Input id="resident-name" placeholder="Enter resident name" className="mt-2" data-testid="input-resident-name" />
            </div>
            <div>
              <Label htmlFor="document-type">Document Type</Label>
              <Select>
                <SelectTrigger className="mt-2" data-testid="select-document-type">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select> 
            </div>
            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Input id="purpose" placeholder="Enter purpose" className="mt-2" data-testid="input-purpose" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueModalOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleIssueDocument} data-testid="button-issue">Issue Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
