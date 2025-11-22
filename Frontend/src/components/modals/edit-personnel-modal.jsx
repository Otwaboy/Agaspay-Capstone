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
import { apiClient } from "../../lib/api";

export default function EditPersonnelModal({ isOpen, onClose, personnel, onSuccess }) {
  const [formData, setFormData] = useState({
    contactNo: "",
    role: "",
    assignedZone: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when personnel data is available
  useEffect(() => {
    if (personnel) {
      setFormData({
        contactNo: personnel.contact_no || "",
        role: personnel.role || "",
        assignedZone: personnel.assigned_zone || ""
      });
    }
  }, [personnel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Prepare update data
      const updateData = {
        contact_no: formData.contactNo,
        role: formData.role
      };

      // Only include assigned_zone if role is meter_reader
      if (formData.role === "meter_reader") {
        updateData.assigned_zone = formData.assignedZone;
      }

      // Call API to update personnel
      await apiClient.updatePersonnel(personnel._id, updateData);

      toast.success("Success", {
        description: `${personnel.first_name} ${personnel.last_name}'s information has been updated successfully`
      });

      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      toast.error("Error", {
        description: error.message || "Failed to update personnel. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!personnel) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Personnel</DialogTitle>
          <DialogDescription>
            Update contact number and role assignment for {personnel.first_name} {personnel.last_name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Display Personnel Info (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div>
              <Label className="text-xs text-gray-500">Full Name</Label>
              <p className="text-sm font-medium">{personnel.first_name} {personnel.last_name}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Email</Label>
              <p className="text-sm font-medium">{personnel.email}</p>
            </div>
          </div>

          {/* Editable Fields */}
          <div className="space-y-2">
            <Label htmlFor="contactNo">Contact Number</Label>
            <Input
              id="contactNo"
              value={formData.contactNo}
              onChange={(e) => handleChange("contactNo")(e.target.value)}
              placeholder="Enter phone number"
              required
              data-testid="input-contact-no"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={handleChange("role")}
              required
            >
              <SelectTrigger data-testid="select-role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="meter_reader">Meter Reader</SelectItem>
                <SelectItem value="maintenance">Maintenance Staff</SelectItem>
                <SelectItem value="treasurer">Treasurer</SelectItem>
                <SelectItem value="secretary">Barangay Secretary</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Zone Selection for Meter Reader */}
          {formData.role === 'meter_reader' && (
            <div className="space-y-2">
              <Label htmlFor="assignedZone">Assigned Zone</Label>
              <Select
                value={formData.assignedZone}
                onValueChange={handleChange("assignedZone")}
                required
              >
                <SelectTrigger data-testid="select-zone">
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Biking 1</SelectItem>
                  <SelectItem value="2">Biking 2</SelectItem>
                  <SelectItem value="3">Biking 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              data-testid="button-update"
            >
              {isLoading ? "Updating..." : "Update Personnel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
