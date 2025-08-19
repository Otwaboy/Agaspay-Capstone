import React, { useState } from "react";
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
import { useToast } from "../../hooks/use-toast";
import { authManager } from "../../lib/auth";
import { Eye, EyeOff } from "lucide-react";

export default function CreatePersonnelModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    username: "",
    password: "",
    createAccount: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // If create account is checked, validate account fields and create account first
      if (formData.createAccount) {
        if (!formData.username || !formData.password) {
          toast({
            title: "Validation Error",
            description: "Username and password are required when creating an account",
            variant: "destructive"
          });
          return;
        }

        if (formData.password.length < 6) {
          toast({
            title: "Validation Error", 
            description: "Password must be at least 6 characters long",
            variant: "destructive"
          });
          return;
        }

        // Create account using authManager
        const accountData = {
          username: formData.username,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          department: formData.department
        };

        await authManager.createAccount(accountData);
      }

      // Simulate personnel creation (this would normally be a separate API call)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const successMessage = formData.createAccount 
        ? `${formData.firstName} ${formData.lastName} has been added as ${formData.role} with login account created`
        : `${formData.firstName} ${formData.lastName} has been added as ${formData.role}`;

      toast({
        title: "Personnel Created Successfully",
        description: successMessage,
        variant: "default"
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        department: "",
        username: "",
        password: "",
        createAccount: false
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create personnel. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select onValueChange={handleChange("department")} required>
              <SelectTrigger data-testid="select-department">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="administration">Administration</SelectItem>
              </SelectContent>
            </Select>
          </div>

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