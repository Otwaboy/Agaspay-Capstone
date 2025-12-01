import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertCircle, Droplets, MapPin } from "lucide-react";
import { toast } from "sonner";
import apiClient from "../../lib/api";

export default function AddMeterModal({ isOpen, onClose, resident, onSuccess }) {
  const [formData, setFormData] = useState({
    meter_no: "",
    specificAddress: "",
    zone: "",
    purok: "",
    type: ""
  });
  const [errors, setErrors] = useState({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        meter_no: "",
        specificAddress: "",
        zone: "",
        purok: "",
        type: ""
      });
      setErrors({});
    }
  }, [isOpen]);

  // Zone-Purok mapping (same logic as create-resident-modal)
  const getPurokOptions = (zone) => {
    const purokMap = {
      "1": ["4", "5", "6"],
      "2": ["1", "2", "3"],
      "3": ["7"]
    };
    return purokMap[zone] || [];
  };

  const addMeterMutation = useMutation({
    mutationFn: async (data) => {
      return await apiClient.addMeterToResident({
        resident_id: resident.resident_id,
        meter_no: data.meter_no,
        specific_address: data.specificAddress,
        zone: data.zone,
        purok: data.purok,
        type: data.type
      });
    },
    onSuccess: (response) => {
      // Show the full message from backend (includes scheduling info)
      const message = response.data?.msg || "New meter added successfully!";
      const warning = response.data?.warning;
      const scheduling = response.data?.scheduling;

      if (warning) {
        toast.warning("Meter Added with Warning", {
          description: message
        });
      } else {
        // Format scheduling details if available
        let description = message;
        if (scheduling) {
          const scheduleDate = new Date(scheduling.schedule_date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });
          const scheduleTime = scheduling.schedule_time;
          const personnelName = scheduling.assigned_personnel.name;

          description = `New meter added successfully!\n\n📅 Scheduled: ${scheduleDate} at ${scheduleTime}\n👷 Assigned to: ${personnelName}`;
        }

        toast.success("Meter Installation Scheduled", {
          description: description
        });
      }

      onSuccess?.();
      onClose();
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to add meter"
      });
    }
  });

  const handleChange = (field) => (value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset purok when zone changes
      ...(field === "zone" ? { purok: "" } : {})
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.meter_no.trim()) {
      newErrors.meter_no = "Meter number is required";
    }

    if (!formData.specificAddress.trim()) {
      newErrors.specificAddress = "Address is required";
    }

    if (!formData.zone) {
      newErrors.zone = "Zone is required";
    }

    if (!formData.purok) {
      newErrors.purok = "Purok is required";
    }

    if (!formData.type) {
      newErrors.type = "Connection type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields"
      });
      return;
    }

    addMeterMutation.mutate(formData);
  };

  if (!resident) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            Add New Water Meter
          </DialogTitle>
          <DialogDescription>
            Add a new water connection for <span className="font-semibold">{resident.name}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Show existing meters */}
        {resident.existing_meters && resident.existing_meters.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Existing Meters:</p>
            <div className="space-y-1">
              {resident.existing_meters.map((meter, index) => (
                <div key={index} className="text-xs text-blue-700 flex items-center gap-2">
                  <Droplets className="h-3 w-3" />
                  <span>Meter #{meter.meter_no} - Zone {meter.zone}, Purok {meter.purok}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meter Number */}
          <div className="space-y-2">
            <Label htmlFor="meter_no">
              Meter Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="meter_no"
              placeholder="Enter meter number"
              value={formData.meter_no}
              onChange={(e) => handleChange("meter_no")(e.target.value)}
              className={errors.meter_no ? "border-red-500" : ""}
            />
            {errors.meter_no && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.meter_no}</span>
              </div>
            )}
          </div>

          {/* Specific Address */}
          <div className="space-y-2">
            <Label htmlFor="specificAddress" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Specific Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="specificAddress"
              placeholder="Enter specific address (e.g., House number, street name)"
              value={formData.specificAddress}
              onChange={(e) => handleChange("specificAddress")(e.target.value)}
              className={errors.specificAddress ? "border-red-500" : ""}
            />
            {errors.specificAddress && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.specificAddress}</span>
              </div>
            )}
          </div>

          {/* Zone */}
          <div className="space-y-2">
            <Label htmlFor="zone">
              Zone <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={handleChange("zone")} value={formData.zone}>
              <SelectTrigger className={errors.zone ? "border-red-500" : ""}>
                <SelectValue placeholder="Select Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Zone 1</SelectItem>
                <SelectItem value="2">Zone 2</SelectItem>
                <SelectItem value="3">Zone 3</SelectItem>
              </SelectContent>
            </Select>
            {errors.zone && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.zone}</span>
              </div>
            )}
          </div>

          {/* Purok - Conditional based on Zone */}
          {formData.zone && (
            <div className="space-y-2">
              <Label htmlFor="purok">
                Purok <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={handleChange("purok")} value={formData.purok}>
                <SelectTrigger className={errors.purok ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select Purok" />
                </SelectTrigger>
                <SelectContent>
                  {getPurokOptions(formData.zone).map((purok) => (
                    <SelectItem key={purok} value={purok}>
                      Purok {purok}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.purok && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.purok}</span>
                </div>
              )}
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Zone {formData.zone} includes Purok {getPurokOptions(formData.zone).join(", ")}
              </p>
            </div>
          )}

          {/* Connection Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Connection Type <span className="text-red-500">*</span>
            </Label>
            <Select onValueChange={handleChange("type")} value={formData.type}>
              <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                <SelectValue placeholder="Select Connection Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="household">Household</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="establishment">Establishment</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.type}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={addMeterMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addMeterMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {addMeterMutation.isPending ? "Adding..." : "Add Meter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
