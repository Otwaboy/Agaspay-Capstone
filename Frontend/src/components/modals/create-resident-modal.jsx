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
import { AlertCircle } from "lucide-react";

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
    meterNumber: ""
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [meterValidation, setMeterValidation] = useState({ checking: false, valid: null });
  const [emailValidation, setEmailValidation] = useState({ checking: false, valid: null });

  // Email verification states
  const [verificationStep, setVerificationStep] = useState(false); // false = form, true = verification
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [storedFormData, setStoredFormData] = useState(null);

  // Field validation states for visual feedback (real-time validation)
  const [fieldValidation, setFieldValidation] = useState({
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    specificAddress: null
  });

  // Parse MongoDB duplicate key error and other backend errors into user-friendly messages
  const parseDuplicateKeyError = (errorMessage) => {
    const newErrors = {};
    let userFriendlyMessage = errorMessage;

    // Check for MongoDB duplicate key error (E11000)
    if (errorMessage.includes('E11000 duplicate key error') || errorMessage.includes('duplicate key error')) {
      if (errorMessage.includes('email') || errorMessage.includes('email_1')) {
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

  // Send email verification code
  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate email first
      if (!formData.email || !formData.email.trim()) {
        toast.error("Email Required", {
          description: "Please enter your email address"
        });
        setIsLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        toast.error("Invalid Email", {
          description: "Please enter a valid email address"
        });
        setIsLoading(false);
        return;
      }

      console.log('📧 Sending verification code to:', formData.email);
      const response = await apiClient.request('/api/v1/auth/send-email-verification', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email.trim() })
      });

      if (response.success || response.message) {
        toast.success("Verification Code Sent", {
          description: `A verification code has been sent to ${formData.email}`
        });

        // Store form data and move to verification step
        setStoredFormData(formData);
        setVerificationStep(true);
        setVerificationCode("");
        setErrors({});
      }
    } catch (error) {
      console.error('❌ Error sending verification code:', error);
      let errorMessage = "Failed to send verification code";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast.error("Error", {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verify code and create account
  const handleVerifyAndCreateAccount = async (e) => {
    e.preventDefault();
    setVerificationLoading(true);
    setErrors({});

    try {
      if (!verificationCode || verificationCode.trim() === "") {
        toast.error("Code Required", {
          description: "Please enter the verification code"
        });
        setVerificationLoading(false);
        return;
      }

      // Validate all form fields before creating account
      const validationErrors = {};

      if (!storedFormData.firstName || storedFormData.firstName.trim() === "") {
        validationErrors.firstName = "First name is required";
      }

      if (!storedFormData.lastName || storedFormData.lastName.trim() === "") {
        validationErrors.lastName = "Last name is required";
      }

      if (!storedFormData.connectionZone || storedFormData.connectionZone.trim() === "") {
        validationErrors.connectionZone = "Water connection zone is required";
      }

      if (!storedFormData.connectionPurok || storedFormData.connectionPurok.trim() === "") {
        validationErrors.connectionPurok = "Water connection purok is required";
      }

      if (!storedFormData.meterNumber || storedFormData.meterNumber.trim() === "") {
        validationErrors.meterNumber = "Meter number is required";
      } else if (meterValidation.valid === false) {
        validationErrors.meterNumber = "This meter number is already in use. Please enter a different meter number.";
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        const firstError = Object.values(validationErrors)[0];
        toast.error("Validation Error", {
          description: firstError
        });
        setVerificationLoading(false);
        return;
      }

      // Create resident account with verification code
      const accountData = {
        first_name: storedFormData.firstName,
        last_name: storedFormData.lastName,
        zone: storedFormData.zone,
        purok: storedFormData.purok,
        email: storedFormData.email.trim() || null,
        contact_no: storedFormData.phone,
        type: storedFormData.type,
        meter_no: storedFormData.meterNumber,
        connection_zone: storedFormData.connectionZone,
        connection_purok: storedFormData.connectionPurok,
        specific_address: storedFormData.specificAddress,
        verification_code: verificationCode.trim()
      };

      console.log('📤 Creating resident account with verification:', accountData);
      const response = await authManager.createResidentAccount(accountData);

      // Get the connection_id from the response
      const connectionId = response.connection_id || response.data?.connection_id;

      // Create meter installation fee billing (50 pesos) automatically
      if (connectionId) {
        try {
          console.log('💰 Creating meter installation fee billing for connection:', connectionId);
          await apiClient.createMeterInstallationFeeBilling(connectionId);
          console.log('✅ Meter installation fee bill created successfully');
        } catch (billingError) {
          console.error('⚠️ Warning: Could not create billing automatically:', billingError);
          // Don't fail the whole process if billing creation fails
          // User can manually record the payment later
        }
      }

      const successMessage = response.message || `${storedFormData.firstName} ${storedFormData.lastName} has been registered successfully. A 50 pesos meter installation fee has been automatically billed.`;

      toast.success("Resident Created Successfully", {
        description: successMessage,
        duration: 6000,
      });

      // Reset everything and close modal
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
        meterNumber: ""
      });
      setStoredFormData(null);
      setVerificationStep(false);
      setVerificationCode("");
      setErrors({});
      setVerificationLoading(false);
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
    // Real-time validation for text fields
    if (field === 'firstName' && value.trim()) {
      const nameRegex = /^[a-zA-Z\s'-]{2,}$/; // Only letters, spaces, hyphens, apostrophes (no numbers)
      setFieldValidation(prev => ({ ...prev, firstName: nameRegex.test(value.trim()) }));
    } else if (field === 'firstName') {
      setFieldValidation(prev => ({ ...prev, firstName: null }));
    }

    if (field === 'lastName' && value.trim()) {
      const nameRegex = /^[a-zA-Z\s'-]{2,}$/; // Only letters, spaces, hyphens, apostrophes (no numbers)
      setFieldValidation(prev => ({ ...prev, lastName: nameRegex.test(value.trim()) }));
    } else if (field === 'lastName') {
      setFieldValidation(prev => ({ ...prev, lastName: null }));
    }

    if (field === 'email' && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const formatValid = emailRegex.test(value.trim());
      setFieldValidation(prev => ({ ...prev, email: formatValid }));
      // Check email existence if format is valid
      if (formatValid) {
        checkEmailExistence(value.trim());
      }
    } else if (field === 'email') {
      setFieldValidation(prev => ({ ...prev, email: null }));
      setEmailValidation({ checking: false, valid: null });
    }

    if (field === 'phone' && value.trim()) {
      const phoneRegex = /^[\d\s+\-()]{7,}$/;
      setFieldValidation(prev => ({ ...prev, phone: phoneRegex.test(value.trim()) }));
    } else if (field === 'phone') {
      setFieldValidation(prev => ({ ...prev, phone: null }));
    }

    if (field === 'specificAddress' && value.trim()) {
      setFieldValidation(prev => ({ ...prev, specificAddress: value.trim().length >= 3 }));
    } else if (field === 'specificAddress') {
      setFieldValidation(prev => ({ ...prev, specificAddress: null }));
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

  const checkEmailExistence = async (email) => {
    setEmailValidation({ checking: true, valid: null });
    try {
      const result = await apiClient.checkEmailExists(email);
      // If exists is true, the email is NOT available
      setEmailValidation({ checking: false, valid: !result.exists });
    } catch (error) {
      // If error, assume not available (safe approach)
      setEmailValidation({ checking: false, valid: false });
      console.error('Error checking email:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[725px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {verificationStep ? "Verify Email Address" : "Create New Resident"}
          </DialogTitle>
          <DialogDescription>
            {verificationStep
              ? "Enter the verification code sent to your email"
              : "Add a new resident water connection to the AGASPAY system."}
          </DialogDescription>
        </DialogHeader>

        {verificationStep ? (
          // Verification Step
          <form onSubmit={handleVerifyAndCreateAccount} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 mb-2">
                A verification code has been sent to <strong>{storedFormData?.email}</strong>
              </p>
              <p className="text-xs text-blue-700">
                Please enter the 6-digit code below. The code will expire in 10 minutes.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code <span className="text-red-500">*</span></Label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength="6"
                inputMode="numeric"
                required
                className={errors.verificationCode ? "border-red-500 border-2 focus:ring-red-500" : ""}
              />
              {errors.verificationCode && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.verificationCode}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerificationStep(false);
                  setVerificationCode("");
                  setStoredFormData(null);
                  setErrors({});
                }}
                disabled={verificationLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={verificationLoading}
              >
                {verificationLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </div>
          </form>
        ) : (
          // Form Step
          <form onSubmit={handleSendVerificationCode} className="space-y-4">

          <div className="border-t pt-4 mt-2 mb-4">
              <div className="flex items-center space-x-2 mb-4">
              <Label htmlFor="createAccount" className="text-sm font-medium">
               Resident Personnel Information Details
              </Label>
            </div>
          <div className="grid grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <div className="relative">
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName")(e.target.value)}
                  placeholder="Enter first name"
                  required
                  data-testid="input-first-name"
                  className={`${errors.firstName ? "border-red-500 border-2 focus:ring-red-500" : fieldValidation.firstName === true && formData.firstName ? "border-green-500 border-2 focus:ring-green-500" : ""}`}
                />
                {fieldValidation.firstName === true && formData.firstName && (
                  <div className="absolute right-3 top-3 text-green-500">
                    ✓
                  </div>
                )}
              </div>
              {errors.firstName && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.firstName}</span>
                </div>
              )}
              {fieldValidation.firstName === false && formData.firstName && !errors.firstName && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Name cannot contain numbers</span>
                </div>
              )}
              {fieldValidation.firstName === true && formData.firstName && !errors.firstName && (
                <p className="text-xs text-green-600">First name is valid</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <div className="relative">
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName")(e.target.value)}
                  placeholder="Enter last name"
                  required
                  data-testid="input-last-name"
                  className={`${errors.lastName ? "border-red-500 border-2 focus:ring-red-500" : fieldValidation.lastName === true && formData.lastName ? "border-green-500 border-2 focus:ring-green-500" : ""}`}
                />
                {fieldValidation.lastName === true && formData.lastName && (
                  <div className="absolute right-3 top-3 text-green-500">
                    ✓
                  </div>
                )}
              </div>
              {errors.lastName && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.lastName}</span>
                </div>
              )}
              {fieldValidation.lastName === false && formData.lastName && !errors.lastName && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Name cannot contain numbers</span>
                </div>
              )}
              {fieldValidation.lastName === true && formData.lastName && !errors.lastName && (
                <p className="text-xs text-green-600">Last name is valid</p>
              )}
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
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone")(e.target.value)}
                placeholder="Enter phone number"
                required
                data-testid="input-phone"
                className={`${errors.phone ? "border-red-500 border-2 focus:ring-red-500" : fieldValidation.phone === true && formData.phone ? "border-green-500 border-2 focus:ring-green-500" : ""}`}
              />
              {fieldValidation.phone === true && formData.phone && (
                <div className="absolute right-3 top-3 text-green-500">
                  ✓
                </div>
              )}
            </div>
            {errors.phone && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.phone}</span>
              </div>
            )}
            {fieldValidation.phone === true && formData.phone && !errors.phone && (
              <p className="text-xs text-green-600">Valid phone format</p>
            )}
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
                    className={`${errors.meterNumber || (meterValidation.valid === false && formData.meterNumber) ? "border-red-500 border-2 focus:ring-red-500" : meterValidation.valid === true && formData.meterNumber ? "border-green-500 border-2 focus:ring-green-500" : ""}`}
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
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.meterNumber}</span>
                  </div>
                )}
                {meterValidation.valid === false && formData.meterNumber && !errors.meterNumber && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>This meter number is already in use</span>
                  </div>
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
                <div className="relative">
                  <Input
                    id="specificAddress"
                    value={formData.specificAddress}
                    onChange={(e) => handleChange("specificAddress")(e.target.value)}
                    placeholder="Enter specific address (e.g., House number, street name)"
                    data-testid="input-specific-address"
                    className={`${errors.specificAddress ? "border-red-500 border-2 focus:ring-red-500" : fieldValidation.specificAddress === true && formData.specificAddress ? "border-green-500 border-2 focus:ring-green-500" : ""}`}
                  />
                  {fieldValidation.specificAddress === true && formData.specificAddress && (
                    <div className="absolute right-3 top-3 text-green-500">
                      ✓
                    </div>
                  )}
                </div>
                {errors.specificAddress && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.specificAddress}</span>
                  </div>
                )}
                {fieldValidation.specificAddress === true && formData.specificAddress && !errors.specificAddress && (
                  <p className="text-xs text-green-600">Address is valid</p>
                )}
              </div>
            </div>
          </div>

          {/* Email Section */}
          <div className="border-t pt-4 mt-4 mb-4">
            <div className="flex items-center space-x-2 mb-4">
              <Label htmlFor="email" className="text-sm font-medium">
                Contact Information
              </Label>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email")(e.target.value)}
                    placeholder="Enter email address"
                    required
                    data-testid="input-email"
                    className={`${errors.email || (fieldValidation.email === false && formData.email) || (emailValidation.valid === false && formData.email) ? "border-red-500 border-2 focus:ring-red-500" : emailValidation.valid === true && formData.email && fieldValidation.email === true ? "border-green-500 border-2 focus:ring-green-500" : ""}`}
                  />
                  {emailValidation.checking && formData.email && fieldValidation.email === true && (
                    <div className="absolute right-3 top-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                    </div>
                  )}
                  {emailValidation.valid === true && formData.email && !emailValidation.checking && fieldValidation.email === true && (
                    <div className="absolute right-3 top-3 text-green-500">
                      ✓
                    </div>
                  )}
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.email}</span>
                  </div>
                )}
                {fieldValidation.email === false && formData.email && !errors.email && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Invalid email format</span>
                  </div>
                )}
                {emailValidation.valid === false && formData.email && !errors.email && fieldValidation.email === true && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>This email is already registered</span>
                  </div>
                )}
                {emailValidation.valid === true && formData.email && !errors.email && fieldValidation.email === true && (
                  <p className="text-xs text-green-600">Email is available</p>
                )}
              </div>
              <p className="text-xs text-gray-600">
                Login credentials will be sent to this email address
              </p>
            </div>
          </div>

          {/* Login Account Auto-Generation Info */}
          <div className="border-t pt-4 mt-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Automatic Login Credentials</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Login credentials will be automatically generated and sent to the resident's email address:
                  </p>
                  <p className="text-xs text-blue-700 mt-2">
                    <strong>Username:</strong> Resident's email address<br/>
                    <strong>Temporary Password:</strong> Auto-generated and sent via email
                  </p>
                </div>
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
              disabled={
                isLoading ||
                emailValidation.checking ||
                (formData.email && (fieldValidation.email === false || emailValidation.valid === false)) ||
                !formData.firstName?.trim() ||
                !formData.lastName?.trim() ||
                !formData.email?.trim() ||
                !formData.phone?.trim() ||
                !formData.zone ||
                !formData.purok ||
                !formData.connectionZone ||
                !formData.connectionPurok ||
                !formData.meterNumber?.trim() ||
                !formData.specificAddress?.trim() ||
                !formData.type ||
                fieldValidation.firstName === false ||
                fieldValidation.lastName === false ||
                fieldValidation.phone === false ||
                fieldValidation.specificAddress === false ||
                meterValidation.valid === false
              }
              data-testid="button-create"
            >
              {isLoading ? "Sending Verification Code..." : "Send Verification Code"}
            </Button>
          </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}