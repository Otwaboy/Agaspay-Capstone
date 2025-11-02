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
import { Eye, EyeOff } from "lucide-react";

export default function CreateResidentModal({ isOpen, onClose }) {
  
     


  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    meterNo: "",
    purok: "",
    email: "", 
    phone: "",
    zone: "",
    type: "",
    username: "",
    password: "",
    status: "",
    createAccount: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();


  // functions when submmiting the button
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


  // Create account using authManager which is masave sya sa database
        const accountData = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          meter_no: formData.meterNo,
          purok: formData.purok,
          email: formData.email,
          contact_no: formData.phone,
          zone: formData.zone,
          type: formData.type,
          username: formData.username,
          password: formData.password,
          status: formData.status,
          
        };
        await authManager.createResidentAccount(accountData);
      }

      // Simulate personnel creation (this would normally be a separate API call)
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
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
        irstName: "",
        lastName: "",
        meterNo: "",
        purok: "",
        email: "",
        phone: "",
        zone: "",
        type: "",
        username: "",
        password: "",
        status: "",
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

           <div className="space-y-2">
              <Label htmlFor="meterNo">Meter Number</Label>
              <Input
                id="meterNo"
                value={formData.meterNo}
                onChange={(e) => handleChange("meterNo")(e.target.value)}
                placeholder="Enter Meter Number"
                required
                data-testid="input-meter-no"
              />
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
              {/* <Checkbox
                id="createAccount"
                checked={formData.createAccount}
                onCheckedChange={(checked) => handleChange("createAccount")(checked)}
                data-testid="checkbox-create-account"
              /> */}
              <Label htmlFor="createAccount" className="text-sm font-medium">
                Create login account for this resident
              </Label>
            </div>
           

      {/* this line of code mo render sya if formData.createAccount is true */}
            {/* {formData.createAccount && ( */}
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
            {/* )} */}
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