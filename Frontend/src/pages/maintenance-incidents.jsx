import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Input } from "../components/ui/input";
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
import MaintenanceSidebar from "../components/layout/maintenance-sidebar";
import MaintenanceTopHeader from "../components/layout/maintenance-top-header";
import {
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Search,
  Filter,
  Calendar,
  FileText
} from "lucide-react";

export default function MaintenanceIncidents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock data - replace with actual API calls
  const { data: incidentsData, isLoading } = useQuery({
    queryKey: ['/api/maintenance/incidents'],
    queryFn: async () => {
      // Replace with actual API call
      return [
        {
          id: 1,
          type: 'Pipe Leak',
          location: 'Purok 5, Biking 1',
          reporter: 'Anna Cruz',
          reporterType: 'Resident',
          status: 'pending',
          priority: 'urgent',
          reportedDate: '2025-10-15',
          reportedTime: '08:30 AM',
          description: 'Major pipe leak near the corner of the street causing water wastage',
          remarks: 'Water supply temporarily shut off in the area'
        },
        {
          id: 2,
          type: 'Water Outage',
          location: 'Purok 3, Biking 2',
          reporter: 'Jose Reyes',
          reporterType: 'Resident',
          status: 'in_progress',
          priority: 'high',
          reportedDate: '2025-10-14',
          reportedTime: '03:00 PM',
          description: 'No water supply for the entire Purok 3 area since yesterday',
          remarks: 'Currently investigating the main valve'
        },
        {
          id: 3,
          type: 'Broken Meter',
          location: 'Purok 4, Biking 1',
          reporter: 'Pedro Santos',
          reporterType: 'Meter Reader',
          status: 'pending',
          priority: 'medium',
          reportedDate: '2025-10-16',
          reportedTime: '10:00 AM',
          description: 'Water meter display not working, unable to read consumption',
          remarks: 'Meter reader reported during monthly reading'
        },
        {
          id: 4,
          type: 'Low Water Pressure',
          location: 'Purok 7, Biking 3',
          reporter: 'Maria Garcia',
          reporterType: 'Resident',
          status: 'resolved',
          priority: 'low',
          reportedDate: '2025-10-13',
          reportedTime: '09:15 AM',
          resolvedDate: '2025-10-14',
          description: 'Very low water pressure affecting several households',
          remarks: 'Issue resolved - cleared obstruction in main pipe',
          resolution: 'Removed debris from main supply line'
        },
        {
          id: 5,
          type: 'Pipe Leak',
          location: 'Purok 2, Biking 2',
          reporter: 'Juan Dela Cruz',
          reporterType: 'Resident',
          status: 'in_progress',
          priority: 'high',
          reportedDate: '2025-10-16',
          reportedTime: '07:00 AM',
          description: 'Underground pipe leak causing flooding in the area',
          remarks: 'Excavation in progress to locate exact leak point'
        }
      ];
    },
    retry: 1
  });

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Urgent</Badge>;
      case 'high':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">High</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Low</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{priority}</Badge>;
    }
  };

  const filteredIncidents = incidentsData?.filter((incident) => {
    const matchesSearch = searchTerm === "" ||
      incident.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reporter?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      incident.status?.toLowerCase() === statusFilter.toLowerCase();

    const matchesType = typeFilter === "all" ||
      incident.type?.toLowerCase().includes(typeFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  return (
    <div className="flex h-screen bg-gray-100">
      <MaintenanceSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MaintenanceTopHeader />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-incidents-title">
                Incident Reports
              </h1>
              <p className="text-gray-600 mt-2">
                View and manage assigned incident reports
              </p>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2 text-blue-600" />
                  Filters & Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search incidents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-incidents"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger data-testid="select-type-filter">
                      <SelectValue placeholder="Filter by Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="leak">Pipe Leak</SelectItem>
                      <SelectItem value="outage">Water Outage</SelectItem>
                      <SelectItem value="meter">Broken Meter</SelectItem>
                      <SelectItem value="pressure">Low Pressure</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Incidents List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Incident Reports
                </CardTitle>
                <CardDescription>
                  {filteredIncidents.length} {filteredIncidents.length === 1 ? 'incident' : 'incidents'} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-28 w-full" />
                    ))}
                  </div>
                ) : filteredIncidents.length > 0 ? (
                  <div className="space-y-3">
                    {filteredIncidents.map((incident) => (
                      <div
                        key={incident.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        data-testid={`incident-item-${incident.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-3">
                              <h3 className="text-lg font-semibold text-gray-900">{incident.type}</h3>
                              {getStatusBadge(incident.status)}
                              {getPriorityBadge(incident.priority)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-2">
                              <div className="flex items-center text-gray-600">
                                <MapPin className="h-4 w-4 mr-2" />
                                <span>{incident.location}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <User className="h-4 w-4 mr-2" />
                                <span>{incident.reporter} ({incident.reporterType})</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span>{incident.reportedDate}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{incident.reportedTime}</span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600">{incident.description}</p>
                            {incident.remarks && (
                              <p className="text-sm text-gray-500 mt-1 italic">Note: {incident.remarks}</p>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedIncident(incident);
                              setIsDetailModalOpen(true);
                            }}
                            data-testid={`button-view-incident-${incident.id}`}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No incidents found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'No incident reports assigned yet'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Incident Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-incident-detail">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Incident Report Details</span>
            </DialogTitle>
            <DialogDescription>
              Report ID: #{selectedIncident?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedIncident && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="text-base font-semibold">{selectedIncident.type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedIncident.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <div className="mt-1">{getPriorityBadge(selectedIncident.priority)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Reporter</label>
                  <p className="text-base">{selectedIncident.reporter}</p>
                  <p className="text-xs text-gray-500">{selectedIncident.reporterType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-base">{selectedIncident.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Reported Date & Time</label>
                  <p className="text-base">{selectedIncident.reportedDate}</p>
                  <p className="text-sm text-gray-500">{selectedIncident.reportedTime}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-base mt-1 p-3 bg-gray-50 rounded-md">{selectedIncident.description}</p>
              </div>

              {selectedIncident.remarks && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Remarks</label>
                  <p className="text-base mt-1 p-3 bg-blue-50 rounded-md">{selectedIncident.remarks}</p>
                </div>
              )}

              {selectedIncident.resolution && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Resolution</label>
                  <p className="text-base mt-1 p-3 bg-green-50 rounded-md">{selectedIncident.resolution}</p>
                </div>
              )}

              {selectedIncident.resolvedDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Resolved Date</label>
                  <p className="text-base">{selectedIncident.resolvedDate}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
