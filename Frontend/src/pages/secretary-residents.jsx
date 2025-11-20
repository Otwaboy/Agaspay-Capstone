import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import CreateResidentModal from "../components/modals/create-resident-modal";
import EditResidentModal from "../components/modals/edit-resident-modal";
import GenerateResidentReportModal from "../components/modals/generate-resident-report-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
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
} from "../components/ui/dialog";
import { Search, Filter, Eye, Edit, UserCheck, UserX, Phone, Mail, MapPin, Calendar, UserPlus, Loader2, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { queryClient } from "../lib/query-client";

export default function SecretaryResidents() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedResident, setSelectedResident] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [residentToEdit, setResidentToEdit] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Fetch water connections from backend
  const { data: residents = [], isLoading, error } = useQuery({
    queryKey: ['/api/water-connections'],
    queryFn: async () => {
      const res = await apiClient.getAllWaterConnections();
      const connections = res.data;
      
      // Debug: Log the first connection to see the structure
      if (connections && connections.length > 0) {
        console.log('🔍 First connection from backend:', connections[0]);
        console.log('🔍 Available fields:', Object.keys(connections[0]));
      }
      
      // Map backend data to frontend format
      return connections.map((conn) => ({
        id: conn.connection_id || conn._id,
        name: conn.full_name,
        address: conn.address,
        contactNo: conn.contact_no,
        email: conn.email,
        status: conn.status,
        connectionStatus: conn.connection_status,
        meter_no: conn.meter_no,
        type: conn.type,
        previousReading: conn.previous_reading || 0,
        presentReading: conn.present_reading || 0
      }));
    }
  });

  const filteredResidents = residents.filter(resident => {

    //search
    const matchesSearch = resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resident.contactNo.includes(searchQuery) ||
                         resident.address.toLowerCase().includes(searchQuery.toLowerCase());
      //filter
    const matchesFilter = filterStatus === "all" || resident.connectionStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (resident) => {
    setSelectedResident(resident);
    setViewDetailsOpen(true);
  };

  const handleCloseModal = () => {
    setIsResidentModalOpen(false);
    // Refetch water connections after creating a new resident
    queryClient.invalidateQueries({ queryKey: ['/api/water-connections'] });
  };

  const handleEditResident = (resident) => {
    setResidentToEdit(resident);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setResidentToEdit(null);
    // Refetch water connections after updating a resident
    queryClient.invalidateQueries({ queryKey: ['/api/water-connections'] });
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

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
                Resident Management
              </h1>
              <p className="text-gray-600 mt-2">
                View and manage barangay resident records
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Residents</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-total-residents">
                        {isLoading ? "..." : residents.length}
                      </p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <UserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-green-600" data-testid="text-active-residents">
                        {isLoading ? "..." : residents.filter(r => r.connectionStatus === "active").length}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Disconnected</p>
                      <p className="text-2xl font-bold text-orange-600" data-testid="text-inactive-residents">
                        {isLoading ? "..." : residents.filter(r => r.connectionStatus === "disconnected").length}
                      </p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <UserX className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-2xl font-bold text-purple-600" data-testid="text-pending-residents">
                        {isLoading ? "..." : residents.filter(r => r.connectionStatus === "pending").length}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-purple-600" />
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
                    <CardTitle>Resident Records</CardTitle>
                    <CardDescription>
                      Manage and view all registered residents
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setIsReportModalOpen(true)}
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                      data-testid="button-generate-report"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                    <Button
                      onClick={() => setIsResidentModalOpen(true)}
                      data-testid="button-add-resident"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add New Resident
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, contact, or address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by connection status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="disconnected">Disconnected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    <span className="ml-3 text-gray-600">Loading residents...</span>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 text-sm">
                      <strong>Error loading residents:</strong> {error.message}
                    </p>
                  </div>
                )}

                {/* Table */}
                {!isLoading && !error && (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead>Name</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead>Meter No.</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResidents.length > 0 ? (
                          filteredResidents.map((resident) => (
                            <TableRow key={resident.id} data-testid={`row-resident-${resident.id}`}>
                              <TableCell className="font-medium">{resident.name}</TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <div>{resident.contactNo}</div>
                                  <div className="text-gray-500">{resident.email}</div>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-xs truncate">{resident.address}</TableCell>
                              <TableCell>
                                <span className="font-mono text-sm">{resident.meter_no}</span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {resident.type}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                    variant={resident.connectionStatus === "active" ? "success" : "secondary"}
                                    className={`
                                      ${
                                        resident.connectionStatus === "active"
                                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                                          : resident.connectionStatus === "pending"
                                          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                          : resident.connectionStatus === "disconnected"
                                          ? "bg-red-100 text-red-700 hover:bg-red-100"
                                          : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                      }
                                    `}
                                    data-testid={`badge-status-${resident.id}`}
                                  >
                                    {resident.connectionStatus.charAt(0).toUpperCase() + resident.connectionStatus.slice(1)}
                                  </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleViewDetails(resident)}
                                    data-testid={`button-view-${resident.id}`}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditResident(resident)}
                                    data-testid={`button-edit-${resident.id}`}
                                  >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                              No residents found matching your criteria
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resident Details</DialogTitle>
            <DialogDescription>
              Complete information about the selected resident
            </DialogDescription>
          </DialogHeader>
          {selectedResident && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900 mt-1">{selectedResident.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Meter Number</label>
                  <p className="text-gray-900 mt-1 font-mono">{selectedResident.meter_no}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact Number</label>
                  <p className="text-gray-900 mt-1 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    {selectedResident.contactNo}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900 mt-1 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    {selectedResident.email}
                  </p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900 mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {selectedResident.address}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Connection Type</label>
                  <p className="text-gray-900 mt-1 capitalize">{selectedResident.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Connection Status</label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className="capitalize"
                    >
                      {selectedResident.connectionStatus}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Previous Reading</label>
                  <p className="text-gray-900 mt-1 font-mono">{selectedResident.previousReading} m³</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Present Reading</label>
                  <p className="text-gray-900 mt-1 font-mono">{selectedResident.presentReading} m³</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge
                      variant={selectedResident.status === "active" ? "success" : "secondary"}
                      className={
                        selectedResident.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {selectedResident.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewDetailsOpen(false)} data-testid="button-close-dialog">
                  Close
                </Button>
                <Button data-testid="button-edit-information">Edit Information</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Resident Modal */}
      <CreateResidentModal 
        isOpen={isResidentModalOpen} 
        onClose={handleCloseModal} 
      />

      {/* Edit Resident Modal */}
      <EditResidentModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        resident={residentToEdit}
      />

      {/* Generate Report Modal */}
      <GenerateResidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}