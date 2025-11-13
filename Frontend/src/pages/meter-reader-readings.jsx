import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { Gauge, Calendar, User, MapPin, Plus, Search, Filter, TrendingUp, CheckCircle2, Save } from "lucide-react";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import { apiClient } from "../lib/api";
import { Badge } from "../components/ui/badge";


export default function MeterReaderReadings() {
  const [formData, setFormData] = useState({
    connection_id: "",
    present_reading: "",
    inclusive_date: { start: "", end: "" },
    remarks: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [savedPeriod, setSavedPeriod] = useState(null);
  const { toast } = useToast();
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
          conn.purok_no?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      return matchesZone && matchesSearch;
    })
    .sort((a, b) => Number(a.purok_no) - Number(b.purok_no));

  console.log('filtter', filteredConnections);

  const overallReadingStatus = (() => {
  if (filteredConnections.length === 0) return "No Data";

  const allApproved = filteredConnections.every(c => c.reading_status === "approved");
  const anySubmitted = filteredConnections.some(c => c.reading_status === "submitted");
  const allInProgress = filteredConnections.every(c => c.reading_status === "inprogress");

  if (allApproved) return "Approved";
  if (anySubmitted) return "Submitted";
  if (allInProgress) return "In Progress";
  return "In Progress"; // fallback
})();

  // Monthly progress
  const readCount = filteredConnections.filter(conn => conn.read_this_month).length;
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
      toast({ title: "Success", description: "Meter reading recorded successfully" });
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
      toast({ title: "Error", description: error.message || "Failed to record meter reading", variant: "destructive" });
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
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message || "All readings submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message || "Failed to submit readings", variant: "destructive" });
    }
  });

  // Update reading mutation
 const updateReadingMutation = useMutation({
      mutationFn: async ({ reading_id, data }) => {
        // Call your apiClient method
        return apiClient.updateReadings(reading_id, data);
      },
      onSuccess: (response) => {
        toast({ title: "Success", description: response.message || "Reading updated successfully" });
        queryClient.invalidateQueries({ queryKey: ["connections"] });
      },
      onError: (error) => {
        toast({ title: "Error", description: error.message || "Failed to update reading", variant: "destructive" });
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
      return toast({
        title: "Validation Error",
        description: "Please enter both start and end dates before saving",
        variant: "destructive"
      });
    }

    const period = {
      start: formData.inclusive_date.start,
      end: formData.inclusive_date.end
    };

    localStorage.setItem('meterReadingPeriod', JSON.stringify(period));
    setSavedPeriod(period);

    toast({
      title: "Success",
      description: "Reading period saved! It will be used for all future readings."
    });
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  if (!formData.connection_id) {
    return toast({
      title: "Validation Error",
      description: "Please select a water connection",
      variant: "destructive"
    });
  }

  if (!formData.present_reading) {
    return toast({
      title: "Validation Error",
      description: "Please enter the present reading",
      variant: "destructive"
    });
  }


  if (!isEditing && presentReading < previousReading) {
    return toast({
      title: "Validation Error",
      description: `Present reading (${presentReading}) cannot be less than previous reading (${previousReading})`,
      variant: "destructive"
    });
  }

  if (!formData.inclusive_date.start || !formData.inclusive_date.end) {
    return toast({
      title: "Validation Error",
      description: "Please enter both start and end dates",
      variant: "destructive"
    }); 
  }

  const payload = {
    connection_id: formData.connection_id,
    present_reading: Number(formData.present_reading),
    inclusive_date: {
      start: formData.inclusive_date.start,
      end: formData.inclusive_date.end
    },
    remarks: formData.remarks
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
                        <SelectTrigger className="h-12 text-base">
                          {selectedConnectionData ? (
                            <div className="flex items-center justify-between w-full">
                              <span>{selectedConnectionData.full_name}</span>
                              <Badge variant="outline" className="ml-2">Zone {selectedConnectionData.zone}</Badge>
                            </div>
                          ) : <SelectValue placeholder="Search and select resident" />}
                        </SelectTrigger>
                        <SelectContent>
                          <div className="sticky top-0 bg-white p-2 border-b z-10">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              <Input type="text" placeholder="Search by name or purok..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()} />
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
                                    <span className="truncate text-lg">{connection.full_name || "Unnamed"}</span>
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

                    {/* ------------------ SHORT-CIRCUIT RENDERING ------------------ */}
                   {selectedConnectionData &&
                                    selectedConnectionData.reading_status !== "inprogress" &&
                                    selectedConnectionData.reading_status !== "submitted" &&
                                   selectedConnectionData.reading_status !== "approved" && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-5 rounded-xl border border-blue-100 space-y-3">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="bg-white p-3 rounded-lg">
                            <span className="font-medium text-gray-600 block mb-1">Customer</span>
                            <p className="text-gray-900 font-semibold">{selectedConnectionData.full_name}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="font-medium text-gray-600 block mb-1">Purok</span>
                            <p className="text-gray-900 font-semibold">Purok {selectedConnectionData.purok_no}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="font-medium text-gray-600 block mb-1">Previous Reading</span>
                            <p className="text-blue-600 font-bold text-lg">{previousReading} m³</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="font-medium text-gray-600 block mb-1">Consumption</span>
                            <p className="text-green-600 font-bold text-lg">{consumption.toFixed(2)} m³</p>
                          </div>
                          {selectedConnectionData.inclusive_date?.start && selectedConnectionData.inclusive_date?.end && (
                            <div className="bg-white p-3 rounded-lg col-span-2 lg:col-span-1">
                              <span className="font-medium text-gray-600 block mb-1">Previous Reading Period</span>
                              <p className="text-gray-900 font-semibold text-xs">
                                {new Date(selectedConnectionData.inclusive_date.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(selectedConnectionData.inclusive_date.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                  {["inprogress", "submitted"].includes(selectedConnectionData?.reading_status) &&(
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-5 rounded-xl border border-blue-100 space-y-3">
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div className="bg-white p-3 rounded-lg">
                            <span className="font-medium text-gray-600 block mb-1">Customer</span>
                            <p className="text-gray-900 font-semibold">{selectedConnectionData.full_name}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="font-medium text-gray-600 block mb-1">Purok</span>
                            <p className="text-gray-900 font-semibold">Purok {selectedConnectionData.purok_no}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="font-medium text-gray-600 block mb-1">Present Reading</span>
                            <p className="text-blue-600 font-bold text-lg">{selectedConnectionData.present_reading} m³</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="font-medium text-gray-600 block mb-1">Previous Reading</span>
                            <p className="text-blue-600 font-bold text-lg">{selectedConnectionData.previous_reading} m³</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <span className="font-medium text-gray-600 block mb-1">Consumption</span>
                            <p className="text-green-600 font-bold text-lg">{selectedConnectionData.calculated.toFixed(2)} m³</p>
                          </div>
                          {selectedConnectionData.inclusive_date?.start && selectedConnectionData.inclusive_date?.end && (
                            <div className="bg-white p-3 rounded-lg col-span-2 lg:col-span-1">
                              <span className="font-medium text-gray-600 block mb-1">Reading Period</span>
                              <p className="text-gray-900 font-semibold text-xs">
                                {new Date(selectedConnectionData.inclusive_date.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} - {new Date(selectedConnectionData.inclusive_date.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* EDIT BUTTON */}
                        <div className="mt-4 flex justify-end">
                          <Button
                            className="bg-green-500 hover:bg-green-600 text-white h-10"
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

                    {/* FORM INPUTS */}
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
                        <Input type="date" value={formData.inclusive_date.start} onChange={(e) => handleInputChange("inclusive_date.start", e.target.value)} />
                        <Input type="date" value={formData.inclusive_date.end} onChange={(e) => handleInputChange("inclusive_date.end", e.target.value)} />
                      </div>

                      <Label className="flex items-center space-x-2 text-base">
                        <span>Remarks</span>
                      </Label>
                      <Textarea placeholder="Enter any remarks" value={formData.remarks} onChange={(e) => handleInputChange("remarks", e.target.value)} />
                    </div>

                    <div className="flex justify-end space-x-3">
                     <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white h-12"
                        disabled={
                          recordReadingMutation.isPending ||
                          selectedConnectionData?.reading_status === "inprogress" ||
                          selectedConnectionData?.reading_status === "submitted" ||
                           selectedConnectionData?.reading_status === "approved"
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
