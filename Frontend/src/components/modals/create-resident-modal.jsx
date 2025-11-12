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
import { useToast } from "../../hooks/use-toast";
import { authManager } from "../../lib/auth";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function CreateResidentModal({ isOpen, onClose }) {
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    purok: "",
    email: "",
    phone: "",
    zone: "",
    type: "",
    meterNumber: "",
    username: "",
    password: ""
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Parse MongoDB duplicate key error
  const parseDuplicateKeyError = (errorMessage) => {
    const newErrors = {};
    
    // Check for MongoDB duplicate key error
    if (errorMessage.includes('E11000 duplicate key error')) {
      // Extract the field name from the error
      if (errorMessage.includes('username_1')) {
        newErrors.username = "This username is already taken. Please choose a different username.";
      } else if (errorMessage.includes('email_1')) {
        newErrors.email = "This email is already registered. Please use a different email.";
      } else if (errorMessage.includes('meter_no_1') || errorMessage.includes('meterNumber')) {
        newErrors.meterNumber = "This meter number is already registered. Please check and enter a different meter number.";
      } else if (errorMessage.includes('contact_no_1') || errorMessage.includes('phone')) {
        newErrors.phone = "This phone number is already registered. Please use a different phone number.";
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

      if (!formData.username || formData.username.trim() === "") {
        validationErrors.username = "Username is required";
      }

      if (!formData.password || formData.password.trim() === "") {
        validationErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        validationErrors.password = "Password must be at least 6 characters long";
      }

      // If there are validation errors, show them
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsLoading(false);
        return;
      }

      // Create resident account - scheduling is now automatic on backend
      const accountData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        purok: formData.purok,
        email: formData.email.trim() || null,
        contact_no: formData.phone,
        zone: formData.zone,
        type: formData.type,
        meter_no: formData.meterNumber,
        username: formData.username,
        password: formData.password,
      };

      console.log('📤 Creating resident account:', accountData);
      const response = await authManager.createResidentAccount(accountData);

      // Format success message with scheduling details
      const successMessage = response.message || `${formData.firstName} ${formData.lastName} has been registered successfully.`;

      toast({
        title: "Resident Created Successfully",
        description: successMessage,
        variant: "default",
        duration: 6000, // Show for 6 seconds since there's more info
      });

      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        purok: "",
        email: "",
        phone: "",
        zone: "",
        type: "",
        meterNumber: "",
        username: "",
        password: ""
      });

      setErrors({});

      onClose();

    } catch (error) {
      console.error('❌ Error creating resident:', error);
      
      let errorMessage = error.message || "Failed to create resident. Please try again.";
      let parsedErrors = {};

      // Try to parse the error response
      if (error.response) {
        // If backend sends structured errors
        if (error.response.data && error.response.data.errors) {
          const backendErrors = error.response.data.errors;
          
          if (backendErrors.username) {
            parsedErrors.username = backendErrors.username;
          }
          if (backendErrors.email) {
            parsedErrors.email = backendErrors.email;
          }
          if (backendErrors.meter_no || backendErrors.meterNumber) {
            parsedErrors.meterNumber = backendErrors.meter_no || backendErrors.meterNumber;
          }
          if (backendErrors.contact_no || backendErrors.phone) {
            parsedErrors.phone = backendErrors.contact_no || backendErrors.phone;
          }
        } 
        // If backend sends error message string
        else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
          parsedErrors = parseDuplicateKeyError(errorMessage);
        }
      } 
      // Parse error message directly if no response object
      else if (errorMessage) {
        parsedErrors = parseDuplicateKeyError(errorMessage);
      }

      // Set the parsed errors to show below fields
      if (Object.keys(parsedErrors).length > 0) {
        setErrors(parsedErrors);
        // Don't show toast if we're showing field-specific errors
      } else {
        // Only show toast if we couldn't parse specific field errors
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

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
      <DialogContent className="bg-white sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Resident</DialogTitle>
          <DialogDescription>
            Add a new resident water connection to the AGASPAY system.
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
                className={errors.firstName ? "border-red-500 focus:ring-red-500" : ""}
              />
              {errors.firstName && (
                <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errors.firstName}</span>
                </div>
              )}
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
                className={errors.lastName ? "border-red-500 focus:ring-red-500" : ""}
              />
              {errors.lastName && (
                <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errors.lastName}</span>
                </div>
              )}
            </div>
          </div>

          {/* assigning zone */}
          <div className="space-y-2">
            <Label htmlFor="zone">Zone</Label>
            <Select onValueChange={handleChange("zone")} required>
              <SelectTrigger data-testid="select-zone" className={errors.zone ? "border-red-500 focus:ring-red-500" : ""}>
                <SelectValue placeholder="Select Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Biking 1</SelectItem>
                <SelectItem value="2">Biking 2</SelectItem>
                <SelectItem value="3">Biking 3</SelectItem>
              </SelectContent>
            </Select>
            {errors.zone && (
              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.zone}</span>
              </div>
            )}
          </div>

          {/* selecting purok para sa resident*/}
          <div className="space-y-2">
            {formData.zone === "1" && (
              <>
                <Label htmlFor="purok">Purok</Label>
                <Select onValueChange={handleChange("purok")} required>
                  <SelectTrigger data-testid="select-purok" className={errors.purok ? "border-red-500 focus:ring-red-500" : ""}>
                    <SelectValue placeholder="Select Purok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">Purok 4</SelectItem>
                    <SelectItem value="5">Purok 5</SelectItem>
                    <SelectItem value="6">Purok 6</SelectItem>
                  </SelectContent>
                </Select>
                {errors.purok && (
                  <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.purok}</span>
                  </div>
                )}
              </>
            )}
            {/* zone 2 */}
            {formData.zone === "2" && (
              <>
                <Label htmlFor="purok">Purok</Label>
                <Select onValueChange={handleChange("purok")} required>
                  <SelectTrigger data-testid="select-purok" className={errors.purok ? "border-red-500 focus:ring-red-500" : ""}>
                    <SelectValue placeholder="Select Purok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Purok 1</SelectItem>
                    <SelectItem value="2">Purok 2</SelectItem>
                    <SelectItem value="3">Purok 3</SelectItem>
                  </SelectContent>
                </Select>
                {errors.purok && (
                  <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.purok}</span>
                  </div>
                )}
              </>
            )}
            {/* zone 3 */}
            {formData.zone === "3" && (
              <>
                <Label htmlFor="purok">Purok</Label>
                <Select onValueChange={handleChange("purok")} required>
                  <SelectTrigger data-testid="select-purok" className={errors.purok ? "border-red-500 focus:ring-red-500" : ""}>
                    <SelectValue placeholder="Select Purok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Purok 7</SelectItem>
                  </SelectContent>
                </Select>
                {errors.purok && (
                  <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.purok}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email")(e.target.value)}
              placeholder="Enter email address (Optional)"
              data-testid="input-email"
              className={errors.email ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.email && (
              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.email}</span>
              </div>
            )}
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
              className={errors.phone ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.phone && (
              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select onValueChange={handleChange("type")} required>
              <SelectTrigger data-testid="select-type" className={errors.type ? "border-red-500 focus:ring-red-500" : ""}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="household">Household</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="establishment">Establishment</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.type}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="meterNumber">Meter Number</Label>
            <Input
              id="meterNumber"
              value={formData.meterNumber}
              onChange={(e) => handleChange("meterNumber")(e.target.value)}
              placeholder="Enter water meter number"
              required
              data-testid="input-meter-number"
              className={errors.meterNumber ? "border-red-500 focus:ring-red-500" : ""}
            />
            {errors.meterNumber && (
              <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errors.meterNumber}</span>
              </div>
            )}
          </div>

          {/* Account Creation Section */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Label htmlFor="createAccount" className="text-sm font-medium">
                Login Account Details
              </Label>
            </div>

            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleChange("username")(e.target.value)}
                  placeholder="Enter username for login"
                  required
                  data-testid="input-username"
                  className={errors.username ? "border-red-500 focus:ring-red-500" : ""}
                />
                {errors.username && (
                  <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.username}</span>
                  </div>
                )}
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
                    required
                    data-testid="input-password"
                    className={errors.password ? "border-red-500 focus:ring-red-500" : ""}
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
                {errors.password && (
                  <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{errors.password}</span>
                  </div>
                )}
                {!errors.password && (
                  <p className="text-xs text-gray-500">
                    This account will allow the resident to log into the system
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Auto-scheduling Info */}
          <div className="border-t pt-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Automatic Meter Installation Scheduling</p>
                  <p className="text-xs text-blue-700 mt-1">
                    The system will automatically schedule meter installation with the next available maintenance personnel.
                    You will receive confirmation details after registration.
                  </p>
                </div>
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
              {isLoading ? "Creating..." : "Create Resident"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}