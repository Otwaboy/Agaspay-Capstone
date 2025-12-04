import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";
import { Gauge, Calendar, User, MapPin, Search, CheckCircle2, AlertCircle, XCircle, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import { apiClient } from "../lib/api";
import { Badge } from "../components/ui/badge";
import MeterIssueReportDialog from "../components/dialogs/MeterIssueReportDialog";


export default function MeterReaderReadings() {
  const [formData, setFormData] = useState({
    connection_id: "",
    present_reading: "",
    inclusive_date: { start: "", end: "" },
    remarks: "",
    can_read_status: "can_read"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isCannotRead, setIsCannotRead] = useState(false);
  const [showIssueDialog, setShowIssueDialog] = useState(false);
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [editedDates, setEditedDates] = useState({ start: "", end: "" });
  // Store test dates per connection ID so they persist when switching between connections
  const [testDatesByConnection, setTestDatesByConnection] = useState({});
  const queryClient = useQueryClient();

  // Fetch connections with refetching every 5 seconds to detect billing updates
  const { data: connectionsResponse, isLoading: connectionsLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => apiClient.getLatestReadings(),
    refetchInterval: 5000 // Auto-refetch every 5 seconds
  });

  // Fetch current user
  const { data: authUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const response = await apiClient.getUserAccount();
      return response.user;
    }
  });

  console.log('user', authUser);

  const connectionList = connectionsResponse?.connection_details || [];
  const meterReaderZone = authUser?.assigned_zone;

  console.log('all connection get in the latest reading', connectionList);

  // 📅 Helper function to get the effective start date (next_period_dates if available, otherwise inclusive_date)
  const getReadingStartDate = (conn) => {
    const dateSource = conn?.next_period_dates || conn?.inclusive_date;
    return dateSource?.start ? new Date(dateSource.start) : null;
  };

  // 📅 Helper function to check if reading period includes today
  const isScheduledToday = (conn) => {
    const dateSource = conn?.next_period_dates || conn?.inclusive_date;
    if (!dateSource?.start || !dateSource?.end) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(dateSource.start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(dateSource.end);
    endDate.setHours(0, 0, 0, 0);

    // Check if today is within the reading period (inclusive)
    return today >= startDate && today <= endDate;
  };

  // 📅 Helper function to check if reading period starts next month (future reading)
  const isNextMonth = (conn) => {
    const dateSource = conn?.next_period_dates || conn?.inclusive_date;
    if (!dateSource?.start) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(dateSource.start);
    startDate.setHours(0, 0, 0, 0);

    // Check if start date is in the future (more than today)
    return startDate > today;
  };

  // Connections filtered by zone only (for overall statistics)
  const zoneConnections = connectionList
    .filter((conn) => {
      const matchesZone = meterReaderZone ? conn.zone === meterReaderZone : true;
      return matchesZone;
    })
    .sort((a, b) => {
      // 📅 Sort by reading period start date (nearest to today first)
      const dateA = getReadingStartDate(a);
      const dateB = getReadingStartDate(b);

      if (!dateA && !dateB) return Number(a.purok_no) - Number(b.purok_no); // Fallback to purok
      if (!dateA) return 1; // Connections without dates go to the end
      if (!dateB) return -1;

      return dateA.getTime() - dateB.getTime(); // Sort by nearest date to today
    });

  // Filtered connections by zone + search query (for dropdown)
  const filteredConnections = zoneConnections
    .filter((conn) => {
      const matchesSearch = searchQuery
        ? conn.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conn.purok_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conn.meter_number?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesSearch;
    });

  console.log('filtter', filteredConnections);

  const overallReadingStatus = (() => {
  if (zoneConnections.length === 0) return "No Data";

  // Only consider unbilled readings for status (exclude cannot_read meters as they don't need billing)
  const unbilledConnections = zoneConnections.filter(c => !c.is_billed && c.can_read_status !== 'cannot_read');

  if (unbilledConnections.length === 0) return "Ready to read"; // All readable meters billed, ready for new readings

  const allApproved = unbilledConnections.every(c => c.reading_status === "approved");
  const anySubmitted = unbilledConnections.some(c => c.reading_status === "submitted");
  const allInProgress = unbilledConnections.every(c => c.reading_status === "inprogress");

  if (allApproved) return "Approved";
  if (anySubmitted) return "Submitted";
  if (allInProgress) return "In Progress";
  return "In Progress"; // fallback
})();

  // Check if approval message should show (only when approved AND not yet billed)
  const shouldShowApprovalMessage = overallReadingStatus === "Approved" && zoneConnections.some(c => c.reading_status === "approved" && !c.is_billed);

  // Monthly progress - based on ALL zone connections that CAN be read (exclude cannot_read and next month connections)
  // Exclude connections where reading period starts in the future (next month)
  const readableConnections = zoneConnections.filter(conn => conn.can_read_status !== 'cannot_read' && !isNextMonth(conn));
  const readCount = readableConnections.filter(conn => conn.read_this_month && !conn.is_billed).length;
  console.log('read count', readCount);

  const totalCount = readableConnections.length;
  const progressPercentage = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

  const selectedConnectionData = filteredConnections.find(
    (conn) => String(conn.connection_id) === String(formData.connection_id)
  );

  console.log('selected connection:', {
    connection_id: selectedConnectionData?.connection_id,
    meter_number: selectedConnectionData?.meter_number,
    full_name: selectedConnectionData?.full_name,
    inclusive_date_start: selectedConnectionData?.inclusive_date?.start,
    inclusive_date_end: selectedConnectionData?.inclusive_date?.end,
    inclusive_date_start_formatted: selectedConnectionData?.inclusive_date?.start ? new Date(selectedConnectionData.inclusive_date.start).toISOString().split('T')[0] : null,
    inclusive_date_end_formatted: selectedConnectionData?.inclusive_date?.end ? new Date(selectedConnectionData.inclusive_date.end).toISOString().split('T')[0] : null
  });

  const previousReading = selectedConnectionData?.present_reading || 0;
  const presentReading = parseFloat(formData.present_reading) || 0;
  const consumption = presentReading > previousReading ? presentReading - previousReading : 0;

  const isEditing = selectedConnectionData?.reading_status === "inprogress";

  // 📅 Auto-populate inclusive_date when connection is selected
  useEffect(() => {
    if (selectedConnectionData?.inclusive_date?.start && selectedConnectionData?.inclusive_date?.end && !isEditing) {
      const connectionId = selectedConnectionData.connection_id;

      // Check if there are stored test dates for this connection
      if (testDatesByConnection[connectionId]) {
        const testDates = testDatesByConnection[connectionId];
        setFormData(prev => ({
          ...prev,
          inclusive_date: {
            start: testDates.start,
            end: testDates.end
          }
        }));
        console.log(`📅 Applied test dates for connection ${connectionId}: Start: ${testDates.start}, End: ${testDates.end}`);
      } else {
        // Auto-fill with next_period_dates if available (when reading is billed), otherwise use inclusive_date
        const dateSource = selectedConnectionData?.next_period_dates || selectedConnectionData?.inclusive_date;
        const connectionStartDate = new Date(dateSource.start).toISOString().split('T')[0];
        const connectionEndDate = new Date(dateSource.end).toISOString().split('T')[0];

        setFormData(prev => ({
          ...prev,
          inclusive_date: {
            start: connectionStartDate,
            end: connectionEndDate
          }
        }));

        const source = selectedConnectionData?.next_period_dates ? "next_period_dates (rolled-over)" : "inclusive_date";
        console.log(`📅 Auto-filled inclusive_date from ${source}: Start: ${connectionStartDate}, End: ${connectionEndDate}`);
      }
    }
  }, [selectedConnectionData?.connection_id, selectedConnectionData?.inclusive_date, selectedConnectionData?.next_period_dates, isEditing, testDatesByConnection]);

  // ------------------ MUTATIONS ------------------
  const recordReadingMutation = useMutation({
    mutationFn: async (readingData) => apiClient.inputReading(readingData),
    onSuccess: (data, variables) => {
      // Store the test dates used in this reading so they persist on the frontend
      const connectionId = variables.connection_id;
      if (formData.inclusive_date.start && formData.inclusive_date.end) {
        setTestDatesByConnection(prev => ({
          ...prev,
          [connectionId]: {
            start: formData.inclusive_date.start,
            end: formData.inclusive_date.end
          }
        }));
      }

      toast.success("Success", { description: "Meter reading recorded successfully" });
      setFormData({
        connection_id: "",
        present_reading: "",
        inclusive_date: { start: "", end: "" },
        remarks: ""
      });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message || "Failed to record meter reading" });
    }
  });

  const submitAllReadingsMutation = useMutation({
    mutationFn: async () => {
      const readingIds = filteredConnections
        .filter(conn => conn.read_this_month && conn.reading_status !== 'submitted')
        .map(conn => conn.reading_id);

      if (readingIds.length === 0) throw new Error('No readings available to submit.');
      return apiClient.bulkSubmitReadings(readingIds);
    },
    onSuccess: () => {
      toast.success("Success", { description: "" });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message || "Failed to submit readings" });
    }
  });

  // Update reading mutation
  const updateReadingMutation = useMutation({
    mutationFn: async ({ reading_id, data }) => {
      return apiClient.updateReadings(reading_id, data);
    },
    onSuccess: () => {
      // Store the test dates used in this reading so they persist on the frontend
      const connectionId = selectedConnectionData?.connection_id;
      if (connectionId && formData.inclusive_date.start && formData.inclusive_date.end) {
        setTestDatesByConnection(prev => ({
          ...prev,
          [connectionId]: {
            start: formData.inclusive_date.start,
            end: formData.inclusive_date.end
          }
        }));
      }

      toast.success("Success", { description: "Reading updated successfully" });
      setFormData({
        connection_id: "",
        present_reading: "",
        inclusive_date: { start: "", end: "" },
        remarks: ""
      });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message || "Failed to update reading" });
    }
  }); 
  // ------------------ HANDLERS ------------------
  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!formData.connection_id) {
    return toast.error("Validation Error", { description: "Please select a water connection" });
  }

  // 📅 Validate reading period - cannot read before start date
  const dateToCheck = formData.inclusive_date.start || selectedConnectionData?.inclusive_date?.start;
  if (dateToCheck) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(dateToCheck);
    startDate.setHours(0, 0, 0, 0);

    if (today < startDate) {
      return toast.error("Validation Error", {
        description: `Cannot record reading yet. Reading period starts on ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Today is ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`
      });
    }
  }

  // For can_read status - require remarks if cannot read
  if (isCannotRead && !formData.remarks) {
    return toast.error("Validation Error", { description: "Please provide remarks explaining why the meter cannot be read" });
  }

  // For normal reading - require present reading value (only if can_read)
  if (!isCannotRead && (!formData.present_reading || formData.present_reading === "")) {
    return toast.error("Validation Error", { description: "Please enter the present reading" });
  }

  if (!isCannotRead && !isEditing && presentReading < previousReading) {
    return toast.error("Validation Error", {
      description: `Present reading cannot be less than previous reading (${previousReading})`
    });
  }

  const payload = {
    connection_id: formData.connection_id,
    present_reading: isCannotRead ? 0 : Number(formData.present_reading),
    inclusive_date: {
      start: formData.inclusive_date.start,
      end: formData.inclusive_date.end
    },
    remarks: formData.remarks,
    can_read_status: isCannotRead ? "cannot_read" : "can_read"
  };

  if (selectedConnectionData?.reading_status === "inprogress") {
    // ✅ Update existing reading
    updateReadingMutation.mutate({
      reading_id: selectedConnectionData.reading_id,
      data: payload
    });
  } else {
    // ✅ Create new reading
    recordReadingMutation.mutate(payload);
  }
};


  // ------------------ RENDER ------------------
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <MeterReaderSidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <MeterReaderTopHeader />

        <main className="flex-1 overflow-auto p-2 relative z-10">
         
          <div className="max-w-7xl mx-auto">
            
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 ml-4">Record Meter Reading</h1>
              <p className="text-gray-600 mt-2 ml-4">Zone {meterReaderZone} - {filteredConnections.length} Connections Available</p>
               {/* place the stats card here with the reading_status  total resident in the zone the meter reader assigned and the meter reader assignex */}
            </div>

            <div className="space-y-4">
              <Card className="shadow-md">
                <CardContent className="p-3 sm:p-6">
                  {meterReaderZone && (
                    <div className="mb-6 space-y-3">
                       <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold text-green-900">Reading Status</p>
                            <p className="text-lg text-green-700">{overallReadingStatus}</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
                        
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm font-semibold text-green-900">Your Assigned Zone</p>
                            <p className="text-xs text-green-700">Zone {meterReaderZone} - {filteredConnections.length} residents</p>
                          </div>
                        </div> 
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-semibold text-blue-900">Monthly Progress</p>
                              <p className="text-xs text-blue-700">{readCount} of {totalCount} residents read this month ({progressPercentage}%)</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">{readCount}/{totalCount}</p>
                          </div>
                        </div>
                        <div className="mt-2 bg-white rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Connection select */}
                    <div className="space-y-2">
                      <Label htmlFor="connection_id" className="flex items-center space-x-2 text-base">
                        <User className="h-4 w-4" />
                        <span>Select Resident</span>
                      </Label>
                      <Select value={formData.connection_id} onValueChange={(value) => handleInputChange("connection_id", value)}>
                        <SelectTrigger className="h-14 text-base">
                          {selectedConnectionData ? (
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-col items-start">
                                <span className="font-semibold">{selectedConnectionData.full_name}</span>
                                <span className="text-xs text-gray-500">Meter No. {selectedConnectionData.meter_number}</span>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline">Zone {selectedConnectionData.zone}</Badge>
                                <Badge variant="outline">Purok {selectedConnectionData.purok_no}</Badge>
                              </div>
                            </div>
                          ) : <SelectValue placeholder="Search and select resident & meter" />}
                        </SelectTrigger>
                        <SelectContent>
                          <div className="sticky top-0 bg-white p-0 border-b z-10">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                              <Input type="text" placeholder="Search by name, purok, or meter number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 pr-10 h-14 text-base border-none rounded-none" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                              {searchQuery && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchQuery("");
                                  }}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {connectionsLoading ? (
                              <SelectItem value="loading" disabled>Loading connections...</SelectItem>
                            ) : filteredConnections.length === 0 ? (
                              <SelectItem value="no-connections" disabled>{searchQuery ? "No residents found" : "No connections in your zone"}</SelectItem>
                            ) : filteredConnections.map((connection) => {
                              const getStatusBadge = () => {
                                if (connection.can_read_status === 'cannot_read') {
                                  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs">Can't Read</Badge>;
                                }
                                return (connection.read_this_month && !connection.is_billed)
                                  ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Read</Badge>
                                  : <Badge variant="outline" className="text-gray-500 text-xs">Not Read</Badge>;
                              };
                              return (
                                <SelectItem key={connection.connection_id} value={String(connection.connection_id)}>
                                  <div className="-ml-4 flex items-center justify-between w-full gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      {connection.can_read_status === 'cannot_read' ? (
                                        <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                      ) : (connection.read_this_month && !connection.is_billed) ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                      ) : (
                                        <div className="h-4 w-4 flex-shrink-0" />
                                      )}
                                      <div className="flex flex-col">
                                        <span className="truncate text-base font-semibold">{connection.full_name || "Unnamed"}</span>
                                        <span className="text-xs text-gray-500">Meter No. {connection.meter_number}</span>
                                        {(() => {
                                          const dateSource = connection?.next_period_dates || connection?.inclusive_date;
                                          return dateSource?.start && dateSource?.end ? (
                                            <span className="text-xs text-gray-400 mt-0.5">
                                              Reading: {new Date(dateSource.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(dateSource.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                          ) : null;
                                        })()}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                      {isNextMonth(connection) && (
                                        <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs font-semibold">📅 Next Month</Badge>
                                      )}
                                      {isScheduledToday(connection) && (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs font-semibold">✓ Scheduled Today</Badge>
                                      )}
                                      <Badge variant="secondary" className="text-xs">Purok {connection.purok_no}</Badge>
                                      {getStatusBadge()}
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Next Month Warning for Future Reading Periods */}
                    {selectedConnectionData && isNextMonth(selectedConnectionData) && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-purple-900">Reading Period Starts Next Month</p>
                          <p className="text-xs text-purple-700 mt-1">
                            This new meter's reading period starts on {new Date(selectedConnectionData.inclusive_date?.start || selectedConnectionData.next_period_dates?.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                            While you can record the initial reading now, this meter will not be included in the current billing cycle.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* ------------------ NEW READING INFO BOXES ------------------ */}
                   {selectedConnectionData &&
                                    selectedConnectionData.reading_status !== "inprogress" &&
                                    selectedConnectionData.reading_status !== "submitted" &&
                                    (selectedConnectionData.reading_status !== "approved" || selectedConnectionData.is_billed) && (
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="mb-6">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-gray-600" />
                            Customer Information
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {/* Customer Name */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer Name</p>
                            <p className="text-base font-semibold text-gray-900">{selectedConnectionData.full_name}</p>
                          </div>

                          {/* Meter Number */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Meter Number</p>
                            <p className="text-base font-semibold text-gray-900">{selectedConnectionData.meter_number || 'N/A'}</p>
                          </div>

                          {/* Location */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</p>
                            <p className="text-base font-semibold text-gray-900">Zone {selectedConnectionData.zone}, Purok {selectedConnectionData.purok_no}</p>
                          </div>

                          {/* Previous Reading */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Previous Reading</p>
                            <p className="text-base font-semibold text-gray-900">{previousReading} m³</p>
                          </div>

                          {/* Consumption Estimate */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Est. Consumption</p>
                            <p className="text-base font-semibold text-gray-900">{consumption.toFixed(2)} m³</p>
                          </div>

                          {/* Previous Reading Period */}
                          {selectedConnectionData.inclusive_date?.start && selectedConnectionData.inclusive_date?.end && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Previous Period</p>
                              <p className="text-base font-semibold text-gray-900">
                                {new Date(selectedConnectionData.inclusive_date.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(selectedConnectionData.inclusive_date.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {["inprogress", "submitted"].includes(selectedConnectionData?.reading_status) &&(
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="mb-6 flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-gray-600" />
                            Edit Reading
                          </h3>
                          <Badge variant="outline" className="capitalize">
                            {selectedConnectionData.reading_status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
                          {/* Customer Name */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer Name</p>
                            <p className="text-base font-semibold text-gray-900">{selectedConnectionData.full_name}</p>
                          </div>

                          {/* Meter Number */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Meter Number</p>
                            <p className="text-base font-semibold text-gray-900">{selectedConnectionData.meter_number || 'N/A'}</p>
                          </div>

                          {/* Location */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Location</p>
                            <p className="text-base font-semibold text-gray-900">Zone {selectedConnectionData.zone}, Purok {selectedConnectionData.purok_no}</p>
                          </div>

                          {/* Present Reading */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Present Reading</p>
                            <p className="text-base font-semibold text-gray-900">{selectedConnectionData.present_reading} m³</p>
                          </div>

                          {/* Previous Reading */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Previous Reading</p>
                            <p className="text-base font-semibold text-gray-900">{selectedConnectionData.previous_reading} m³</p>
                          </div>

                          {/* Consumption */}
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Consumption</p>
                            <p className="text-base font-semibold text-gray-900">{selectedConnectionData.calculated.toFixed(2)} m³</p>
                          </div>

                          {/* Reading Period */}
                          {selectedConnectionData.inclusive_date?.start && selectedConnectionData.inclusive_date?.end && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reading Period</p>
                              <p className="text-base font-semibold text-gray-900">
                                {new Date(selectedConnectionData.inclusive_date.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(selectedConnectionData.inclusive_date.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                             
                            </div>
                          )}

                          {/* Can't Read Status */}
                          {selectedConnectionData.can_read_status === 'cannot_read' && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status</p>
                              <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Can't Read</Badge>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end border-t border-gray-200 pt-6">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6"
                            disabled={!formData.present_reading || formData.present_reading === ""}
                            onClick={() => {
                              const updatedPayload = {
                                present_reading: Number(formData.present_reading || selectedConnectionData.present_reading),
                                inclusive_date: formData.inclusive_date,
                                remarks: formData.remarks,
                              };

                              updateReadingMutation.mutate({
                                reading_id: selectedConnectionData.reading_id,
                                data: updatedPayload
                              });
                            }}
                          >
                            {updateReadingMutation.isPending ? "Updating..." : "Update Reading"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Can't Read Toggle - show unless approved and not billed */}
                    {selectedConnectionData && (selectedConnectionData?.reading_status !== "approved" || selectedConnectionData?.is_billed) && (
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Unable to Read Meter?</p>
                          <p className="text-xs text-gray-500 mt-1">Mark as unable to read if meter is inaccessible or broken</p>
                        </div>
                        <Button
                          type="button"
                          variant={isCannotRead ? "default" : "outline"}
                          className={isCannotRead ? "bg-red-600 hover:bg-red-700" : ""}
                          onClick={() => {
                            setIsCannotRead(!isCannotRead);
                            if (!isCannotRead) {
                              setFormData(prev => ({...prev, present_reading: "", can_read_status: "cannot_read"}));
                            } else {
                              setFormData(prev => ({...prev, can_read_status: "can_read"}));
                            }
                          }}
                          disabled={!selectedConnectionData}
                        >
                          {isCannotRead ? "Marked as Unable to Read" : "Mark as Unable to Read"}
                        </Button>
                      </div>

                      {isCannotRead && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="flex items-center space-x-2 text-base">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <span>Reason Why Meter Cannot Be Read <span className="text-red-600">*</span></span>
                            </Label>
                            <Textarea
                              placeholder="Explain why the meter cannot be read (e.g., meter is broken, meter not found, access blocked, etc.)"
                              value={formData.remarks}
                              onChange={(e) => handleInputChange("remarks", e.target.value)}
                              className="min-h-24"
                            />
                          </div>
                          <Button
                            type="button"
                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => setShowIssueDialog(true)}
                            disabled={!formData.remarks.trim()}
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Report This Issue
                          </Button>
                        </div>
                      )}
                    </div>
                    )}

                    {/* Show approval message when overall reading status is approved and not yet billed */}
                    {shouldShowApprovalMessage && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-green-900 mb-2">
                              Your Reading Has Been Approved
                            </h3>
                            <div className="text-green-800 space-y-2 text-sm">
                              <p>
                                Your meter reading has been reviewed and approved by the administrator. Thank you for your diligent work!
                              </p>
                              <p>
                                <strong>Next Steps:</strong> The treasurer will now generate the billing for this reading cycle. Once billing is complete, you'll be able to record readings for the next month.
                              </p>
                              <p className="flex items-center gap-2 mt-3">
                                <AlertCircle className="h-4 w-4" />
                                You can record new readings for this connection after the next billing cycle begins.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* FORM INPUTS */}
                    {(overallReadingStatus !== "Approved" || (overallReadingStatus === "Approved" && zoneConnections.some(c => c.is_billed))) && !isCannotRead && (
                      <div className="space-y-2">
                        <Label htmlFor="present_reading" className="flex items-center space-x-2 text-base">
                          <Gauge className="h-4 w-4" />
                          <span>Present Reading (m³)</span>
                        </Label>
                        <Input
                          id="present_reading"
                          type="number"
                          step="0.1"
                          placeholder="Enter current meter reading"
                          value={formData.present_reading}
                          onChange={(e) => handleInputChange("present_reading", e.target.value)}
                          className="h-12 text-base text-lg font-semibold"
                          disabled={!selectedConnectionData}
                        />
                      </div>
                    )}

                    {/* Date and Remarks Inputs */}
                    {(overallReadingStatus !== "Approved" || (overallReadingStatus === "Approved" && zoneConnections.some(c => c.is_billed))) && !isEditing && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="flex items-center space-x-2 text-base">
                            <Calendar className="h-4 w-4" />
                            <span>Reading Period</span>
                          </Label>
                          {/* Show the next period dates to use for input (either current reading period or rolled-over connection period) */}
                          {(selectedConnectionData?.inclusive_date?.start && selectedConnectionData?.inclusive_date?.end) || (selectedConnectionData?.next_period_dates?.start && selectedConnectionData?.next_period_dates?.end) ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (!isEditingDates) {
                                  // Use next_period_dates if available (when billed), otherwise use inclusive_date
                                  const dateSource = selectedConnectionData?.next_period_dates || selectedConnectionData?.inclusive_date;
                                  const startStr = new Date(dateSource.start).toISOString().split('T')[0];
                                  const endStr = new Date(dateSource.end).toISOString().split('T')[0];
                                  setEditedDates({ start: startStr, end: endStr });
                                }
                                setIsEditingDates(!isEditingDates);
                              }}
                              className="text-xs"
                            >
                              {isEditingDates ? 'Cancel' : 'Edit (Test)'}
                            </Button>
                          ) : null}
                        </div>
                        {selectedConnectionData?.inclusive_date?.start && selectedConnectionData?.inclusive_date?.end ? (() => {
                          const connectionId = selectedConnectionData.connection_id;
                          const storedTestDates = testDatesByConnection[connectionId];
                          // Use next_period_dates if this reading is billed (showing next period to read), otherwise use inclusive_date
                          const periodDatesToUse = selectedConnectionData?.next_period_dates || selectedConnectionData?.inclusive_date;
                          const displayStartDate = isEditingDates ? new Date(editedDates.start) : (storedTestDates ? new Date(storedTestDates.start) : (formData.inclusive_date.start ? new Date(formData.inclusive_date.start) : new Date(periodDatesToUse.start)));
                          const displayEndDate = isEditingDates ? new Date(editedDates.end) : (storedTestDates ? new Date(storedTestDates.end) : (formData.inclusive_date.end ? new Date(formData.inclusive_date.end) : new Date(periodDatesToUse.end)));

                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const startDate = new Date(displayStartDate);
                          startDate.setHours(0, 0, 0, 0);
                          const endDate = new Date(displayEndDate);
                          endDate.setHours(0, 0, 0, 0);

                          const isBeforeStart = today < startDate;
                          const isWithinPeriod = today >= startDate && today <= endDate;
                          const isAfterEnd = today > endDate;

                          return (
                            <div className={`border rounded-lg p-4 space-y-3 ${isBeforeStart ? 'bg-yellow-50 border-yellow-200' : isWithinPeriod ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
                              <div className="flex items-center justify-between">
                                <p className={`text-sm font-medium ${isBeforeStart ? 'text-yellow-800' : isWithinPeriod ? 'text-green-800' : 'text-blue-800'}`}>
                                  {isBeforeStart ? '⏳ Reading Not Yet Available' : isWithinPeriod ? '✅ Reading Period Active' : '📖 Reading Period Ended (Late Recording)'}
                                </p>
                              </div>
                              <p className={`text-xs ${isBeforeStart ? 'text-yellow-700' : isWithinPeriod ? 'text-green-700' : 'text-blue-700'}`}>
                                {isEditingDates ? '(Testing mode - editing dates)' : 'Reading dates automatically set from meter installation'}
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="start_date" className="text-sm font-medium">Start Date</Label>
                                  {isEditingDates ? (
                                    <Input
                                      type="date"
                                      value={editedDates.start}
                                      onChange={(e) => setEditedDates(prev => ({ ...prev, start: e.target.value }))}
                                      className="text-base"
                                    />
                                  ) : (
                                    <div className={`border rounded-md p-3 text-base font-semibold ${isBeforeStart ? 'bg-white border-yellow-300 text-yellow-900' : isWithinPeriod ? 'bg-white border-green-300 text-green-900' : 'bg-white border-blue-300 text-gray-900'}`}>
                                      {displayStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="end_date" className="text-sm font-medium">End Date</Label>
                                  {isEditingDates ? (
                                    <Input
                                      type="date"
                                      value={editedDates.end}
                                      onChange={(e) => setEditedDates(prev => ({ ...prev, end: e.target.value }))}
                                      className="text-base"
                                    />
                                  ) : (
                                    <div className={`border rounded-md p-3 text-base font-semibold ${isBeforeStart ? 'bg-white border-yellow-300 text-yellow-900' : isWithinPeriod ? 'bg-white border-green-300 text-green-900' : 'bg-white border-blue-300 text-gray-900'}`}>
                                      {displayEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {isEditingDates && (
                                <div className="flex justify-end space-x-2 pt-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditingDates(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => {
                                      if (editedDates.start && editedDates.end) {
                                        const connectionId = selectedConnectionData.connection_id;
                                        // Store test dates per connection so they persist across page refreshes/switches
                                        setTestDatesByConnection(prev => ({
                                          ...prev,
                                          [connectionId]: {
                                            start: editedDates.start,
                                            end: editedDates.end
                                          }
                                        }));
                                        setFormData(prev => ({
                                          ...prev,
                                          inclusive_date: {
                                            start: editedDates.start,
                                            end: editedDates.end
                                          }
                                        }));
                                        setIsEditingDates(false);
                                        toast.success("Test dates updated", {
                                          description: `Start: ${new Date(editedDates.start).toLocaleDateString()}, End: ${new Date(editedDates.end).toLocaleDateString()}`
                                        });
                                      } else {
                                        toast.error("Please select both dates");
                                      }
                                    }}
                                  >
                                    Save Dates
                                  </Button>
                                </div>
                              )}
                              {!isEditingDates && isBeforeStart && (
                                <div className="bg-yellow-100 border border-yellow-300 rounded p-2 text-xs text-yellow-900">
                                  <strong>Note:</strong> You cannot record a reading yet. Reading will be available starting {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
                                </div>
                              )}
                              {!isEditingDates && isAfterEnd && (
                                <div className="bg-blue-100 border border-blue-300 rounded p-2 text-xs text-blue-900">
                                  <strong>Note:</strong> Reading period ended on {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. If you encounter issues, you may still record the reading.
                                </div>
                              )}
                            </div>
                          );
                        })() : (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <p className="text-sm text-yellow-800">
                              <AlertCircle className="inline h-4 w-4 mr-2" />
                              Reading period will be automatically set once meter installation is completed by maintenance personnel.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {(overallReadingStatus !== "Approved" || (overallReadingStatus === "Approved" && zoneConnections.some(c => c.is_billed))) && (
                      <div className="flex justify-end space-x-3">
                        <Button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                          disabled={
                            recordReadingMutation.isPending ||
                            selectedConnectionData?.reading_status === "inprogress" ||
                            selectedConnectionData?.reading_status === "submitted"
                          }
                        >
                          {recordReadingMutation.isPending ? "Recording..." : "Record Reading"}
                        </Button>
                        <Button
                          type="button"
                          disabled={
                            submitAllReadingsMutation.isPending ||
                            filteredConnections.every(conn =>
                               conn.reading_status === "submitted"
                            || conn.reading_status === "approved")
                          }
                          className="bg-green-600 hover:bg-green-700 text-white h-12"
                          onClick={() => submitAllReadingsMutation.mutate()}
                        >
                          {submitAllReadingsMutation.isPending ? "Submitting..." : "Submit All Readings"}
                        </Button>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Meter Issue Report Dialog */}
      <MeterIssueReportDialog
        open={showIssueDialog}
        onOpenChange={setShowIssueDialog}
        connection={selectedConnectionData}
        meterReader={authUser}
      />
    </div>
  );
}
