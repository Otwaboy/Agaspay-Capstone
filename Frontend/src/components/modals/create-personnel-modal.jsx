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
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});


  // Parse MongoDB duplicate key error
  const parseDuplicateKeyError = (errorMessage) => {
    const newErrors = {};

    // Only check for MongoDB E11000 duplicate key errors
    if (errorMessage.includes('E11000 duplicate key error')) {
      if (errorMessage.includes('username_1')) {
        newErrors.username = "This username is already taken. Please choose a different username.";
      } else if (errorMessage.includes('email_1')) {
        newErrors.email = "This email is already in use. Please use a different email.";
      } else if (errorMessage.includes('contact_no_1')) {
        newErrors.phone = "This phone number is already registered. Please use a different phone number.";
      } else if (errorMessage.includes('first_name') || errorMessage.includes('full_name')) {
        newErrors.firstName = "This full name already exists. Please use a different name.";
        newErrors.lastName = "This full name already exists. Please use a different name.";
      }
    }

    return newErrors;
  };

  // functions when submmiting the button
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Client-side validation
      const validationErrors = {};

      if (!formData.firstName.trim()) {
        validationErrors.firstName = "First name is required";
      }

      if (!formData.lastName.trim()) {
        validationErrors.lastName = "Last name is required";
      }

      if (!formData.email.trim()) {
        validationErrors.email = "Email is required";
      }

      if (!formData.phone.trim()) {
        validationErrors.phone = "Phone number is required";
      }

      if (!formData.role) {
        validationErrors.role = "Role is required";
      }

      if (!formData.purok) {
        validationErrors.purok = "Purok is required";
      }

      if (formData.role === 'meter_reader' && !formData.assignedZone) {
        validationErrors.assignedZone = "Assigned zone is required for meter readers";
      }

      // Username and password are always required (for login purposes)
      if (!formData.username.trim()) {
        validationErrors.username = "Username is required";
      }

      if (!formData.password) {
        validationErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        validationErrors.password = "Password must be at least 6 characters long";
      }

      if (!formData.confirmPassword) {
        validationErrors.confirmPassword = "Confirm password is required";
      } else if (formData.password !== formData.confirmPassword) {
        validationErrors.confirmPassword = "Passwords do not match";
      }

      // If there are validation errors, show them
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        // Show first validation error in toast
        const firstError = Object.values(validationErrors)[0];
        toast.error("Validation Error", {
          description: firstError
        });
        setIsLoading(false);
        return;
      }

      // Create account with username and password (always required)
      const accountData = {
        username: formData.username,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        purok: formData.purok,
        contact_no: formData.phone,
        role: formData.role,
        ...(formData.role === 'meter_reader' && { assigned_zone: formData.assignedZone })
      };
      await authManager.createAccount(accountData);

      const successMessage = `${formData.firstName} ${formData.lastName} has been added as ${formData.role} with login account created`;

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
        confirmPassword: ""
      });
      setErrors({});

      onClose();

    } catch (error) {
      console.error('❌ Error creating personnel:', error);

      let errorMessage = "Failed to create personnel. Please try again.";
      let parsedErrors = {};

      // Try to parse the error response
      if (error.response && error.response.data) {
        // If backend sends structured errors
        if (error.response.data.errors) {
          const backendErrors = error.response.data.errors;

          if (backendErrors.username) {
            parsedErrors.username = backendErrors.username;
          }
          if (backendErrors.email) {
            parsedErrors.email = backendErrors.email;
          }
          if (backendErrors.contact_no || backendErrors.phone) {
            parsedErrors.phone = backendErrors.contact_no || backendErrors.phone;
          }
        }
        // If backend sends error message string (check both 'message' and 'msg')
        else if (error.response.data.message || error.response.data.msg) {
          errorMessage = error.response.data.message || error.response.data.msg;

          // Split multiple errors if they're separated by pipe (|)
          const errorMessages = errorMessage.includes('|')
            ? errorMessage.split('|').map(msg => msg.trim())
            : [errorMessage];

          // Parse specific backend error messages for field-specific errors
          // Check all possible fields to support concurrent validation errors
          errorMessages.forEach(msg => {
            console.log('Processing error message:', msg);
            if (msg.toLowerCase().includes('username')) {
              console.log('Matched username error');
              parsedErrors.username = msg;
            }
            if (msg.toLowerCase().includes('email')) {
              console.log('Matched email error');
              parsedErrors.email = msg;
            }
            if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('contact')) {
              console.log('Matched phone error');
              parsedErrors.phone = msg;
            }
            if (msg.toLowerCase().includes('full name')) {
              console.log('Matched full name error');
              parsedErrors.firstName = msg;
              parsedErrors.lastName = msg;
            }
          });

          // If no specific field was matched, check for MongoDB E11000 errors as fallback
          if (Object.keys(parsedErrors).length === 0) {
            parsedErrors = parseDuplicateKeyError(errorMessage);
          }
        }
      }
      // Parse error message directly if no response object
      else if (error.message && error.message !== "Server error (400)") {
        errorMessage = error.message;
        parsedErrors = parseDuplicateKeyError(errorMessage);
      }

      // Show error notification
      console.log('parsedErrors keys:', Object.keys(parsedErrors), 'parsedErrors:', parsedErrors);
      if (Object.keys(parsedErrors).length > 0) {
        console.log('Setting errors state:', parsedErrors);
        setErrors(parsedErrors);
        // Show field-specific error toast
        toast.error("Validation Error", {
          description: errorMessage
        });
      } else if (errorMessage && errorMessage !== "Failed to create personnel. Please try again.") {
        // Show actual backend error message
        console.log('No parsed errors, showing generic error toast');
        toast.error("Error", {
          description: errorMessage
        });
      } else {
        // Show generic error only if we have no other info
        console.log('Showing fallback error toast');
        toast.error("Error", {
          description: errorMessage
        });
      }
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
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };



  return (

    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
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
                className={errors.firstName ? "border-red-500 border-2 focus:ring-red-500" : ""}
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
                className={errors.lastName ? "border-red-500 border-2 focus:ring-red-500" : ""}
              />
            </div>
          </div>

        {/* selecting purok para sa personnel*/}
          <div className="space-y-2">
            <Label htmlFor="purok">Purok</Label>
            <Select onValueChange={handleChange("purok")} required>
              <SelectTrigger data-testid="select-purok" className={errors.purok ? "border-red-500 border-2 focus:ring-red-500" : ""}>
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
              className={errors.email ? "border-red-500 border-2 focus:ring-red-500" : ""}
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
              className={errors.phone ? "border-red-500 border-2 focus:ring-red-500" : ""}
            />
          </div>

{/* Selecting role para sa mga barangay personnel */}
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={handleChange("role")} required>
              <SelectTrigger data-testid="select-role" className={errors.role ? "border-red-500 border-2 focus:ring-red-500" : ""}>
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
              <SelectTrigger data-testid="select-zone" className={errors.assignedZone ? "border-red-500 border-2 focus:ring-red-500" : ""}>
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


  {/* Account Creation Section - Username and Password are always required */}
          <div className="border-t pt-4 mt-4">
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange("username")(e.target.value)}
                  placeholder="Enter username for login"
                  required
                  data-testid="input-username"
                  className={errors.username ? "border-red-500 border-2 focus:ring-red-500" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleChange("password")(e.target.value)}
                    placeholder="Enter password (min 6 characters)"
                    required
                    data-testid="input-password"
                    className={errors.password ? "border-red-500 border-2 focus:ring-red-500" : ""}
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
                  Personnel login credentials. Password must be at least 6 characters.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword")(e.target.value)}
                    placeholder="Re-enter password to confirm"
                    required
                    data-testid="input-confirm-password"
                    className={errors.confirmPassword ? "border-red-500 border-2 focus:ring-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    data-testid="button-toggle-confirm-password"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
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