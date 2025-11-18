import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "../ui/dialog";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";
import apiClient from "../../lib/api";

export default function EditResidentModal({ isOpen, onClose, resident }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    meterNo: "",
    purok: "",
    zone: "",
    type: "",
    status: "",
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
        meterNo: resident.meter_no || "",
        purok: purokPart,
        zone: zonePart,
        type: resident.type || "",
        status: resident.status || "",
        connectionStatus: resident.connectionStatus || ""
      });
    }
  }, [resident]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare update data for backend
      const updateData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        meter_no: formData.meterNo,
        purok: formData.purok,
        zone: formData.zone,
        type: formData.type,
        status: formData.status,
        connection_status: formData.connectionStatus
      };

      // Debug: Log the resident object and ID being sent
      console.log('🔍 Resident object:', resident);
      console.log('🔍 Connection ID being sent:', resident.id);
      console.log('🔍 Update data:', updateData);

      // Call backend API to update resident
      await apiClient.updateResidentAccount(resident.id, updateData);

      toast.success("Resident Updated Successfully", {
        description: `${formData.firstName} ${formData.lastName}'s information has been updated`
      });

      onClose();

    } catch (error) {
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

  if (!resident) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Resident Information</DialogTitle>
          <DialogDescription>
            Update resident water connection details in the AGASPAY system.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="meterNo">Meter Number</Label>
            <Input
              id="meterNo"
              value={formData.meterNo}
              onChange={(e) => handleChange("meterNo")(e.target.value)}
              placeholder="Enter Meter Number"
              required
              data-testid="input-edit-meter-no"
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
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={handleChange("type")} required>
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

          <div className="space-y-2">
            <Label htmlFor="connectionStatus">Connection Status</Label>
            <Select value={formData.connectionStatus} onValueChange={handleChange("connectionStatus")} required>
              <SelectTrigger data-testid="select-edit-connection-status">
                <SelectValue placeholder="Select connection status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="disconnected">Disconnected</SelectItem>
                
              </SelectContent>
            </Select>
          </div>

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