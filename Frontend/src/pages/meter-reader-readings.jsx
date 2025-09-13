import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import { Gauge, Calendar, User, MapPin, Plus } from "lucide-react";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import { apiClient } from "../lib/api";

export default function MeterReaderReadings() {

  const [formData, setFormData] = useState({
    connection_id: "",
    present_reading: "",
    inclusive_date: {
      start_date: "",
      end_date: ""
    },
    remarks: ""

  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ✅ Fetch water connections
  const { data: connectionsResponse, isLoading: connectionsLoading } = useQuery({
    queryKey: ["connections"],
    queryFn: async () => {
      return await apiClient.getWaterConnections(); 
      // returns { message, connection_details: [...] }
    }
  });

  const connectionList = connectionsResponse?.connection_details || [];


  // Find selected connection
const selectedConnectionData = connectionList.find(
  (conn) => String(conn.connection_id) === String(formData.connection_id) // id form mongodb
);

// ✅ Debug logs (plain JS, not JSX)
console.log("connection list ni", connectionList);
  console.log("connection_id ni ha", formData.connection_id);
  console.log("selectedConnectionData", selectedConnectionData);

  const previousReading = selectedConnectionData?.previous_reading || 0;

  // Consumption 
  const presentReading = parseFloat(formData.present_reading) || 0;
  const consumption =
    presentReading > previousReading ? presentReading - previousReading : 0;

  // ✅ Record reading
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
        inclusive_date: { start_date: "", end_date: "" },
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

  // Input handler
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

  // Submit handler
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

    if (!formData.inclusive_date.start_date || !formData.inclusive_date.end_date) {
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
        start: formData.inclusive_date.start_date,
        end: formData.inclusive_date.end_date
      },
      remarks: formData.remarks
    };

    recordReadingMutation.mutate(payload);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <MeterReaderSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Gauge className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Record Meter Reading</h1>
              <p className="text-sm text-gray-500">Input water consumption measurements</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>New Meter Reading</span>
                </CardTitle>
              </CardHeader>
              <CardContent>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Connection Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="connection_id" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Water Connection</span>
                    </Label> 


          {/* handle sa mga names selected */}
                    <Select
                      value={formData.connection_id}
                      onValueChange={(value) => handleInputChange("connection_id", value)}
                      data-testid="select-connection"
                    >
                       <SelectTrigger>
                              {selectedConnectionData ? (
                                <span>{selectedConnectionData.full_name}</span>
                              ) : (
                                <SelectValue placeholder="Select Resident" />
                              )}
                              
                            </SelectTrigger>

                      <SelectContent>
                        {connectionsLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading connections...
                          </SelectItem>
                        ) : connectionList.length === 0 ? (
                          <SelectItem value="no-connections" disabled>
                            No connections available
                          </SelectItem>
                        ) : (
                          connectionList.map((connection) => (
                            <SelectItem
                              key={connection.connection_id}
                              value={String(connection.connection_id)} // ✅ use _id
                            >
                              {connection.full_name || "Unnamed"}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>

                  </div>


                  {/* Connection Details */}
                  
                  {selectedConnectionData && (
                    
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Customer:</span>
                          <p className="text-gray-900">
                            {selectedConnectionData.full_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Purok:</span>
                          <p className="text-gray-900">
                            {selectedConnectionData.purok_no || "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Previous Reading:</span>
                          <p className="text-gray-900">{previousReading} m³</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Calculated Consumption:</span>
                          <p className="text-blue-600 font-semibold">
                            {consumption.toFixed(2)} m³
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Present Reading */}
                  <div className="space-y-2">
                    <Label htmlFor="present_reading" className="flex items-center space-x-2">
                      <Gauge className="h-4 w-4" />
                      <span>Present Reading (m³)</span>
                    </Label>
                    <Input
                      id="present_reading"
                      type="number"
                      step="0.1"
                      placeholder="Enter current meter reading"
                      value={formData.present_reading}
                      onChange={(e) =>
                        handleInputChange("present_reading", e.target.value)
                      }
                      data-testid="input-present-reading"
                    />
                  </div>

                  {/* Date Range */}
                  <div className="space-y-4">
                    <Label className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Reading Period</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_date" className="text-sm">
                          Start Date
                        </Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={formData.inclusive_date.start_date}
                          onChange={(e) =>
                            handleInputChange("inclusive_date.start_date", e.target.value)
                          }
                          data-testid="input-start-date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date" className="text-sm">
                          End Date
                        </Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={formData.inclusive_date.end_date}
                          onChange={(e) =>
                            handleInputChange("inclusive_date.end_date", e.target.value)
                          }
                          data-testid="input-end-date"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div className="space-y-2">
                    <Label htmlFor="remarks" className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Remarks (Optional)</span>
                    </Label>
                    <Textarea
                      id="remarks"
                      placeholder="Enter any additional notes about this reading..."
                      value={formData.remarks}
                      onChange={(e) => handleInputChange("remarks", e.target.value)}
                      data-testid="textarea-remarks"
                    />
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setFormData({
                          connection_id: "",
                          present_reading: "",
                          inclusive_date: { start_date: "", end_date: "" },
                          remarks: ""
                        })
                      }
                      data-testid="button-cancel"
                    >
                      Clear Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={recordReadingMutation.isPending}
                      data-testid="button-submit"
                    >
                      {recordReadingMutation.isPending
                        ? "Recording..."
                        : "Record Reading"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
