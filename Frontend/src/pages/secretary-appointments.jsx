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
import { Search, Calendar, CalendarPlus, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function SecretaryAppointments() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Mock data - Replace with actual API call
  const appointments = [
    {
      id: 1,
      residentName: "Juan Dela Cruz",
      contactNo: "09171234567",
      purpose: "Document Request",
      appointmentDate: "2025-01-25",
      appointmentTime: "10:00 AM",
      status: "confirmed",
      notes: "Barangay clearance for employment"
    },
    {
      id: 2,
      residentName: "Maria Santos",
      contactNo: "09181234567",
      purpose: "Complaint",
      appointmentDate: "2025-01-25",
      appointmentTime: "2:00 PM",
      status: "pending",
      notes: "Water service issue discussion"
    },
    {
      id: 3,
      residentName: "Pedro Garcia",
      contactNo: "09191234567",
      purpose: "Business Permit",
      appointmentDate: "2025-01-26",
      appointmentTime: "9:00 AM",
      status: "confirmed",
      notes: "New business permit application"
    },
    {
      id: 4,
      residentName: "Ana Reyes",
      contactNo: "09201234567",
      purpose: "Assistance Request",
      appointmentDate: "2025-01-26",
      appointmentTime: "11:00 AM",
      status: "completed",
      notes: "Financial assistance application"
    },
    {
      id: 5,
      residentName: "Roberto Cruz",
      contactNo: "09211234567",
      purpose: "Consultation",
      appointmentDate: "2025-01-27",
      appointmentTime: "3:00 PM",
      status: "cancelled",
      notes: "General consultation about water connection"
    },
  ];

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = appt.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         appt.contactNo.includes(searchQuery) ||
                         appt.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || appt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setViewDetailsOpen(true);
  };

  const handleCreateAppointment = () => {
    toast({
      title: "Appointment Created",
      description: "The appointment has been successfully scheduled.",
    });
    setCreateModalOpen(false);
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-700", label: "Pending" },
    confirmed: { color: "bg-green-100 text-green-700", label: "Confirmed" },
    completed: { color: "bg-blue-100 text-blue-700", label: "Completed" },
    cancelled: { color: "bg-red-100 text-red-700", label: "Cancelled" },
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
                Appointment Management
              </h1>
              <p className="text-gray-600 mt-2">
                Schedule and manage resident appointments
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                      <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
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
                        {appointments.filter(a => a.status === "pending").length}
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
                      <p className="text-sm font-medium text-gray-600">Confirmed</p>
                      <p className="text-2xl font-bold text-green-600">
                        {appointments.filter(a => a.status === "confirmed").length}
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
                      <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                      <p className="text-2xl font-bold text-purple-600">0</p>
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
                    <CardTitle>Appointment Schedule</CardTitle>
                    <CardDescription>
                      View and manage all scheduled appointments
                    </CardDescription>
                  </div>
                  <Button onClick={() => setCreateModalOpen(true)} data-testid="button-create-appointment">
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by resident name, contact, or purpose..."
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
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Resident</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Purpose</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((appt) => (
                          <TableRow key={appt.id} data-testid={`row-appointment-${appt.id}`}>
                            <TableCell className="font-medium">{appt.residentName}</TableCell>
                            <TableCell>{appt.contactNo}</TableCell>
                            <TableCell>{appt.purpose}</TableCell>
                            <TableCell>{new Date(appt.appointmentDate).toLocaleDateString()}</TableCell>
                            <TableCell>{appt.appointmentTime}</TableCell>
                            <TableCell>
                              <Badge className={statusConfig[appt.status].color} data-testid={`badge-status-${appt.id}`}>
                                {statusConfig[appt.status].label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(appt)}
                                  data-testid={`button-view-${appt.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {appt.status === "pending" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 hover:text-green-700"
                                    data-testid={`button-confirm-${appt.id}`}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Confirm
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                            No appointments found matching your criteria
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
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Complete information about the appointment
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Resident Name</label>
                  <p className="text-gray-900 mt-1">{selectedAppointment.residentName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Contact Number</label>
                  <p className="text-gray-900 mt-1">{selectedAppointment.contactNo}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Purpose</label>
                  <p className="text-gray-900 mt-1">{selectedAppointment.purpose}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={statusConfig[selectedAppointment.status].color}>
                      {statusConfig[selectedAppointment.status].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Appointment Date</label>
                  <p className="text-gray-900 mt-1">{new Date(selectedAppointment.appointmentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Appointment Time</label>
                  <p className="text-gray-900 mt-1">{selectedAppointment.appointmentTime}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-gray-900 mt-1">{selectedAppointment.notes}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewDetailsOpen(false)} data-testid="button-close-dialog">
                  Close
                </Button>
                <Button data-testid="button-edit-appointment">Edit Appointment</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Appointment Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Fill in the details to schedule a new appointment
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resident-name">Resident Name</Label>
              <Input id="resident-name" placeholder="Enter resident name" className="mt-2" data-testid="input-resident-name" />
            </div>
            <div>
              <Label htmlFor="contact">Contact Number</Label>
              <Input id="contact" placeholder="Enter contact number" className="mt-2" data-testid="input-contact" />
            </div>
            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Select>
                <SelectTrigger className="mt-2" data-testid="select-purpose">
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document Request</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                  <SelectItem value="business">Business Permit</SelectItem>
                  <SelectItem value="assistance">Assistance Request</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" className="mt-2" data-testid="input-date" />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" className="mt-2" data-testid="input-time" />
              </div> 
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Additional notes..." className="mt-2" data-testid="input-notes" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleCreateAppointment} data-testid="button-schedule">Schedule Appointment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
