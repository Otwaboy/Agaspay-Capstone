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
import { apiClient } from "../../lib/api";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function CreateResidentModal({ isOpen, onClose }) {
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    zone: "",
    purok: "",
    // Water connection zone and purok (can be different from resident's location)
    connectionZone: "",
    connectionPurok: "",
    specificAddress: "",
    email: "",
    phone: "",
    type: "",
    meterNumber: "",
    username: "",
    password: "",
    confirmPassword: ""
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [meterValidation, setMeterValidation] = useState({ checking: false, valid: null });

  // Parse MongoDB duplicate key error and other backend errors into user-friendly messages
  const parseDuplicateKeyError = (errorMessage) => {
    const newErrors = {};
    let userFriendlyMessage = errorMessage;

    // Check for MongoDB duplicate key error (E11000)
    if (errorMessage.includes('E11000 duplicate key error') || errorMessage.includes('duplicate key error')) {
      if (errorMessage.includes('username') || errorMessage.includes('username_1')) {
        newErrors.username = "This username is already taken. Please choose a different username.";
        userFriendlyMessage = "This username is already taken. Please choose a different one.";
      } else if (errorMessage.includes('email') || errorMessage.includes('email_1')) {
        newErrors.email = "This email is already registered. Please use a different email.";
        userFriendlyMessage = "This email is already registered. Please use a different email.";
      } else if (errorMessage.includes('meter_no') || errorMessage.includes('meter_no_1') || errorMessage.includes('meter')) {
        newErrors.meterNumber = "This meter number is already registered. Please enter a different meter number.";
        userFriendlyMessage = "This meter number is already registered. Please enter a different one.";
      } else if (errorMessage.includes('contact_no') || errorMessage.includes('contact_no_1') || errorMessage.includes('phone')) {
        newErrors.phone = "This phone number is already registered. Please use a different phone number.";
        userFriendlyMessage = "This phone number is already registered. Please use a different one.";
      }
    }

    return { errors: newErrors, message: userFriendlyMessage };
  };

  // functions when submmiting the button
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({}); // Clear previous errors

    try {
      // Client-side validation - single object for all errors
      const validationErrors = {};

      if (!formData.firstName || formData.firstName.trim() === "") {
        validationErrors.firstName = "First name is required";
      }

      if (!formData.lastName || formData.lastName.trim() === "") {
        validationErrors.lastName = "Last name is required";
      }

      if (!formData.connectionZone || formData.connectionZone.trim() === "") {
        validationErrors.connectionZone = "Water connection zone is required";
      }

      if (!formData.connectionPurok || formData.connectionPurok.trim() === "") {
        validationErrors.connectionPurok = "Water connection purok is required";
      }

      if (!formData.username || formData.username.trim() === "") {
        validationErrors.username = "Username is required";
      }

      if (!formData.password || formData.password.trim() === "") {
        validationErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        validationErrors.password = "Password must be at least 6 characters long";
      }

      if (!formData.confirmPassword || formData.confirmPassword.trim() === "") {
        validationErrors.confirmPassword = "Confirm password is required";
      } else if (formData.password !== formData.confirmPassword) {
        validationErrors.confirmPassword = "Passwords do not match";
      }

      if (!formData.meterNumber || formData.meterNumber.trim() === "") {
        validationErrors.meterNumber = "Meter number is required";
      } else if (meterValidation.valid === false) {
        validationErrors.meterNumber = "This meter number is already in use. Please enter a different meter number.";
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

      // Create resident account - scheduling is now automatic on backend
      const accountData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        zone: formData.zone,
        purok: formData.purok,
        email: formData.email.trim() || null,
        contact_no: formData.phone,
        type: formData.type,
        meter_no: formData.meterNumber,
        // Water connection zone and purok (can be different from resident's location)
        connection_zone: formData.connectionZone,
        connection_purok: formData.connectionPurok,
        specific_address: formData.specificAddress,
        username: formData.username,
        password: formData.password,
      };

      console.log('📤 Creating resident account:', accountData);
      const response = await authManager.createResidentAccount(accountData);

      // Format success message with scheduling details
      const successMessage = response.message || `${formData.firstName} ${formData.lastName} has been registered successfully.`;

      // Show success toast with scheduling details
      toast.success("Resident Created Successfully", {
        description: successMessage,
        duration: 6000, // Show for 6 seconds since there's more info
      });

      // Reset form and close modal
      setFormData({
        firstName: "",
        lastName: "",
        zone: "",
        purok: "",
        connectionZone: "",
        connectionPurok: "",
        specificAddress: "",
        email: "",
        phone: "",
        type: "",
        meterNumber: "",
        username: "",
        password: "",
        confirmPassword: ""
      });
      setErrors({});
      setIsLoading(false);
      onClose();

    } catch (error) {
      console.error('❌ Error creating resident:', error);

      let errorMessage = "Failed to create resident. Please try again.";
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
          if (backendErrors.meter_no || backendErrors.meterNumber) {
            parsedErrors.meterNumber = backendErrors.meter_no || backendErrors.meterNumber;
          }
          if (backendErrors.contact_no || backendErrors.phone) {
            parsedErrors.phone = backendErrors.contact_no || backendErrors.phone;
          }
        }
        // If backend sends error message string (check both 'message' and 'msg')
        else if (error.response.data.message || error.response.data.msg) {
          errorMessage = error.response.data.message || error.response.data.msg;

          // Check if it's a MongoDB duplicate key error first
          if (errorMessage.includes('E11000 duplicate key error') || errorMessage.includes('duplicate key error')) {
            const result = parseDuplicateKeyError(errorMessage);
            parsedErrors = result.errors;
            errorMessage = result.message;
          } else {
            // Split multiple errors if they're separated by pipe (|)
            const errorMessages = errorMessage.includes('|')
              ? errorMessage.split('|').map(msg => msg.trim())
              : [errorMessage];

            // Parse specific backend error messages for field-specific errors
            // Check all possible fields to support concurrent validation errors
            errorMessages.forEach(msg => {
              if (msg.toLowerCase().includes('full name')) {
                parsedErrors.firstName = msg;
                parsedErrors.lastName = msg;
              } else if (msg.toLowerCase().includes('username')) {
                parsedErrors.username = msg;
              } else if (msg.toLowerCase().includes('email')) {
                parsedErrors.email = msg;
              } else if (msg.toLowerCase().includes('meter')) {
                parsedErrors.meterNumber = msg;
              } else if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('contact')) {
                parsedErrors.phone = msg;
              }
            });
          }
        }
      }
      // Parse error message directly if no response object
      else if (error.message && error.message !== "Server error (400)") {
        errorMessage = error.message;
        const result = parseDuplicateKeyError(errorMessage);
        parsedErrors = result.errors;
        errorMessage = result.message;
      }

      // Show error notification
      if (Object.keys(parsedErrors).length > 0) {
        setErrors(parsedErrors);
        // Get user-friendly message from parsedErrors
        let userFriendlyMsg = errorMessage;
        if (parsedErrors.email) {
          userFriendlyMsg = parsedErrors.email;
        } else if (parsedErrors.username) {
          userFriendlyMsg = parsedErrors.username;
        } else if (parsedErrors.meterNumber) {
          userFriendlyMsg = parsedErrors.meterNumber;
        } else if (parsedErrors.phone) {
          userFriendlyMsg = parsedErrors.phone;
        }
        toast.error("Validation Error", {
          description: userFriendlyMsg
        });
      } else if (errorMessage && errorMessage !== "Failed to create resident. Please try again.") {
        // Check if it's a raw MongoDB error and make it friendly
        if (errorMessage.includes('E11000 duplicate key error') || errorMessage.includes('duplicate key error')) {
          const result = parseDuplicateKeyError(errorMessage);
          setErrors(result.errors);
          toast.error("Validation Error", {
            description: result.message
          });
        } else {
          // Show actual backend error message
          toast.error("Error", {
            description: errorMessage
          });
        }
      } else {
        // Show generic error only if we have no other info
        toast.error("Error", {
          description: errorMessage
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
    // Check meter number validity if field is meterNumber
    if (field === 'meterNumber' && value.trim()) {
      checkMeterNumberAvailability(value.trim());
    }
  };

  const checkMeterNumberAvailability = async (meterNo) => {
    setMeterValidation({ checking: true, valid: null });
    try {
      const result = await apiClient.checkMeterNumberExists(meterNo);
      // If exists is true, the meter is NOT available
      setMeterValidation({ checking: false, valid: !result.exists });
    } catch (error) {
      // If error, assume not available (safe approach)
      setMeterValidation({ checking: false, valid: false });
      console.error('Error checking meter number:', error);
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

          <div className="border-t pt-4 mt-2 mb-4">
              <div className="flex items-center space-x-2 mb-4">
              <Label htmlFor="createAccount" className="text-sm font-medium">
               Resident Personnel Information Details
              </Label>
            </div>
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

          {/* assigning zone */}
          <div className="space-y-2">
            <Label htmlFor="zone">Zone</Label>
            <Select onValueChange={handleChange("zone")} required>
              <SelectTrigger data-testid="select-zone" className={errors.zone ? "border-red-500 border-2 focus:ring-red-500" : ""}>
                <SelectValue placeholder="Select Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Biking 1</SelectItem>
                <SelectItem value="2">Biking 2</SelectItem>
                <SelectItem value="3">Biking 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* selecting purok para sa resident*/}
          <div className="space-y-2">
            {formData.zone === "1" && (
              <>
                <Label htmlFor="purok">Purok</Label>
                <Select onValueChange={handleChange("purok")} required>
                  <SelectTrigger data-testid="select-purok" className={errors.purok ? "border-red-500 border-2 focus:ring-red-500" : ""}>
                    <SelectValue placeholder="Select Purok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">Purok 4</SelectItem>
                    <SelectItem value="5">Purok 5</SelectItem>
                    <SelectItem value="6">Purok 6</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {/* zone 2 */}
            {formData.zone === "2" && (
              <>
                <Label htmlFor="purok">Purok</Label>
                <Select onValueChange={handleChange("purok")} required>
                  <SelectTrigger data-testid="select-purok" className={errors.purok ? "border-red-500 border-2 focus:ring-red-500" : ""}>
                    <SelectValue placeholder="Select Purok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Purok 1</SelectItem>
                    <SelectItem value="2">Purok 2</SelectItem>
                    <SelectItem value="3">Purok 3</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
            {/* zone 3 */}
            {formData.zone === "3" && (
              <>
                <Label htmlFor="purok">Purok</Label>
                <Select onValueChange={handleChange("purok")} required>
                  <SelectTrigger data-testid="select-purok" className={errors.purok ? "border-red-500 border-2 focus:ring-red-500" : ""}>
                    <SelectValue placeholder="Select Purok" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Purok 7</SelectItem>
                  </SelectContent>
                </Select>
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
           </div>


          {/* Water Connection Details */}
          <div className="border-t pt-4 mt-4 mb-4">
             <div className="flex items-center space-x-2 mb-4">
              <Label htmlFor="createAccount" className="text-sm font-medium">
                Water Connection Details
              </Label>
            </div>
            {/* Connection Type, Meter Number, and Zone */}
            <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
              <div className="space-y-2">
                
                <Label htmlFor="type">Connection Type <span className="text-red-500">*</span></Label>
                <Select onValueChange={handleChange("type")} required>
                  <SelectTrigger data-testid="select-type" className={errors.type ? "border-red-500 border-2 focus:ring-red-500" : ""}>
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
                <Label htmlFor="meterNumber">Meter Number <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="meterNumber"
                    value={formData.meterNumber}
                    onChange={(e) => handleChange("meterNumber")(e.target.value)}
                    placeholder="Enter water meter number"
                    data-testid="input-meter-number"
                    className={`${errors.meterNumber ? "border-red-500 border-2 focus:ring-red-500" : meterValidation.valid === true && formData.meterNumber ? "border-green-500 border-2 focus:ring-green-500" : ""}`}
                  />
                  {meterValidation.checking && formData.meterNumber && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                  {meterValidation.valid === true && formData.meterNumber && !meterValidation.checking && (
                    <div className="absolute right-3 top-3 text-green-500">
                      ✓
                    </div>
                  )}
                </div>
                {errors.meterNumber && (
                  <p className="text-xs text-red-500">{errors.meterNumber}</p>
                )}
                {meterValidation.valid === true && formData.meterNumber && !errors.meterNumber && (
                  <p className="text-xs text-green-600">Meter number is available</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="connectionZoneBlue">Water Connection Zone <span className="text-red-500">*</span></Label>
                <Select onValueChange={handleChange("connectionZone")} value={formData.connectionZone}>
                  <SelectTrigger data-testid="select-connection-zone-blue" className={errors.connectionZone ? "border-red-500 border-2 focus:ring-red-500" : ""}>
                    <SelectValue placeholder="Select Zone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Biking 1</SelectItem>
                    <SelectItem value="2">Biking 2</SelectItem>
                    <SelectItem value="3">Biking 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Connection Purok - Conditional based on selected Zone */}
              {formData.connectionZone && (
                <div className="space-y-2">

                  <Label htmlFor="connectionPurok">Water Connection Purok <span className="text-red-500">*</span></Label>
                  <Select onValueChange={handleChange("connectionPurok")} required>
                    <SelectTrigger data-testid="select-connection-purok" className={errors.connectionPurok ? "border-red-500 border-2 focus:ring-red-500" : ""}>
                      <SelectValue placeholder="Select Purok" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.connectionZone === "1" && (
                        <>
                          <SelectItem value="4">Purok 4</SelectItem>
                          <SelectItem value="5">Purok 5</SelectItem>
                          <SelectItem value="6">Purok 6</SelectItem>
                        </>
                      )}
                      {formData.connectionZone === "2" && (
                        <>
                          <SelectItem value="1">Purok 1</SelectItem>
                          <SelectItem value="2">Purok 2</SelectItem>
                          <SelectItem value="3">Purok 3</SelectItem>
                        </>
                      )}
                      {formData.connectionZone === "3" && (
                        <SelectItem value="7">Purok 7</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="specificAddress">Specific Address</Label>
                <Input
                  id="specificAddress"
                  value={formData.specificAddress}
                  onChange={(e) => handleChange("specificAddress")(e.target.value)}
                  placeholder="Enter specific address (e.g., House number, street name)"
                  data-testid="input-specific-address"
                  className={errors.specificAddress ? "border-red-500 border-2 focus:ring-red-500" : ""}
                />
              </div>
            </div>
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
                  className={errors.username ? "border-red-500 border-2 focus:ring-red-500" : ""}
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
                {!errors.password && (
                  <p className="text-xs text-gray-500">
                    This account will allow the resident to log into the system
                  </p>
                )}
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