import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { Gauge, Calendar, User, MapPin, Plus, Search, Filter, CheckCircle2, Save, AlertCircle } from "lucide-react";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import { apiClient } from "../lib/api";
import { Badge } from "../components/ui/badge";


export default function MeterReaderReadings() {
  const [formData, setFormData] = useState({
    connection_id: "",
    present_reading: "",
    inclusive_date: { start: "", end: "" },
    remarks: "",
    can_read_status: "can_read"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [savedPeriod, setSavedPeriod] = useState(null);
  const [isCannotRead, setIsCannotRead] = useState(false);
  const queryClient = useQueryClient();

  // Load saved reading period from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('meterReadingPeriod');
    if (saved) {
      try {
        const period = JSON.parse(saved);
        setSavedPeriod(period);
        setFormData(prev => ({
          ...prev,
          inclusive_date: period
        }));
      } catch (error) {
        console.error('Failed to load saved period:', error);
      }
    }
  }, []);

  // Fetch connections
  const { data: connectionsResponse, isLoading: connectionsLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => apiClient.getLatestReadings()
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
  

  // Filtered connections by zone + search query
  const filteredConnections = connectionList
    .filter((conn) => {
      const matchesZone = meterReaderZone ? conn.zone === meterReaderZone : true;
      const matchesSearch = searchQuery
        ? conn.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conn.purok_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conn.meter_number?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesZone && matchesSearch;
    })
    .sort((a, b) => Number(a.purok_no) - Number(b.purok_no));

  console.log('filtter', filteredConnections);

  const overallReadingStatus = (() => {
  if (filteredConnections.length === 0) return "No Data";

  // Only consider unbilled readings for status
  const unbilledConnections = filteredConnections.filter(c => !c.is_billed);

  if (unbilledConnections.length === 0) return "Ready to read"; // All billed, ready for new readings

  const allApproved = unbilledConnections.every(c => c.reading_status === "approved");
  const anySubmitted = unbilledConnections.some(c => c.reading_status === "submitted");
  const allInProgress = unbilledConnections.every(c => c.reading_status === "inprogress");

  if (allApproved) return "Approved";
  if (anySubmitted) return "Submitted";
  if (allInProgress) return "In Progress";
  return "In Progress"; // fallback
})();

  // Monthly progress - only count unbilled readings
  const readCount = filteredConnections.filter(conn => conn.read_this_month && !conn.is_billed).length;
  console.log('read count', readCount);

  const totalCount = filteredConnections.length;
  const progressPercentage = totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

  const selectedConnectionData = filteredConnections.find(
    (conn) => String(conn.connection_id) === String(formData.connection_id)
  );

  console.log('selected bitch', selectedConnectionData);

  const previousReading = selectedConnectionData?.present_reading || 0;
  const presentReading = parseFloat(formData.present_reading) || 0;
  const consumption = presentReading > previousReading ? presentReading - previousReading : 0;

  const isEditing = selectedConnectionData?.reading_status === "inprogress";

  // ------------------ MUTATIONS ------------------
  const recordReadingMutation = useMutation({
    mutationFn: async (readingData) => apiClient.inputReading(readingData),
    onSuccess: () => {
      toast.success("Success", { description: "" });
      // ✅ Keep saved period when resetting form
      const currentPeriod = savedPeriod || { start: "", end: "" };
      setFormData({
        connection_id: "",
        present_reading: "",
        inclusive_date: currentPeriod,
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
        // Call your apiClient method
        return apiClient.updateReadings(reading_id, data);
      },
      onSuccess: () => {
        toast.success("Success", { description: "" });
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

  // ✅ Save reading period to localStorage
  const handleSavePeriod = () => {
    if (!formData.inclusive_date.start || !formData.inclusive_date.end) {
      return toast.error("Validation Error", { description: "Please enter both start and end dates before saving" });
    }

    // Validate that end date is not before start date
    if (new Date(formData.inclusive_date.end) < new Date(formData.inclusive_date.start)) {
      return toast.error("Validation Error", { description: "End date cannot be before start date" });
    }

    const period = {
      start: formData.inclusive_date.start,
      end: formData.inclusive_date.end
    };

    localStorage.setItem('meterReadingPeriod', JSON.stringify(period));
    setSavedPeriod(period);

    toast.success("Success", { description: "Reading period saved! It will be used for all future readings." });
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  if (!formData.connection_id) {
    return toast.error("Validation Error", { description: "Please select a water connection" });
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

  if (!formData.inclusive_date.start || !formData.inclusive_date.end) {
    return toast.error("Validation Error", { description: "Please enter both start and end dates" });
  }

  // Validate that end date is not before start date
  if (new Date(formData.inclusive_date.end) < new Date(formData.inclusive_date.start)) {
    return toast.error("Validation Error", { description: "End date cannot be before start date" });
  }

  // Validate that start date is AFTER the previous reading end date
  if (selectedConnectionData?.inclusive_date?.end) {
    const previousEndDate = new Date(selectedConnectionData.inclusive_date.end);
    const newStartDate = new Date(formData.inclusive_date.start);

    if (newStartDate <= previousEndDate) {
      return toast.error("Validation Error", {
        description: `Start date must be after the previous reading period end date (${previousEndDate.toLocaleDateString()}). Cannot read from the past.`
      });
    }
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
      reading_id: selectedConnectionData._id,
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
                                <span className="text-xs text-gray-500">Meter #{selectedConnectionData.meter_number}</span>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="outline">Zone {selectedConnectionData.zone}</Badge>
                                <Badge variant="outline">Purok {selectedConnectionData.purok_no}</Badge>
                              </div>
                            </div>
                          ) : <SelectValue placeholder="Search and select resident & meter" />}
                        </SelectTrigger>
                        <SelectContent>
                          <div className="sticky top-0 bg-white p-2 border-b z-10">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input type="text" placeholder="Search by name, purok, or meter number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
                            </div>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            {connectionsLoading ? (
                              <SelectItem value="loading" disabled>Loading connections...</SelectItem>
                            ) : filteredConnections.length === 0 ? (
                              <SelectItem value="no-connections" disabled>{searchQuery ? "No residents found" : "No connections in your zone"}</SelectItem>
                            ) : filteredConnections.map((connection) => (
                              <SelectItem key={connection.connection_id} value={String(connection.connection_id)}>
                                <div className="-ml-4 flex items-center justify-between w-full gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {(connection.read_this_month && !connection.is_billed) ? <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" /> : <div className="h-4 w-4 flex-shrink-0" />}
                                    <div className="flex flex-col">
                                      <span className="truncate text-base font-semibold">{connection.full_name || "Unnamed"}</span>
                                      <span className="text-xs text-gray-500">Meter #{connection.meter_number}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Badge variant="secondary" className="text-xs">Purok {connection.purok_no}</Badge>
                                    {(connection.read_this_month && !connection.is_billed) ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">Read</Badge> : <Badge variant="outline" className="text-gray-500 text-xs">Not Read</Badge>}
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>

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

                    {/* Can't Read Toggle */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Unable to Read Meter?</p>
                          <p className="text-xs text-gray-500 mt-1">Mark as unable to read if meter is inaccessible or broken</p>
                        </div>
                        <Button
                          type="button"
                          variant={isCannotRead ? "default" : "outline"}
                          className={isCannotRead ? "bg-blue-600 hover:bg-blue-700" : ""}
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
                    </div>

                    {/* FORM INPUTS */}
                    {!isCannotRead && (
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
                          disabled={
                                    !selectedConnectionData ||
                                    (selectedConnectionData?.reading_status === "approved" && !selectedConnectionData?.is_billed)
                                  }/>
                      </div>
                    )}

                    {/* Date and Remarks Inputs */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center space-x-2 text-base">
                          <Calendar className="h-4 w-4" />
                          <span>Reading Period</span>
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleSavePeriod}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-3.5 w-3.5" />
                          Save Period
                        </Button>
                      </div>
                      {savedPeriod && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm text-blue-700">
                          <span className="font-medium">Saved:</span> {new Date(savedPeriod.start).toLocaleDateString()} - {new Date(savedPeriod.end).toLocaleDateString()}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="start_date" className="text-sm font-medium">
                            Start Date
                            {selectedConnectionData?.inclusive_date?.end && (
                              <span className="text-xs text-gray-500 ml-1">
                                (Must be after {new Date(selectedConnectionData.inclusive_date.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                              </span>
                            )}
                          </Label>
                          <Input
                            id="start_date"
                            type="date"
                            value={formData.inclusive_date.start}
                            onChange={(e) => handleInputChange("inclusive_date.start", e.target.value)}
                            min={selectedConnectionData?.inclusive_date?.end}
                            disabled={!selectedConnectionData}
                          />
                          {selectedConnectionData?.inclusive_date?.end && new Date(formData.inclusive_date.start) <= new Date(selectedConnectionData.inclusive_date.end) && formData.inclusive_date.start && (
                            <p className="text-xs text-red-600 mt-1">
                              ⚠️ Start date must be after the previous reading end date ({new Date(selectedConnectionData.inclusive_date.end).toLocaleDateString()})
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_date" className="text-sm font-medium">End Date</Label>
                          <Input
                            id="end_date"
                            type="date"
                            value={formData.inclusive_date.end}
                            onChange={(e) => handleInputChange("inclusive_date.end", e.target.value)}
                            min={formData.inclusive_date.start}
                            disabled={!selectedConnectionData}
                          />
                        </div>
                      </div>

                      {isCannotRead && (
                        <>
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
                        </>
                      )}
                      {!isCannotRead && (
                        <>
                          <Label className="flex items-center space-x-2 text-base">
                            <span>Remarks (Optional)</span>
                          </Label>
                          <Textarea
                            placeholder="Enter any remarks about this reading"
                            value={formData.remarks}
                            onChange={(e) => handleInputChange("remarks", e.target.value)}
                          />
                        </>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3">
                     <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                        disabled={
                          recordReadingMutation.isPending ||
                          selectedConnectionData?.reading_status === "inprogress" ||
                          selectedConnectionData?.reading_status === "submitted" ||
                          (selectedConnectionData?.reading_status === "approved" && !selectedConnectionData?.is_billed)
                        }
                      >
                        {recordReadingMutation.isPending ? "Recording..." : "Record Reading"}
                      </Button>
                      {/* i want here to disabled the button if the reading.status is submitted my current style is im using the selectedConnectionData but what i want is not only the selected but all data that have readingstatus of submitted */}
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
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
