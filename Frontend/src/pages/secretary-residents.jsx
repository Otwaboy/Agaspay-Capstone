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
import { Search, Filter, Eye, Edit, UserCheck, UserX, Phone, Mail, MapPin, Calendar } from "lucide-react";

export default function SecretaryResidents() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedResident, setSelectedResident] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

  // Mock data - Replace with actual API call
  const residents = [
    {
      id: 1,
      name: "Juan Dela Cruz",
      address: "123 Main St, Brgy. Biking",
      contactNo: "09171234567",
      email: "juan@email.com",
      status: "active",
      connectionId: "CON-2024-001",
      registrationDate: "2024-01-15",
      accountBalance: 540.00
    },
    {
      id: 2,
      name: "Maria Santos",
      address: "456 Oak Ave, Brgy. Biking",
      contactNo: "09181234567",
      email: "maria@email.com",
      status: "active",
      connectionId: "CON-2024-002",
      registrationDate: "2024-02-20",
      accountBalance: 0
    },
    {
      id: 3,
      name: "Pedro Garcia",
      address: "789 Pine Rd, Brgy. Biking",
      contactNo: "09191234567",
      email: "pedro@email.com",
      status: "inactive",
      connectionId: "CON-2024-003",
      registrationDate: "2024-03-10",
      accountBalance: 1200.00
    },
    {
      id: 4,
      name: "Ana Reyes",
      address: "321 Elm St, Brgy. Biking",
      contactNo: "09201234567",
      email: "ana@email.com",
      status: "active",
      connectionId: "CON-2024-004",
      registrationDate: "2024-04-05",
      accountBalance: 0
    },
  ];

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resident.contactNo.includes(searchQuery) ||
                         resident.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || resident.status === filterStatus;
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
    <div className="flex h-screen bg-gray-100">
      <SecretarySidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SecretaryTopHeader />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
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
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-total-residents">{residents.length}</p>
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
                        {residents.filter(r => r.status === "active").length}
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
                      <p className="text-sm font-medium text-gray-600">Inactive</p>
                      <p className="text-2xl font-bold text-orange-600" data-testid="text-inactive-residents">
                        {residents.filter(r => r.status === "inactive").length}
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
                      <p className="text-sm font-medium text-gray-600">New This Month</p>
                      <p className="text-2xl font-bold text-purple-600">2</p>
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
                    <Button data-testid="button-add-resident">
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
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Name</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Connection ID</TableHead>
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
                              <span className="font-mono text-sm">{resident.connectionId}</span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={resident.status === "active" ? "success" : "secondary"}
                                className={
                                  resident.status === "active"
                                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                                }
                                data-testid={`badge-status-${resident.id}`}
                              >
                                {resident.status}
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
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            No residents found matching your criteria
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
                  <label className="text-sm font-medium text-gray-700">Connection ID</label>
                  <p className="text-gray-900 mt-1 font-mono">{selectedResident.connectionId}</p>
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
                  <label className="text-sm font-medium text-gray-700">Registration Date</label>
                  <p className="text-gray-900 mt-1">{new Date(selectedResident.registrationDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Account Balance</label>
                  <p className={`mt-1 font-semibold ${selectedResident.accountBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    PHP {selectedResident.accountBalance.toFixed(2)}
                  </p>
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
    </div>
  );
}
