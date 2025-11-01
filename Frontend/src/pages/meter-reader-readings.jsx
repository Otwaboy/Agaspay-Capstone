import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { Gauge, Calendar, User, MapPin, Plus, Search, Filter, TrendingUp } from "lucide-react";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import { apiClient } from "../lib/api";
import { Badge } from "../components/ui/badge";

export default function MeterReaderReadings() {
  const [formData, setFormData] = useState({
    connection_id: "",
    present_reading: "",
    inclusive_date: {
      start: "",
      end: ""
    },
    remarks: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: connectionsResponse, isLoading: connectionsLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      return await apiClient.getLatestReadings();
    }
  });

  const { data: authUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const response = await apiClient.get("/auth/me");
      return response.data;
    }
  });

  const connectionList = connectionsResponse?.connection_details || [];
  const meterReaderZone = authUser?.user?.assigned_zone;

  const filteredConnections = connectionList.filter((conn) => {
    const matchesZone = meterReaderZone ? conn.zone === meterReaderZone : true;
    const matchesSearch = searchQuery
      ? conn.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.purok_no?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesZone && matchesSearch;
  });

  const selectedConnectionData = filteredConnections.find(
    (conn) => String(conn.connection_id) === String(formData.connection_id)
  );

  const previousReading = selectedConnectionData?.present_reading || 0;
  const presentReading = parseFloat(formData.present_reading) || 0;
  const consumption = presentReading > previousReading ? presentReading - previousReading : 0;

  const recordReadingMutation = useMutation({
    mutationFn: async (readingData) => {
      return await apiClient.inputReading(readingData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Meter reading recorded successfully"
      });
      setFormData({
        connection_id: "",
        present_reading: "",
        inclusive_date: { start: "", end: "" },
        remarks: ""
      });
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record meter reading",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value
      }));
    }
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

    if (presentReading < previousReading) {
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

    recordReadingMutation.mutate(payload);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <MeterReaderSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MeterReaderTopHeader />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Record Meter Reading</h1>
              <p className="text-gray-600 mt-2">Zone {meterReaderZone} - {filteredConnections.length} Connections Available</p>
            </div>

            <div className="space-y-4">
            <Card className="shadow-md">
              <CardContent className="p-4 sm:p-6">
                {meterReaderZone && (
                  <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-green-900">Your Assigned Zone</p>
                        <p className="text-xs text-green-700">Zone {meterReaderZone} - {filteredConnections.length} residents</p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="connection_id" className="flex items-center space-x-2 text-base">
                      <User className="h-4 w-4" />
                      <span>Select Resident</span>
                    </Label>
                    <Select
                      value={formData.connection_id}
                      onValueChange={(value) => handleInputChange("connection_id", value)}
                      data-testid="select-connection"
                    >
                      <SelectTrigger className="h-12 text-base">
                        {selectedConnectionData ? (
                          <div className="flex items-center justify-between w-full">
                            <span>{selectedConnectionData.full_name}</span>
                            <Badge variant="outline" className="ml-2">Zone {selectedConnectionData.zone}</Badge>
                          </div>
                        ) : (
                          <SelectValue placeholder="Search and select resident" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <div className="sticky top-0 bg-white p-2 border-b z-10">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              type="text"
                              placeholder="Search by name or purok..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9 h-9 text-sm"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                          {connectionsLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading connections...
                            </SelectItem>
                          ) : filteredConnections.length === 0 ? (
                            <SelectItem value="no-connections" disabled>
                              {searchQuery ? "No residents found" : "No connections in your zone"}
                            </SelectItem>
                          ) : (
                            filteredConnections.map((connection) => (
                              <SelectItem
                                key={connection.connection_id}
                                value={String(connection.connection_id)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span>{connection.full_name || "Unnamed"}</span>
                                  <Badge variant="secondary" className="ml-2 text-xs">Purok {connection.purok_no}</Badge>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedConnectionData && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-5 rounded-xl border border-blue-100 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
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
                      </div>
                    </div>
                  )}

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
                      data-testid="input-present-reading"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="flex items-center space-x-2 text-base">
                      <Calendar className="h-4 w-4" />
                      <span>Reading Period</span>
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start" className="text-sm font-medium">
                          Start Date
                        </Label>
                        <Input
                          id="start"
                          type="date"
                          value={formData.inclusive_date.start}
                          onChange={(e) => handleInputChange("inclusive_date.start", e.target.value)}
                          className="h-12 text-base"
                          data-testid="input-start-date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end" className="text-sm font-medium">
                          End Date
                        </Label>
                        <Input
                          id="end"
                          type="date"
                          value={formData.inclusive_date.end}
                          onChange={(e) => handleInputChange("inclusive_date.end", e.target.value)}
                          className="h-12 text-base"
                          data-testid="input-end-date"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks" className="flex items-center space-x-2 text-base">
                      <MapPin className="h-4 w-4" />
                      <span>Remarks (Optional)</span>
                    </Label>
                    <Textarea
                      id="remarks"
                      placeholder="Any notes about this reading (e.g., meter condition, access issues)..."
                      value={formData.remarks}
                      onChange={(e) => handleInputChange("remarks", e.target.value)}
                      className="min-h-[100px] text-base"
                      data-testid="textarea-remarks"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setFormData({
                          connection_id: "",
                          present_reading: "",
                          inclusive_date: { start: "", end: "" },
                          remarks: ""
                        });
                        setSearchQuery("");
                      }}
                      className="flex-1 h-12 text-base"
                      data-testid="button-cancel"
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={recordReadingMutation.isPending}
                      className="flex-1 h-12 text-base bg-green-600 hover:bg-green-700"
                      data-testid="button-submit"
                    >
                      {recordReadingMutation.isPending ? "Recording..." : "Record Reading"}
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
