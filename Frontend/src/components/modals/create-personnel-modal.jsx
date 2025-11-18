import { useState } from "react";
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
import { Checkbox } from "../ui/checkbox";
import { toast } from "sonner";
import { authManager } from "../../lib/auth";
import { Eye, EyeOff } from "lucide-react";

export default function CreatePersonnelModal({ isOpen, onClose }) {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    purok: "",
    assignedZone: "",
    username: "",
    password: "",
    createAccount: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  // functions when submmiting the button
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If create account is checked, validate account fields and create account first
      if (formData.createAccount) {
        if (!formData.username || !formData.password) {
          toast.error("Validation Error", {
            description: "Username and password are required when creating an account"
          });
          return;
        }

        if (formData.password.length < 6) {
          toast.error("Validation Error", {
            description: "Password must be at least 6 characters long"
          });
          return;
        }


  // Create account using authManager which is masave sya sa database
        const accountData = {
          username: formData.username,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          purok: formData.purok,
          contact_no: formData.phone,
          role: formData.role, ...(formData.role === 'meter_reader' && {assigned_zone : formData.assignedZone})
        };
        await authManager.createAccount(accountData);
      }

      // Simulate personnel creation (this would normally be a separate API call)
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      const successMessage = formData.createAccount
        ? `${formData.firstName} ${formData.lastName} has been added as ${formData.role} with login account created`
        : `${formData.firstName} ${formData.lastName} has been added as ${formData.role}`;

      toast.success("Personnel Created Successfully", {
        description: successMessage
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        purok: "",
        assignedZone: "",
        username: "",
        password: "",
        createAccount: false
      });
      
      onClose();

    } catch (error) {
      toast.error("Error", {
        description: error.message || "Failed to create personnel. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };


  // handleChange takes a parameter field (the name of the form field you want to update).
  //It returns another function that takes value (the new value for that field).
  //handleChange("firstName")("Joshua");
  //setFormData(prev => ({ ...prev, firstName: "Joshua" }));

  //This code is a reusable state updater for multiple input fields.

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  return (

    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Personnel</DialogTitle>
          <DialogDescription>
            Add a new staff member to the AGASPAY system.
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
                data-testid="input-first-name"
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
                data-testid="input-last-name"
              />
            </div>
          </div>

        {/* selecting purok para sa personnel*/}
          <div className="space-y-2">
            <Label htmlFor="purok">Purok</Label>
            <Select  onValueChange={handleChange("purok")} required>
              <SelectTrigger data-testid="select-purok">
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email")(e.target.value)}
              placeholder="Enter email address"
              required
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange("phone")(e.target.value)}
              placeholder="Enter phone number"
              required
              data-testid="input-phone"
            />
          </div>

{/* Selecting role para sa mga barangay personnel */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={handleChange("role")} required>
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


{/* assigning  zone if the role is meter reader */} 
      {formData.role === 'meter_reader' && (
          <div className="space-y-2">
            <Label htmlFor="assignedZone">Assigned Zone</Label>
            <Select onValueChange={handleChange("assignedZone")} required>
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


  {/* Account Creation Section */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="createAccount"
                checked={formData.createAccount}
                onCheckedChange={(checked) => handleChange("createAccount")(checked)}
                data-testid="checkbox-create-account"
              />
              <Label htmlFor="createAccount" className="text-sm font-medium">
                Create login account for this personnel
              </Label>
            </div>
           

      {/* this line of code mo render sya if formData.createAccount is true */}
            {formData.createAccount && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => handleChange("username")(e.target.value)}
                    placeholder="Enter username for login"
                    required={formData.createAccount}
                    data-testid="input-username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleChange("password")(e.target.value)}
                      placeholder="Enter password (min 6 characters)"
                      required={formData.createAccount}
                      data-testid="input-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    This account will allow the personnel to log into the system
                  </p>
                </div>
              </div>
            )}
          </div>

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
              data-testid="button-create"
            >
              {isLoading ? "Creating..." : "Create Personnel"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}   