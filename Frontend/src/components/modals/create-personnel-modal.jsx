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

export default function CreatePersonnelModal({ isOpen, onClose }) {

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    purok: "",
    assignedZone: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
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
    phone: null
  });


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

  // Validate email format and check if it's already registered
  const validateEmail = async (email) => {
    if (!email || !email.trim()) {
      setFieldValidation(prev => ({ ...prev, email: null }));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setFieldValidation(prev => ({ ...prev, email: false }));
      return;
    }

    setFieldValidation(prev => ({ ...prev, email: true }));

    // Check if email is already registered
    try {
      setEmailValidation(prev => ({ ...prev, checking: true }));
      const result = await apiClient.checkEmailExists(email.trim());
      // If exists is true, the email is NOT available
      setEmailValidation(prev => ({
        ...prev,
        valid: !result.exists,
        checking: false
      }));
    } catch (error) {
      // If error, assume not available (safe approach)
      setEmailValidation(prev => ({ ...prev, checking: false, valid: false }));
      console.error('Error checking email:', error);
    }
  };

  // Send email verification code
  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      // Validate required fields
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

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        validationErrors.email = "Invalid email format";
      }

      // Check if email validation is still pending or email is not available
      if (emailValidation.checking) {
        validationErrors.email = "Please wait while we check email availability";
      } else if (fieldValidation.email === true && emailValidation.valid === false) {
        validationErrors.email = "This email is already registered";
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        const firstError = Object.values(validationErrors)[0];
        toast.error("Validation Error", {
          description: firstError
        });
        setIsLoading(false);
        return;
      }

      // Send verification code to email
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

      // Create account with verification code (no username or password needed - auto-generated)
      const accountData = {
        first_name: storedFormData.firstName,
        last_name: storedFormData.lastName,
        email: storedFormData.email.trim() || null,
        purok: storedFormData.purok,
        contact_no: storedFormData.phone,
        role: storedFormData.role,
        verification_code: verificationCode.trim(),
        ...(storedFormData.role === 'meter_reader' && { assigned_zone: storedFormData.assignedZone })
      };

      console.log('📤 Creating personnel account with verification:', accountData);
      const response = await authManager.createAccount(accountData);

      const successMessage = `${storedFormData.firstName} ${storedFormData.lastName} has been added as ${storedFormData.role} with login account created`;

      toast.success("Personnel Created Successfully", {
        description: successMessage
      });

      // Reset everything and close modal
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        role: "",
        purok: "",
        assignedZone: ""
      });
      setStoredFormData(null);
      setVerificationStep(false);
      setVerificationCode("");
      setErrors({});
      setVerificationLoading(false);
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

    // Real-time validation for firstName
    if (field === 'firstName' && value.trim()) {
      const nameRegex = /^[a-zA-Z\s'-]{2,}$/; // Only letters, spaces, hyphens, apostrophes (no numbers)
      setFieldValidation(prev => ({ ...prev, firstName: nameRegex.test(value.trim()) }));
    } else if (field === 'firstName') {
      setFieldValidation(prev => ({ ...prev, firstName: null }));
    }

    // Real-time validation for lastName
    if (field === 'lastName' && value.trim()) {
      const nameRegex = /^[a-zA-Z\s'-]{2,}$/; // Only letters, spaces, hyphens, apostrophes (no numbers)
      setFieldValidation(prev => ({ ...prev, lastName: nameRegex.test(value.trim()) }));
    } else if (field === 'lastName') {
      setFieldValidation(prev => ({ ...prev, lastName: null }));
    }

    // Real-time validation for email field
    if (field === 'email' && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const formatValid = emailRegex.test(value.trim());
      setFieldValidation(prev => ({ ...prev, email: formatValid }));
      // Check email existence if format is valid
      if (formatValid) {
        validateEmail(value.trim());
      }
    } else if (field === 'email') {
      setFieldValidation(prev => ({ ...prev, email: null }));
      setEmailValidation({ checking: false, valid: null });
    }

    // Real-time validation for phone
    if (field === 'phone' && value.trim()) {
      const phoneRegex = /^[\d\s+\-()]{7,}$/;
      setFieldValidation(prev => ({ ...prev, phone: phoneRegex.test(value.trim()) }));
    } else if (field === 'phone') {
      setFieldValidation(prev => ({ ...prev, phone: null }));
    }
  };



  return (

    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white sm:max-w-[750px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {verificationStep ? "Verify Email Address" : "Create New Personnel"}
          </DialogTitle>
          <DialogDescription>
            {verificationStep
              ? "Enter the 6-digit verification code sent to your email"
              : "Add a new staff member to the AGASPAY system."}
          </DialogDescription>
        </DialogHeader>

        {!verificationStep ? (
          // FORM STEP
          <form onSubmit={handleSendVerificationCode} className="space-y-4">
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
                  className={`${errors.firstName ? "border-red-500 border-2 focus:ring-red-500" : fieldValidation.firstName === true && formData.firstName ? "border-green-500 border-2 focus:ring-green-500" : ""}`}
                />
                {fieldValidation.firstName === false && formData.firstName && !errors.firstName && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Only letters, spaces, hyphens, and apostrophes allowed</span>
                  </div>
                )}
                {fieldValidation.firstName === true && formData.firstName && !errors.firstName && (
                  <p className="text-xs text-green-600">First name is valid</p>
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
                  className={`${errors.lastName ? "border-red-500 border-2 focus:ring-red-500" : fieldValidation.lastName === true && formData.lastName ? "border-green-500 border-2 focus:ring-green-500" : ""}`}
                />
                {fieldValidation.lastName === false && formData.lastName && !errors.lastName && (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Only letters, spaces, hyphens, and apostrophes allowed</span>
                  </div>
                )}
                {fieldValidation.lastName === true && formData.lastName && !errors.lastName && (
                  <p className="text-xs text-green-600">Last name is valid</p>
                )}
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
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone")(e.target.value)}
                placeholder="Enter phone number"
                required
                data-testid="input-phone"
                className={`${errors.phone ? "border-red-500 border-2 focus:ring-red-500" : fieldValidation.phone === true && formData.phone ? "border-green-500 border-2 focus:ring-green-500" : ""}`}
              />
              {fieldValidation.phone === false && formData.phone && !errors.phone && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>Phone number must be at least 7 digits</span>
                </div>
              )}
              {fieldValidation.phone === true && formData.phone && !errors.phone && (
                <p className="text-xs text-green-600">Phone number is valid</p>
              )}
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

            {/* assigning zone if the role is meter reader */}
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

            {/* Email Section - Separated */}
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

            {/* Account Creation Section - Auto-generated credentials */}
            <div className="border-t pt-4 mt-4">
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      Login credentials will be auto-generated
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Username and password will be automatically created and sent to the personnel's email. No input required from you.
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
                disabled={isLoading || emailValidation.checking || (formData.email && (fieldValidation.email === false || emailValidation.valid === false))}
                data-testid="button-send-code"
              >
                {isLoading ? "Sending Code..." : "Send Verification Code"}
              </Button>
            </div>
          </form>
        ) : (
          // VERIFICATION STEP
          <form onSubmit={handleVerifyAndCreateAccount} className="space-y-4">
            {/* Email display */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Verification code sent to:</p>
              <p className="text-base font-semibold text-gray-900">{storedFormData?.email}</p>
            </div>

            {/* Verification code input */}
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                maxLength="6"
                inputMode="numeric"
                required
                data-testid="input-verification-code"
                className={errors.verificationCode ? "border-red-500 border-2 focus:ring-red-500 text-center text-lg tracking-widest" : "text-center text-lg tracking-widest"}
              />
              {errors.verificationCode && (
                <p className="text-xs text-red-500">{errors.verificationCode}</p>
              )}
            </div>

            {/* Info box about auto-generated credentials */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Account details will be sent via email
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Once verified, the personnel's username and temporary password will be sent to their email address.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setVerificationStep(false);
                  setVerificationCode("");
                  setErrors({});
                }}
                disabled={verificationLoading}
                data-testid="button-back"
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={verificationLoading}
                data-testid="button-create"
              >
                {verificationLoading ? "Creating..." : "Create Personnel"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}   