import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import CreateResidentModal from "../components/modals/create-resident-modal";
import EditResidentModal from "../components/modals/edit-resident-modal";

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
import { Search, Filter, Eye, Edit, UserCheck, UserX, Phone, Mail, MapPin, Calendar, UserPlus, Loader2, FileText, Droplets } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "../lib/api";

export default function AdminResidents() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedResident, setSelectedResident] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);


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
        resident_id: conn.resident_id,  // Add resident_id for multi-meter functionality
        name: conn.full_name,
        address: conn.address,
        contactNo: conn.contact_no,
        email: conn.email,
        status: conn.status,
        archive_status: conn.archive_status,
        connectionStatus: conn.connection_status,
        meter_no: conn.meter_no,
        type: conn.type,
        previousReading: conn.previous_reading || 0,
        presentReading: conn.present_reading || 0
      }));
    }
  });

  // Group residents by resident_id and sort by name
  const groupedResidents = residents.reduce((acc, resident) => {
    const existingResident = acc.find(r => r.resident_id === resident.resident_id);
    if (existingResident) {
      // Add meter to existing resident
      existingResident.meters.push({
        id: resident.id,
        meter_no: resident.meter_no,
        type: resident.type,
        connectionStatus: resident.connectionStatus,
        previousReading: resident.previousReading,
        presentReading: resident.presentReading
      });
    } else {
      // Create new grouped resident
      acc.push({
        resident_id: resident.resident_id,
        name: resident.name,
        contactNo: resident.contactNo,
        email: resident.email,
        address: resident.address,
        status: resident.status,
        archive_status: resident.archive_status,
        meters: [
          {
            id: resident.id,
            meter_no: resident.meter_no,
            type: resident.type,
            connectionStatus: resident.connectionStatus,
            previousReading: resident.previousReading,
            presentReading: resident.presentReading
          }
        ]
      });
    }
    return acc;
  }, []);

  // Sort by name (A-Z)
  groupedResidents.sort((a, b) => a.name.localeCompare(b.name));

  const filteredResidents = groupedResidents.filter(resident => {
    // Search in resident info or any meter info
    const matchesSearch = resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resident.contactNo.includes(searchQuery) ||
                         resident.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resident.meters.some(m => m.meter_no.includes(searchQuery));

    // Filter by connection status - check if any meter matches or all meters match filter
    const matchesFilter = filterStatus === "all" ||
                         resident.meters.some(m => m.connectionStatus === filterStatus);

    return matchesSearch && matchesFilter;
  });

  const handleViewDetails = (resident) => {
    setSelectedResident(resident);
    setViewDetailsOpen(true);
  };

  





  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TopHeader />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">
                Barangay Biking Residents
              </h1>
              <p className="text-gray-600 mt-2">
                View all barangay resident records
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Connections</p>
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
            <Card className="overflow-visible h-full flex flex-col">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Resident Records</CardTitle>
                    <CardDescription>
                       View all registered residents
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                   
                    
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 px-6 pt-6">
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
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 mx-6">
                    <p className="text-red-800 text-sm">
                      <strong>Error loading residents:</strong> {error.message}
                    </p>
                  </div>
                )}

                {/* Table */}
                {!isLoading && !error && (
                  <div className="flex-1 flex flex-col mx-6 mb-6 border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto flex-1" style={{ overflowY: 'auto' }}>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 sticky top-0 z-10">
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
                            filteredResidents.flatMap((resident) =>
                              resident.meters.map((meter, meterIdx) => (
                                <TableRow key={`${resident.resident_id}-${meter.id}`} data-testid={`row-resident-${resident.resident_id}-meter-${meter.id}`}>
                                  {/* Name, Contact, Address - only show for first meter */}
                                  {meterIdx === 0 && (
                                    <>
                                      <TableCell className="font-medium" rowSpan={resident.meters.length}>
                                        <div>
                                          <p>{resident.name}</p>
                                          {resident.archive_status === "archived" && (
                                            <Badge className="mt-2 bg-red-100 text-red-700 border-red-200">
                                              Archived
                                            </Badge>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell rowSpan={resident.meters.length}>
                                        <div className="text-sm">
                                          <div>{resident.contactNo}</div>
                                          <div className="text-gray-500">{resident.email}</div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="max-w-xs truncate" rowSpan={resident.meters.length}>
                                        {resident.address}
                                      </TableCell>
                                    </>
                                  )}

                                  {/* Meter Number */}
                                  <TableCell>
                                    <span className="font-mono text-sm">{meter.meter_no}</span>
                                  </TableCell>

                                  {/* Type */}
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                      {meter.type}
                                    </Badge>
                                  </TableCell>

                                  {/* Status */}
                                  <TableCell>
                                    <Badge
                                      variant={meter.connectionStatus === "active" ? "success" : "secondary"}
                                      className={`
                                        ${
                                          meter.connectionStatus === "active"
                                            ? "bg-green-100 text-green-700 hover:bg-green-100"
                                            : meter.connectionStatus === "pending"
                                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                            : meter.connectionStatus === "disconnected"
                                            ? "bg-red-100 text-red-700 hover:bg-red-100"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                        }
                                      `}
                                      data-testid={`badge-status-${meter.id}`}
                                    >
                                      {meter.connectionStatus.charAt(0).toUpperCase() + meter.connectionStatus.slice(1)}
                                    </Badge>
                                  </TableCell>

                                  {/* Actions - only show for first meter */}
                                  {meterIdx === 0 && (
                                    <TableCell className="text-right" rowSpan={resident.meters.length}>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleViewDetails(resident)}
                                        data-testid={`button-actions-${resident.resident_id}`}
                                        className="hover:bg-blue-50"
                                      >
                                        <Eye className="h-4 w-4 text-blue-600" />
                                      </Button>
                                    </TableCell>
                                  )}
                                </TableRow>
                              ))
                            )
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
              {/* Resident Personal Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900 mt-1">{selectedResident.name}</p>
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
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        selectedResident.archive_status === "archived"
                          ? "destructive"
                          : selectedResident.status === "active"
                          ? "success"
                          : "secondary"
                      }
                      className={
                        selectedResident.archive_status === "archived"
                          ? "bg-red-100 text-red-700"
                          : selectedResident.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }
                    >
                      {selectedResident.archive_status === "archived"
                        ? "Archived"
                        : selectedResident.status}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900 mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    {selectedResident.address}
                  </p>
                </div>
              </div>

              {/* Meters Section */}
              <div className="border-t pt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                  <Droplets className="h-4 w-4 mr-2" />
                  Water Meters ({selectedResident.meters.length})
                </h3>
                <div className="space-y-4">
                  {selectedResident.meters.map((meter) => (
                    <div key={meter.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Meter Number</label>
                          <p className="text-gray-900 mt-1 font-mono">{meter.meter_no}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Connection Type</label>
                          <p className="text-gray-900 mt-1 capitalize">{meter.type}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Connection Status</label>
                          <div className="mt-1">
                            <Badge
                              variant={meter.connectionStatus === "active" ? "success" : "secondary"}
                              className={`capitalize
                                ${
                                  meter.connectionStatus === "active"
                                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                                    : meter.connectionStatus === "pending"
                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                    : meter.connectionStatus === "disconnected"
                                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                }
                              `}
                            >
                              {meter.connectionStatus}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Previous Reading</label>
                          <p className="text-gray-900 mt-1 font-mono">{meter.previousReading} m³</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Present Reading</label>
                          <p className="text-gray-900 mt-1 font-mono">{meter.presentReading} m³</p>
                        </div>
                      </div>
                    </div>
                  ))}
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

   
 

   
    </div>
  );
}