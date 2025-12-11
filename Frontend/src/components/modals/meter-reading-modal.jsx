import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Gauge, AlertCircle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import { apiRequest } from "../../lib/query-client";

export default function RecordMeterReadingModal({ open, onClose }) {
  const [selectedConnection, setSelectedConnection] = useState("");
  const [presentReading, setPresentReading] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [remarks, setRemarks] = useState("Normal Reading");
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();

  // Fetch all water connections for the dropdown
  const { data: connections, isLoading: connectionsLoading } = useQuery({
    queryKey: ['/api/v1/meter-reading/connections'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock data for development - replace with actual API call
  const mockConnections = [
    {
      connection_id: "conn_001",
      full_name: "Juan Dela Cruz",
      purok_no: "Purok 1",
      previous_reading: 125.6,
      meter_number: "MTR-001"
    },
    {
      connection_id: "conn_002", 
      full_name: "Maria Santos",
      purok_no: "Purok 2",
      previous_reading: 89.3,
      meter_number: "MTR-002"
    },
    {
      connection_id: "conn_003",
      full_name: "Pedro Rodriguez", 
      purok_no: "Purok 1",
      previous_reading: 156.8,
      meter_number: "MTR-003"
    }
  ];

  const connectionList = connections || mockConnections;

  // Get selected connection details
  const selectedConnectionData = connectionList.find(conn => conn.connection_id === selectedConnection);
  const previousReading = selectedConnectionData?.previous_reading || 0;

  // Record meter reading mutation
  const recordReadingMutation = useMutation({
    mutationFn: async (readingData) => {
      return await apiRequest('/api/v1/meter-reading/input', {
        method: 'POST',
        body: JSON.stringify(readingData),
      });
    },
    onSuccess: () => {
      toast.success("Reading Recorded", {
        description: "Meter reading has been successfully recorded."
      });
      queryClient.invalidateQueries(['/api/v1/meter-reader/daily-stats']);
      queryClient.invalidateQueries(['/api/v1/meter-reader/recent-readings']);
      queryClient.invalidateQueries(['/api/v1/meter-reader/route-schedule']);
      queryClient.invalidateQueries(['meter-reader-latest-readings']);
      handleClose();
    },
    onError: (error) => {
      toast.error("Error Recording Reading", {
        description: error.message || "Failed to record meter reading. Please try again."
      });
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!selectedConnection) {
      newErrors.connection = "Please select a water connection";
    }

    if (!presentReading || presentReading === "") {
      newErrors.presentReading = "Present reading is required";
    } else if (isNaN(presentReading) || parseFloat(presentReading) < 0) {
      newErrors.presentReading = "Present reading must be a valid positive number";
    } else if (parseFloat(presentReading) < previousReading) {
      newErrors.presentReading = `Present reading must be greater than or equal to previous reading (${previousReading})`;
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!endDate) {
      newErrors.endDate = "End date is required";
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const readingData = {
      connection_id: selectedConnection,
      present_reading: parseFloat(presentReading),
      inclusive_date: {
        start: new Date(startDate).toISOString(),
        end: new Date(endDate).toISOString()
      },
      remarks: remarks || "Normal Reading"
    };

    recordReadingMutation.mutate(readingData);
  };

  const handleClose = () => {
    setSelectedConnection("");
    setPresentReading("");
    setStartDate("");
    setEndDate("");
    setRemarks("Normal Reading");
    setErrors({});
    onClose();
  };

  const calculateConsumption = () => {
    if (presentReading && !isNaN(presentReading)) {
      const consumption = parseFloat(presentReading) - previousReading;
      return consumption >= 0 ? consumption.toFixed(2) : 0;
    }
    return 0;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Gauge className="h-5 w-5 text-green-600" />
            <span>Record Meter Reading</span>
          </DialogTitle>
          <DialogDescription>
            Input the present meter reading for a water connection
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Connection Selection */}
          <div className="space-y-2">
            <Label htmlFor="connection">Water Connection *</Label>
            <Select 
              value={selectedConnection} 
              onValueChange={setSelectedConnection}
              data-testid="select-connection"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select water connection" />
              </SelectTrigger>
              <SelectContent>
                {connectionList.map((connection) => (
                  <SelectItem key={connection.connection_id} value={connection.connection_id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{connection.full_name}</span>
                      <span className="text-sm text-gray-500">
                        {connection.purok_no} • {connection.meter_number || 'No meter number'}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.connection && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.connection}
              </p>
            )}
          </div>

          {/* Previous Reading Display */}
          {selectedConnectionData && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">{selectedConnectionData.full_name}</h4>
                  <p className="text-sm text-blue-700">{selectedConnectionData.purok_no}</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Previous: {previousReading.toFixed(2)} m³
                </Badge>
              </div>
            </div>
          )}

          {/* Present Reading */}
          <div className="space-y-2">
            <Label htmlFor="presentReading">Present Reading (m³) *</Label>
            <Input
              id="presentReading"
              type="number"
              step="0.01"
              min="0"
              value={presentReading}
              onChange={(e) => setPresentReading(e.target.value)}
              placeholder="Enter present meter reading"
              className={errors.presentReading ? "border-red-500" : ""}
              data-testid="input-present-reading"
            />
            {errors.presentReading && (
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.presentReading}
              </p>
            )}
            
            {/* Consumption Calculation */}
            {presentReading && selectedConnectionData && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-700">Calculated Consumption:</span>
                  <span className="font-bold text-green-900">
                    {calculateConsumption()} m³
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Inclusive Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={errors.startDate ? "border-red-500" : ""}
                data-testid="input-start-date"
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={errors.endDate ? "border-red-500" : ""}
                data-testid="input-end-date"
              />
              {errors.endDate && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter any remarks or observations"
              rows={3}
              data-testid="input-remarks"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={recordReadingMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={recordReadingMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
              data-testid="button-submit-reading"
            >
              {recordReadingMutation.isPending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Record Reading
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}