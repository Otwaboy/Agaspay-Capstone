import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import { Droplets } from "lucide-react";
import apiClient from "../../lib/api";
import { queryClient } from "../../lib/query-client";

export default function EditResidentModal({ isOpen, onClose, resident }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    purok: "",
    zone: "",
    status: ""
  });
  const [selectedMeterIndex, setSelectedMeterIndex] = useState(0);
  const [meterFormData, setMeterFormData] = useState({
    meterNo: "",
    type: "",
    connectionStatus: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when resident data changes
  useEffect(() => {
    if (resident) {
      // Extract first and last name from full name
      const nameParts = resident.name.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Extract zone and purok from address (format: "Biking 1, Purok 3")
      const addressParts = resident.address.split(", ");
      const zonePart = addressParts[0]?.replace("Biking ", "") || "";
      const purokPart = addressParts[1]?.replace("Purok ", "") || "";

      setFormData({
        firstName: firstName,
        lastName: lastName,
        purok: purokPart,
        zone: zonePart,
        status: resident.status || ""
      });

      // Set initial meter form data
      if (resident.meters && resident.meters.length > 0) {
        const firstMeter = resident.meters[0];
        setMeterFormData({
          meterNo: firstMeter.meter_no || "",
          type: firstMeter.type || "",
          connectionStatus: firstMeter.connectionStatus || ""
        });
        setSelectedMeterIndex(0);
      }
    }
  }, [resident]);

  // Update meter form when selected meter changes
  useEffect(() => {
    if (resident && resident.meters && resident.meters[selectedMeterIndex]) {
      const meter = resident.meters[selectedMeterIndex];
      setMeterFormData({
        meterNo: meter.meter_no || "",
        type: meter.type || "",
        connectionStatus: meter.connectionStatus || ""
      });
    }
  }, [selectedMeterIndex, resident]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update resident personal information for all connections
      const residentUpdateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        purok: formData.purok,
        zone: formData.zone,
        status: formData.status
      };

      // Update each meter individually
      if (resident && resident.meters) {
        for (let idx = 0; idx < resident.meters.length; idx++) {
          const meter = resident.meters[idx];

          // Get meter-specific data - either from current selected meter or original data
          let meterNo = meter.meter_no;
          let meterType = meter.type;
          let meterConnectionStatus = meter.connectionStatus;

          // If this is the currently selected meter, use the form data
          if (idx === selectedMeterIndex) {
            meterNo = meterFormData.meterNo || meter.meter_no;
            meterType = meterFormData.type || meter.type;
            meterConnectionStatus = meterFormData.connectionStatus || meter.connectionStatus;
          }

          // For each meter, prepare the update data
          const meterUpdateData = {
            ...residentUpdateData,
            meter_no: meterNo,
            type: meterType,
            connection_status: meterConnectionStatus
          };

          console.log('🔍 Updating meter:', meterUpdateData);

          // Update this specific meter/connection
          await apiClient.updateResidentAccount(meter.id, meterUpdateData);
        }
      }

      // Invalidate the query cache to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['/api/water-connections'] });

      toast.success("Resident Updated Successfully", {
        description: `${formData.firstName} ${formData.lastName}'s information has been updated`
      });

      // Close modal after a brief delay to ensure toast displays and data refreshes
      setTimeout(() => {
        onClose();
      }, 500);

    } catch (error) {
      console.error('❌ Update error:', error);
      toast.error("Error", {
        description: error.message || "Failed to update resident. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMeterChange = (field) => (value) => {
    setMeterFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!resident) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Resident Information</DialogTitle>
          <DialogDescription>
            Update resident water connection details in the AGASPAY system.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Resident Personal Information */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName")(e.target.value)}
                  placeholder="Enter first name"
                  required
                  data-testid="input-edit-first-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName")(e.target.value)}
                  placeholder="Enter last name"
                  required
                  data-testid="input-edit-last-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purok">Purok</Label>
                <Select value={formData.purok} onValueChange={handleChange("purok")} required>
                  <SelectTrigger data-testid="select-edit-purok">
                    <SelectValue placeholder="Select Purok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Purok 1</SelectItem>
                    <SelectItem value="2">Purok 2</SelectItem>
                    <SelectItem value="3">Purok 3</SelectItem>
                    <SelectItem value="4">Purok 4</SelectItem>
                    <SelectItem value="5">Purok 5</SelectItem>
                    <SelectItem value="6">Purok 6</SelectItem>
                    <SelectItem value="7">Purok 7</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Select value={formData.zone} onValueChange={handleChange("zone")} required>
                  <SelectTrigger data-testid="select-edit-zone">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Biking 1</SelectItem>
                    <SelectItem value="2">Biking 2</SelectItem>
                    <SelectItem value="3">Biking 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={handleChange("status")} required>
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Water Meters Section */}
          {resident.meters && resident.meters.length > 0 && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
                <Droplets className="h-4 w-4 mr-2" />
                Water Meters ({resident.meters.length})
              </h3>

              {/* Meter Selector Tabs */}
              {resident.meters.length > 1 && (
                <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                  {resident.meters.map((meter, idx) => (
                    <button
                      key={meter.id}
                      type="button"
                      onClick={() => setSelectedMeterIndex(idx)}
                      className={`px-3 py-2 rounded-lg border font-medium text-sm whitespace-nowrap transition-colors ${
                        selectedMeterIndex === idx
                          ? "bg-blue-100 border-blue-300 text-blue-700"
                          : "bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Meter {meter.meter_no}
                    </button>
                  ))}
                </div>
              )}

              {/* Meter Details Form */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meterNo">Meter Number</Label>
                    <Input
                      id="meterNo"
                      value={meterFormData.meterNo}
                      onChange={(e) => handleMeterChange("meterNo")(e.target.value)}
                      placeholder="Enter Meter Number"
                      data-testid="input-edit-meter-no"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={meterFormData.type} onValueChange={handleMeterChange("type")}>
                      <SelectTrigger data-testid="select-edit-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="household">Household</SelectItem>
                        <SelectItem value="restaurant">Restaurant</SelectItem>
                        <SelectItem value="establishment">Establishment</SelectItem>
                        <SelectItem value="others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="connectionStatus">Connection Status</Label>
                    <Select value={meterFormData.connectionStatus} onValueChange={handleMeterChange("connectionStatus")}>
                      <SelectTrigger data-testid="select-edit-connection-status">
                        <SelectValue placeholder="Select connection status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="disconnected">Disconnected</SelectItem>
                        <SelectItem value="request_for_disconnection">Request For Disconnection</SelectItem>
                        <SelectItem value="for_disconnection">For Disconnection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              data-testid="button-edit-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-update-resident"
            >
              {isLoading ? "Updating..." : "Update Resident"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}