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
import { Checkbox } from "../ui/checkbox";
import { useToast } from "../../hooks/use-toast";
import { authManager } from "../../lib/auth";
import { Eye, EyeOff, Calendar, Clock, User, AlertCircle } from "lucide-react";
import { apiClient } from "../../lib/api";

export default function CreateResidentModal({ isOpen, onClose }) {
  
     


  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    purok: "",
    email: "", 
    phone: "",
    zone: "",
    type: "",
    username: "",
    password: ""
  });
  
  // Scheduling state
  const [scheduleInstallation, setScheduleInstallation] = useState(false);
  const [schedulingData, setSchedulingData] = useState({
    scheduleDate: "",
    scheduleTime: "",
    assignedPersonnel: ""
  });
  const [maintenancePersonnel, setMaintenancePersonnel] = useState([]);
  const [isLoadingPersonnel, setIsLoadingPersonnel] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  // Fetch maintenance personnel with availability checking
  useEffect(() => {
    const fetchPersonnel = async () => {
      if (!scheduleInstallation || !schedulingData.scheduleDate || !schedulingData.scheduleTime) {
        setMaintenancePersonnel([]);
        return;
      }

      setIsLoadingPersonnel(true);
      try {
        const response = await apiClient.getMaintenancePersonnel(
          schedulingData.scheduleDate,
          schedulingData.scheduleTime
        );
        // Backend returns { personnel: [...], count: N }
        setMaintenancePersonnel(response.personnel || []);
      } catch (error) {
        console.error("Failed to fetch personnel:", error);
        setMaintenancePersonnel([]);
      } finally {
        setIsLoadingPersonnel(false);
      }
    };

    fetchPersonnel();
  }, [scheduleInstallation, schedulingData.scheduleDate, schedulingData.scheduleTime]);

  // functions when submmiting the button
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate required fields
      if (!formData.username || !formData.password) {
        toast({
          title: "Validation Error",
          description: "Username and password are required",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        toast({
          title: "Validation Error", 
          description: "Password must be at least 6 characters long",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Validate scheduling if enabled
      if (scheduleInstallation) {
        if (!schedulingData.scheduleDate || !schedulingData.scheduleTime || !schedulingData.assignedPersonnel) {
          toast({
            title: "Validation Error",
            description: "Please fill in all scheduling fields (date, time, and personnel)",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      // Create resident account with optional scheduling data
      const accountData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        purok: formData.purok,
        email: formData.email,
        contact_no: formData.phone,
        zone: formData.zone,
        type: formData.type,
        username: formData.username,
        password: formData.password,
      };

      // Add scheduling data if enabled
      if (scheduleInstallation) {
        accountData.schedule_installation = true;
        accountData.schedule_date = schedulingData.scheduleDate;
        accountData.schedule_time = schedulingData.scheduleTime;
        accountData.assigned_personnel = schedulingData.assignedPersonnel;
      }

      await authManager.createResidentAccount(accountData);
      
      const successMessage = scheduleInstallation
        ? `${formData.firstName} ${formData.lastName} has been registered. Meter installation scheduled for ${schedulingData.scheduleDate} at ${schedulingData.scheduleTime}.`
        : `${formData.firstName} ${formData.lastName} has been registered. Please schedule meter installation through the Assignments page.`;

      toast({
        title: "Resident Created Successfully",
        description: successMessage,
        variant: "default"
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
        username: "",
        password: ""
      });
      
      // Reset scheduling data
      setScheduleInstallation(false);
      setSchedulingData({
        scheduleDate: "",
        scheduleTime: "",
        assignedPersonnel: ""
      });
      setMaintenancePersonnel([]);
      
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


  // handleChange takes a parameter field (the name of the form field you want to update).
  //It returns another function that takes value (the new value for that field).
  //handleChange("firstName")("Joshua");
  //setFormData(prev => ({ ...prev, firstName: "Joshua" }));

  //This code is a reusable state updater for multiple input fields.

  const handleChange = (field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generate time slots from 8 AM to 5 PM (same as incident report UX)
  const timeSlots = [];
  for (let hour = 8; hour <= 17; hour++) {
    for (let minute of ['00', '30']) {
      const time = `${hour.toString().padStart(2, '0')}:${minute}`;
      const displayTime = new Date(`2024-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      timeSlots.push({ value: time, label: displayTime });
    }
  }



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

            {/* assigning  zone */}

          <div className="space-y-2">
            <Label htmlFor="zone">Zone</Label>
            <Select onValueChange={handleChange("zone")} required>
              <SelectTrigger data-testid="select-zone">
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
                  <SelectTrigger data-testid="select-purok">
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
                  <SelectTrigger data-testid="select-purok">
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
                  <SelectTrigger data-testid="select-purok">
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
            <Label htmlFor="type">Type</Label>
            <Select onValueChange={handleChange("type")} required>
              <SelectTrigger data-testid="select-type">
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
            {/* )} */}
          </div>

          {/* Meter Installation Scheduling Section */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="scheduleInstallation"
                checked={scheduleInstallation}
                onCheckedChange={setScheduleInstallation}
                data-testid="checkbox-schedule-installation"
              />
              <Label htmlFor="scheduleInstallation" className="text-sm font-medium cursor-pointer">
                Schedule Meter Installation Now (Optional)
              </Label>
            </div>

            {scheduleInstallation && (
              <div className="space-y-4 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">
                  Schedule the meter installation appointment. The system will check personnel availability.
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="scheduleDate">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      Installation Date
                    </Label>
                    <Input
                      id="scheduleDate"
                      type="date"
                      value={schedulingData.scheduleDate}
                      onChange={(e) => setSchedulingData(prev => ({ ...prev, scheduleDate: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      required={scheduleInstallation}
                      data-testid="input-schedule-date"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduleTime">
                      <Clock className="inline h-4 w-4 mr-2" />
                      Installation Time
                    </Label>
                    <Select
                      value={schedulingData.scheduleTime}
                      onValueChange={(value) => setSchedulingData(prev => ({ ...prev, scheduleTime: value }))}
                      required={scheduleInstallation}
                    >
                      <SelectTrigger data-testid="select-schedule-time">
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Personnel Selection with Availability */}
                <div className="space-y-2">
                  <Label htmlFor="assignedPersonnel">
                    <User className="inline h-4 w-4 mr-2" />
                    Assign Maintenance Personnel
                  </Label>
                  
                  {isLoadingPersonnel ? (
                    <div className="text-sm text-gray-500 py-2">Loading available personnel...</div>
                  ) : !schedulingData.scheduleDate || !schedulingData.scheduleTime ? (
                    <div className="text-sm text-amber-600 py-2 bg-amber-50 p-3 rounded">
                      Please select date and time first to check personnel availability
                    </div>
                  ) : maintenancePersonnel.length === 0 ? (
                    <div className="text-sm text-red-600 py-2 bg-red-50 p-3 rounded">
                      No maintenance personnel found. Please add maintenance personnel first.
                    </div>
                  ) : (
                    <Select
                      value={schedulingData.assignedPersonnel}
                      onValueChange={(value) => setSchedulingData(prev => ({ ...prev, assignedPersonnel: value }))}
                      required={scheduleInstallation}
                    >
                      <SelectTrigger data-testid="select-assigned-personnel">
                        <SelectValue placeholder="Select maintenance personnel" />
                      </SelectTrigger>
                      <SelectContent>
                        {maintenancePersonnel.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{person.name}</span>
                              {person.isAvailable ? (
                                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                  ✓ Available
                                </span>
                              ) : (
                                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                                  ✗ Busy
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Show warning if selected personnel is busy */}
                  {schedulingData.assignedPersonnel && maintenancePersonnel.find(p => p.id === schedulingData.assignedPersonnel && !p.isAvailable) && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Scheduling Conflict Warning</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            This personnel is already scheduled at this time. Consider choosing another time or available personnel.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    <strong>Hint:</strong> Personnel with green badges are available at the selected time.
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
              {isLoading ? "Creating..." : "Create Resident"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    
  );
}   