import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../components/ui/collapsible";
import { toast } from "sonner";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  Download,
  Calendar,
  Droplets,
  TrendingUp,
  Users,
  ChevronDown,
  ChevronRight,
  MapPin,
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";
import { apiClient } from "../lib/api";

export default function TreasurerApproveReadings() {
  const queryClient = useQueryClient();
  
  // State
  const [selectedReading, setSelectedReading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedZones, setExpandedZones] = useState({});

  // Fetch all readings (we'll filter for 'submitted' status)
  const { data: readingsData, isLoading } = useQuery({
    queryKey: ["readings", "submitted"],
    queryFn: async () => {
      const response = await apiClient.getLatestReadings();
      return response;
    },
  });

  console.log('readings data',readingsData);
  

  // Filter only submitted readings
  const submittedReadings = readingsData?.connection_details?.filter(
    (reading) => reading.reading_status === "submitted"
  ) || [];

  // Group readings by zone
  const readingsByZone = submittedReadings.reduce((acc, reading) => {
    const zone = reading.zone || "Unassigned";
    if (!acc[zone]) {
      acc[zone] = [];
    }
    acc[zone].push(reading);
    return acc;
  }, {});

  // Apply search filter to each zone
  const filteredReadingsByZone = Object.entries(readingsByZone).reduce((acc, [zone, readings]) => {
    const filtered = readings.filter((reading) =>
      reading.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[zone] = filtered;
    }
    return acc;
  }, {});

  // Get sorted zones
  const zones = Object.keys(filteredReadingsByZone).sort((a, b) => {
    if (a === "Unassigned") return 1;
    if (b === "Unassigned") return -1;
    return a.localeCompare(b, undefined, { numeric: true });
  });

  // Bulk approve all submitted readings
  const bulkApproveMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.approveAllReadings();
      return response;
    },
    onSuccess: (data) => {
      toast.success("Success!", { description: "" });
      queryClient.invalidateQueries(["readings"]);
    },
    onError: (error) => {
      toast.error("Error", { description: error.response?.data?.msg || "Failed to approve readings" });
    },
  });

  // Individual approve (you'll need to add this endpoint to backend)
  const individualApproveMutation = useMutation({
    mutationFn: async (readingId) => {
      const response = await apiClient.approveSingleReading(readingId);
      return response;
    },
    onSuccess: () => {
      toast.success("Success!", { description: "Reading approved successfully" });
      queryClient.invalidateQueries(["readings"]);
      setSelectedReading(null);
    },
    onError: (error) => {
      toast.error("Error", { description: error.response?.data?.msg || "Failed to approve reading" });
    },
  });

  // Toggle zone expansion
  const toggleZone = (zone) => {
    setExpandedZones((prev) => ({
      ...prev,
      [zone]: !prev[zone],
    }));
  };

  // Initialize all zones as expanded on first load
  useState(() => {
    const allExpanded = zones.reduce((acc, zone) => {
      acc[zone] = true;
      return acc;
    }, {});
    setExpandedZones(allExpanded);
  }, [zones.length]);

  // Statistics
  const stats = {
    totalPending: submittedReadings.length,
    totalZones: Object.keys(readingsByZone).length,
    averageConsumption:
      submittedReadings.length > 0
        ? (
            submittedReadings.reduce((sum, r) => sum + r.calculated, 0) /
            submittedReadings.length
          ).toFixed(2)
        : 0,
  };

  // Get zone statistics
  const getZoneStats = (zoneReadings) => {
    const totalReadings = zoneReadings.length;
    const totalConsumption = zoneReadings.reduce((sum, r) => sum + r.calculated, 0);
    const avgConsumption = totalReadings > 0 ? (totalConsumption / totalReadings).toFixed(2) : 0;
    return { totalReadings, totalConsumption, avgConsumption };
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <TreasurerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TreasurerTopHeader />
        
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Approve Meter Readings</h1>
                  <p className="text-gray-600">
                    Review and approve readings submitted by meter readers
                  </p>
                </div>
              </div>
            </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
            <p className="text-xs text-muted-foreground">
              Readings awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zones Covered</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalZones}</div>
            <p className="text-xs text-muted-foreground">
              Different zones with submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Consumption
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageConsumption}</div>
            <p className="text-xs text-muted-foreground">Cubic meters average</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Bulk Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Submitted Readings by Zone</CardTitle>
              <CardDescription>
                Review and approve readings organized by zone
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => bulkApproveMutation.mutate()}
                disabled={
                  submittedReadings.length === 0 || bulkApproveMutation.isPending
                }
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve All ({submittedReadings.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Control */}
          <div className="mb-4">
            <Input
              placeholder="Search by resident name across all zones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Zone Tables */}
          {isLoading ? (
            <div className="text-center py-10">Loading readings...</div>
          ) : zones.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {submittedReadings.length === 0
                ? "No submitted readings found. All readings are either in progress or already approved."
                : "No readings match your search."}
            </div>
          ) : (
            <div className="space-y-4">
              {zones.map((zone) => {
                const zoneReadings = filteredReadingsByZone[zone];
                const zoneStats = getZoneStats(zoneReadings);

                return (
                  <Card key={zone} className="border-2">
                    <Collapsible
                      open={expandedZones[zone] !== false}
                      onOpenChange={() => toggleZone(zone)}
                    >
                      <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <MapPin className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="text-left">
                                <CardTitle className="flex items-center gap-2">
                                  Zone {zone}
                                  {expandedZones[zone] !== false ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </CardTitle>
                                <CardDescription>
                                  {zoneStats.totalReadings} reading(s) • Avg: {zoneStats.avgConsumption} m³
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-sm">
                              {zoneStats.totalReadings} pending
                            </Badge>
                          </div>
                        </CollapsibleTrigger>
                      </CardHeader>

                      <CollapsibleContent>
                        <CardContent>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Resident Name</TableHead>
                                  <TableHead>Purok</TableHead>
                                  <TableHead className="text-right">Previous</TableHead>
                                  <TableHead className="text-right">Present</TableHead>
                                  <TableHead className="text-right">Consumption</TableHead>
                                  <TableHead>Period</TableHead>
                                  <TableHead>Read Status</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {zoneReadings.map((reading) => (
                                  <TableRow key={reading.reading_id}>
                                    <TableCell className="font-medium">
                                      {reading.full_name}
                                    </TableCell>
                                    <TableCell>{reading.purok_no}</TableCell>
                                    <TableCell className="text-right">
                                      {reading.previous_reading} m³
                                    </TableCell>
                                    <TableCell className="text-right">
                                      {reading.present_reading} m³
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {reading.calculated} m³
                                    </TableCell>
                                    <TableCell className="text-sm">
                                      {reading.inclusive_date?.start && reading.inclusive_date?.end
                                        ? `${new Date(
                                            reading.inclusive_date.start
                                          ).toLocaleDateString()} - ${new Date(
                                            reading.inclusive_date.end
                                          ).toLocaleDateString()}`
                                        : "N/A"}
                                    </TableCell>
                                    <TableCell>
                                      {reading.can_read_status === 'cannot_read' ? (
                                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                                          Can't Read
                                        </Badge>
                                      ) : (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                          Read
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="secondary">
                                        {reading.reading_status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedReading(reading)}
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                          <DialogHeader>
                                            <DialogTitle>Reading Details</DialogTitle>
                                            <DialogDescription>
                                              Review reading information for {reading.full_name}
                                            </DialogDescription>
                                          </DialogHeader>
                                          {selectedReading && (
                                            <div className="space-y-4">
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <p className="text-sm text-muted-foreground">
                                                    Resident
                                                  </p>
                                                  <p className="font-medium">
                                                    {selectedReading.full_name}
                                                  </p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">
                                                    Connection ID
                                                  </p>
                                                  <p className="font-mono text-sm">
                                                    {selectedReading.connection_id}
                                                  </p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">
                                                    Purok
                                                  </p>
                                                  <p className="font-medium">
                                                    {selectedReading.purok_no}
                                                  </p>
                                                </div>
                                                <div>
                                                  <p className="text-sm text-muted-foreground">
                                                    Zone
                                                  </p>
                                                  <p className="font-medium">
                                                    Zone {selectedReading.zone}
                                                  </p>
                                                </div>
                                              </div>

                                              <div className="border-t pt-4">
                                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                  <Droplets className="h-4 w-4" />
                                                  Reading Information
                                                </h4>
                                                <div className="grid grid-cols-3 gap-4">
                                                  <Card>
                                                    <CardContent className="pt-6">
                                                      <p className="text-sm text-muted-foreground">
                                                        Previous Reading
                                                      </p>
                                                      <p className="text-2xl font-bold">
                                                        {selectedReading.previous_reading}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground">
                                                        cubic meters
                                                      </p>
                                                    </CardContent>
                                                  </Card>
                                                  <Card>
                                                    <CardContent className="pt-6">
                                                      <p className="text-sm text-muted-foreground">
                                                        Present Reading
                                                      </p>
                                                      <p className="text-2xl font-bold">
                                                        {selectedReading.present_reading}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground">
                                                        cubic meters
                                                      </p>
                                                    </CardContent>
                                                  </Card>
                                                  <Card>
                                                    <CardContent className="pt-6">
                                                      <p className="text-sm text-muted-foreground">
                                                        Consumption
                                                      </p>
                                                      <p className="text-2xl font-bold text-primary">
                                                        {selectedReading.calculated}
                                                      </p>
                                                      <p className="text-xs text-muted-foreground">
                                                        cubic meters
                                                      </p>
                                                    </CardContent>
                                                  </Card>
                                                </div>
                                              </div>

                                              <div className="border-t pt-4">
                                                <h4 className="font-semibold mb-2">
                                                  Reading Period
                                                </h4>
                                                <p className="text-sm">
                                                  {selectedReading.inclusive_date?.start &&
                                                  selectedReading.inclusive_date?.end
                                                    ? `${new Date(
                                                        selectedReading.inclusive_date.start
                                                      ).toLocaleDateString("en-US", {
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                      })} - ${new Date(
                                                        selectedReading.inclusive_date.end
                                                      ).toLocaleDateString("en-US", {
                                                        month: "long",
                                                        day: "numeric",
                                                        year: "numeric",
                                                      })}`
                                                    : "Date not available"}
                                                </p>
                                              </div>

                                              {selectedReading.can_read_status === 'cannot_read' && (
                                                <div className="border-t pt-4">
                                                  <h4 className="font-semibold mb-2">
                                                    Reading Status
                                                  </h4>
                                                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100 mb-2">
                                                    Can't Read
                                                  </Badge>
                                                  <div>
                                                    <p className="text-sm text-muted-foreground mb-1">
                                                      Remarks:
                                                    </p>
                                                    <p className="text-sm bg-red-50 p-2 rounded border border-red-200">
                                                      {selectedReading.remarks || "No remarks provided"}
                                                    </p>
                                                  </div>
                                                </div>
                                              )}

                                              <div className="flex gap-2 pt-4">
                                                <Button
                                                  className="flex-1 gap-2"
                                                  onClick={() =>
                                                    individualApproveMutation.mutate(
                                                      selectedReading.reading_id
                                                    )
                                                  }
                                                  disabled={individualApproveMutation.isPending}
                                                >
                                                  <CheckCircle2 className="h-4 w-4" />
                                                  Approve Reading
                                                </Button>
                                              </div>
                                            </div>
                                          )}
                                        </DialogContent>
                                      </Dialog>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
          </div>
        </main>
      </div>
    </div>
  );
}