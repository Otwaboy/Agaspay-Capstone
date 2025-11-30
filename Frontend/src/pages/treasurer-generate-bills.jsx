import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Receipt,
  Users,
  Calculator,
  Search,
  Check,
  Calendar,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Edit
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";

import { apiClient } from "../lib/api";



//useStates
export default function TreasurerGenerateBills() {
  const queryClient = useQueryClient();

  const [selectedTab, setSelectedTab] = useState("single");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedConnections, setSelectedConnections] = useState([]);

  // Rate update modal states
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [newRateAmount, setNewRateAmount] = useState("");
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);


  //bill generation data object
  const [formData, setFormData] = useState({
    connection_id: "",
    reading_id: "",
    rate_per_cubic: "",
    fixed_charge: 0,
    notes: ""
  });  

  
  //handling error notification
  // useState para sa mga  API data
  const [readingsResponse, setReadingsResponse] = useState(null);
  const [existingBills, setExistingBills] = useState(null);
  const [readingsLoading, setReadingsLoading] = useState(true);
  const [billsLoading, setBillsLoading] = useState(true); // idk nganu ni



  // Fetch data on component mount
  useEffect(() => {
    fetchConnections();
    fetchExistingBills();
  }, []);


  //fetching latest readings sa backend api
  const fetchConnections = async () => {
    try {
      setReadingsLoading(true);
      const data = await apiClient.getLatestReadings();
      //data sa latest readings will be pass sa setreadingsresponse na updater functiobn
      setReadingsResponse(data);

      //getting rate api
      const rateResponse = await apiClient.getRate()
      if(rateResponse?.rate_id && rateResponse?.amount) {
        setFormData(prev => ({
            ...prev,
            rate_id: rateResponse.rate_id, // ma store ag rate_id
            rate_per_cubic: rateResponse.amount //store the amount of rate
        }))
      }

    } catch (error) {

      console.error('Failed to fetch connections:', error);
      
    } finally {
      setReadingsLoading(false);
    }
  };


  //get or fetching the currentbill api
  const fetchExistingBills = async () => {
    try {
      setBillsLoading(true);
      const data = await apiClient.getCurrentBill();
      setExistingBills(data);

    } catch (error) {
      console.error('Failed to fetch existing bills:', error);
      setExistingBills({ data: [] });
    } finally {
      setBillsLoading(false);
    }
  };
  
// assigning reasdingsResponse nga data sa connection list
  const connectionList = readingsResponse?.connection_details || [];

 //logging para mahibaw an if na fetch ba jud ag data
  console.log('connection list');
  console.log(connectionList)

  const existingBillIds = existingBills?.data?.map(bill => bill.connection_id?.toString()) || [];

  console.log('exisiting bills');
  console.log(existingBillIds)
  
  const availableConnections = connectionList.filter(conn =>
  !conn.is_billed && conn.present_reading > 0 && conn.reading_status === 'approved'  // ✅ Only show approved readings
);

  // ✅ Count pending approval readings (submitted but not yet approved)
  const pendingApprovalCount = connectionList.filter(conn =>
    conn.reading_status === 'submitted' && !conn.is_billed
  ).length;


  //SEARCH PURPOSES
  // Filter connections based on search term
  const filteredConnections = availableConnections.filter(connection => 
    connection.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.purok_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.connection_id.includes(searchTerm)
  );

  console.log('filteredConnections:');
  console.log(filteredConnections)

  // Get selected connection details
  const selectedConnectionData = availableConnections.find(conn => conn.connection_id === formData.connection_id);


  // Calculate bill amount
  const calculateBillAmount = (connection) => {
  if (!connection) return 0;

    const calculated = connection.present_reading - connection.previous_reading;
    const waterCharge = calculated * formData.rate_per_cubic;

    return waterCharge + formData.fixed_charge;
  };

  // Calculate due date (reading period start + 30 days)
  const calculateDueDate = (connection) => {
    if (!connection?.inclusive_date?.start) return "N/A";
    const startDate = new Date(connection.inclusive_date.start);
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };


 
    // A query = get data (e.g., fetch users).
    //A mutation = change data (e.g., add a user, update profile, delete post).

 // State for mutations
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);

  // Generate single bill
  const generateBill = async (billData) => {

    try {
      setIsGeneratingBill(true);
      await apiClient.createBilling(billData);

      toast.success("Success", { description: "Bill generated successfully" });

      // Invalidate meter reader connections query to reflect is_billed flag
      queryClient.invalidateQueries({ queryKey: ["connections"] });

      // Clear form
      setFormData({
        connection_id: "",
        reading_id: "",
        rate_per_cubic: "",
        fixed_charge: "",
        notes: ""
      });
      setSearchTerm("");
      setShowSearchResults(false);

      // Refresh data
      fetchConnections();
      fetchExistingBills();

    } catch (error) {
      toast.error("Error", { description: error.message || "Failed to generate bill" });
    } finally {
      setIsGeneratingBill(false);
    }
  };

  



  // para sa tanan nga generation of bills
  // State for bulk generation
  const [isGeneratingBulkBills, setIsGeneratingBulkBills] = useState(false);



  // Generate bulk bills
  const generateBulkBills = async (billsData) => {
    try {
      setIsGeneratingBulkBills(true);
      //An empty array to store the outcome (success or failure) for each bill.
      const results = [];
  
      for (const billData of billsData) {
        try {

          console.log(`📤 Generating bill for connection: ${billData.connection_id}`);
          
          const result = await apiClient.createBilling(billData);

           console.log(`✅ Success: Bill generated for ${billData.connection_id}`, result);

          results.push({ 
            success: true, 
            data: result, 
            connection: billData.connection_id 
          });

        } catch (error) {

            console.error(`❌ Failed: Bill NOT generated for ${billData.connection_id}`, error);

          results.push({ 
            success: false, 
             error: error.response?.data || error.message, 
            connection: billData.connection_id });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      console.log(`📊 Bulk Result → Success: ${successCount}, Failed: ${failCount}`, results);

      // ✅ Clear saved reading period from localStorage for meter readers
      // This allows them to set a new period for the next billing cycle
      localStorage.removeItem('meterReadingPeriod');
      console.log('✅ Saved reading period cleared for next billing cycle');

      // Invalidate meter reader connections query to reflect is_billed flag
      queryClient.invalidateQueries({ queryKey: ["connections"] });

      toast.success("Bulk Generation Complete", { description: "" });

      setSelectedConnections([]);
      // Refresh data
      fetchConnections();
      fetchExistingBills();
    } catch (error) {

       console.error("🔥 Error in bulk generation:", error);
       
      toast.error("Error", { description: "Failed to generate bulk bills" });
    } finally {
      setIsGeneratingBulkBills(false);
    }
  };



  
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setShowSearchResults(value.length > 0);
  };

  const handleConnectionSelect = (connection) => {
    handleInputChange('connection_id', connection.connection_id);
    handleInputChange('reading_id', connection.reading_id || connection.connection_id);
    setSearchTerm(`${connection.full_name} - ${connection.purok_no}`);
    setShowSearchResults(false);
  };

  
  // generate 1 resident bill only
  const handleSingleBillSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.connection_id) {
      toast.error("Validation Error", { description: "Please select a water connection" });
      return;
    }

    // Format data according to your MongoDB backend schema
    // Note: due_date is now auto-calculated by backend from reading period start date + 30 days
    const billData = {
      reading_id: formData.reading_id,
      rate_id: formData.rate_id
    };


    generateBill(billData);
  };


  // can generate all and select bill
  const handleBulkBillSubmit = async () => {
    if (selectedConnections.length === 0) {
      toast.error("Validation Error", { description: "Please select at least one connection" });
      return;
    }

    const billsData = selectedConnections.map(connectionId => {
      const connection = availableConnections.find(c => c.connection_id === connectionId);
      return {
        reading_id: connection.reading_id,   // ✅ correct
        rate_id: formData.rate_id            // ✅ take from treasurer's selected rate
        // Note: due_date is now auto-calculated by backend from reading period start date + 30 days
      };
    });

    generateBulkBills(billsData);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedConnections(filteredConnections.map(c => c.connection_id));
    } else {
      setSelectedConnections([]);
    }
  };

  const handleConnectionCheck = (connectionId, checked) => {
    if (checked) {
      setSelectedConnections(prev => [...prev, connectionId]);
    } else {
      setSelectedConnections(prev => prev.filter(id => id !== connectionId));
    }
  };

  // ✅ Handle rate update
  const handleUpdateRate = async () => {
    if (!newRateAmount || parseFloat(newRateAmount) <= 0) {
      toast.error("Validation Error", { description: "Please enter a valid rate amount" });
      return;
    }

    try {
      setIsUpdatingRate(true);

      // Create new rate with status "active" (backend will deactivate old ones)
      await apiClient.addRatingAmount({
        amount: parseFloat(newRateAmount),
        effective_date: new Date().toISOString(),
        rate_status: "active"
      });

      toast.success("Success", { description: "" });

      // Update local state
      setFormData(prev => ({
        ...prev,
        rate_per_cubic: parseFloat(newRateAmount)
      }));

      // Close modal and reset
      setIsRateModalOpen(false);
      setNewRateAmount("");

      // Refresh rate data
      fetchConnections();
    } catch (error) {
      toast.error("Error", { description: error.message || "Failed to update rate" });
    } finally {
      setIsUpdatingRate(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <TreasurerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TreasurerTopHeader />
        
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="text-generate-bills-title">
                    Generate Bills
                  </h1>
                  <p className="text-gray-600">Create water bills for residents</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Available Connections</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-available-connections">
                        {availableConnections.length}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>


              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Selected for Billing</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-selected-count">
                        {selectedTab === "single" ? (formData.connection_id ? 1 : 0) : selectedConnections.length}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Rate per m³</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-rate-per-cubic">
                        ₱{formData.rate_per_cubic}
                      </p>
                    </div>
                    <Calculator className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Fixed Charge</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-fixed-charge">
                        ₱{formData.fixed_charge}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ✅ Pending Approval Alert */}
            {pendingApprovalCount > 0 && (
              <Card className="mb-8 border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-orange-900 mb-1">
                        Readings Pending Approval
                      </h3>
                      <p className="text-sm text-orange-700">
                        There are <strong>{pendingApprovalCount}</strong> meter reading(s) that have been submitted but not yet approved.
                        Bills can only be generated for approved readings. Please go to the "Approve Readings" page to review and approve them.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}





            {/* Main Content BIll GENERATION */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Bill Generation</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="single" data-testid="tab-single">Single Bill</TabsTrigger>
                    <TabsTrigger value="bulk" data-testid="tab-bulk">Bulk Generation</TabsTrigger>
                  </TabsList>

                  {/* Common Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="rate_per_cubic">Rate per m³ (₱)</Label>
                        <Dialog open={isRateModalOpen} onOpenChange={setIsRateModalOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 hover:bg-purple-100"
                              data-testid="button-edit-rate"
                            >
                              <Edit className="h-3.5 w-3.5 text-purple-600" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Water Rate</DialogTitle>
                              <DialogDescription>
                                Enter the new rate per cubic meter. This will create a new active rate and deactivate the previous one.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="new-rate">New Rate Amount (₱)</Label>
                                <Input
                                  id="new-rate"
                                  type="number"
                                  step="0.01"
                                  placeholder="Enter new rate"
                                  value={newRateAmount}
                                  onChange={(e) => setNewRateAmount(e.target.value)}
                                  data-testid="input-new-rate"
                                />
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-700">
                                  <strong>Current Rate:</strong> ₱{formData.rate_per_cubic} per m³
                                </p>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsRateModalOpen(false);
                                  setNewRateAmount("");
                                }}
                                disabled={isUpdatingRate}
                                data-testid="button-cancel-rate"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleUpdateRate}
                                disabled={isUpdatingRate || !newRateAmount}
                                data-testid="button-save-rate"
                              >
                                {isUpdatingRate ? "Updating..." : "Update Rate"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Input
                        id="rate_per_cubic"
                        type="number"
                        step="0.01"
                        value={formData.rate_per_cubic}
                        disabled
                        className="bg-gray-100"
                        data-testid="input-rate-per-cubic"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fixed_charge">Fixed Charge (₱)</Label>
                      <Input
                        id="fixed_charge"
                        type="number"
                        step="0.01"
                        value={formData.fixed_charge}
                        onChange={(e) => handleInputChange('fixed_charge', parseFloat(e.target.value))}
                        data-testid="input-fixed-charge"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Input
                        id="notes"
                        placeholder="Billing notes..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        data-testid="input-notes"
                      />
                    </div>
                  </div>

                  <TabsContent value="single">
                    <form onSubmit={handleSingleBillSubmit} className="space-y-6">
                      {/* Connection Search */}
                      <div className="space-y-2">
                        <Label htmlFor="connection_search">Search Water Connection</Label>
                        <div className="relative">
                          <Input
                            id="connection_search"
                            type="text"
                            placeholder="Search by name, location, or connection ID..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onFocus={() => searchTerm && setShowSearchResults(true)}
                            onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                            data-testid="input-connection-search"
                            className="pr-10"
                          />
                          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          
                          {/* Search Results */}
                          {showSearchResults && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                              {readingsLoading ? (
                                <div className="px-3 py-2 text-sm text-gray-500">Loading connections...</div>
                              ) : filteredConnections.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-gray-500">
                                  {searchTerm ? 'No unbilled connections found' : 'No connections available'}
                                </div>
                              ) : (
                                filteredConnections.map((connection) => (
                                  <div
                                    key={connection.connection_id}
                                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    onClick={() => handleConnectionSelect(connection)}
                                    data-testid={`option-connection-${connection.connection_id}`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-900">{connection.full_name}</div>
                                        <div className="text-sm text-gray-500">
                                          {connection.purok_no} • ID: {connection.connection_id}
                                        </div>
                                        <div className="text-sm text-blue-600">
                                          Reading: {connection.previous_reading} → {connection.present_reading} m³
                                        </div>
                                      </div>
                                      {formData.connection_id === connection.connection_id && (
                                        <Check className="h-4 w-4 text-green-600" />
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bill Preview */}
                      {selectedConnectionData && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-blue-900 mb-3">Bill Preview</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-blue-700">Customer:</span>
                              <p className="font-medium">{selectedConnectionData.full_name}</p>
                            </div>
                            <div>
                              <span className="text-blue-700">Purok:</span>
                              <p className="font-medium">{selectedConnectionData.purok_no}</p>
                            </div>
                            <div>
                              <span className="text-blue-700">Consumption:</span>
                              <p className="font-medium">
                                {selectedConnectionData.present_reading - selectedConnectionData.previous_reading} m³
                              </p>
                            </div>
                            <div>
                              <span className="text-blue-700">Total Amount:</span>
                              <p className="font-bold text-lg text-blue-900">
                                ₱{calculateBillAmount(selectedConnectionData).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setFormData({
                              connection_id: "",
                              reading_id: "",
                              rate_per_cubic: 25,
                              fixed_charge: 50,
                              notes: ""
                            });
                            setSearchTerm("");
                          }}
                          data-testid="button-clear-form"
                        >
                          Clear
                        </Button>
                        <Button
                          type="submit"
                          disabled={isGeneratingBill || !formData.connection_id}
                          data-testid="button-generate-single-bill"
                        >
                          {isGeneratingBill ? "Generating..." : "Generate Bill"}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="bulk">
                    <div className="space-y-6">
                      {/* Bulk Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Checkbox
                            id="select-all"
                            checked={selectedConnections.length === filteredConnections.length && filteredConnections.length > 0}
                            onCheckedChange={handleSelectAll}
                            data-testid="checkbox-select-all"
                          />
                          <Label htmlFor="select-all">Select All ({filteredConnections.length})</Label>
                        </div>
                        <div className="text-sm text-gray-600">
                          {selectedConnections.length} of {filteredConnections.length} selected
                        </div>
                      </div>

                      
                      {/* Connections Table */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="overflow-x-auto max-h-96">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                                  Select
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                                  Customer
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                                  Purok
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                                  Reading
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                                  Consumption
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                                  Amount
                                </th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">
                                  Due Date
                                </th>
                              </tr>
                            </thead>
                            
                            <tbody className="bg-white divide-y divide-gray-200">
                              {/* so ag data aning readinsloading kay get from the getwaterconnection na api */}

                              {readingsLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                  <tr key={index}>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-4" /></td>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-12" /></td>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
                                  </tr>
                                ))

                                // if the length is zero 
                              ) : filteredConnections.length === 0 ? (
                                <tr>
                                  <td colSpan="7" className="py-8 px-4 text-center text-gray-500">
                                    No unbilled connections available
                                  </td>
                                </tr>

                                //if successfullly na fetch or naay data
                              ) : (
                                filteredConnections.map((connection) => (
                                  <tr key={connection.connection_id} data-testid={`row-connection-${connection.connection_id}`}>
                                    <td className="py-4 px-4">
                                      <Checkbox
                                        checked={selectedConnections.includes(connection.connection_id)}
                                        onCheckedChange={(checked) => handleConnectionCheck(connection.connection_id, checked)}
                                        data-testid={`checkbox-connection-${connection.connection_id}`}
                                      />
                                    </td>
                                    <td className="py-4 px-4">
                                      <div className="text-sm font-medium text-gray-900">{connection.full_name}</div>
                                      <div className="text-sm text-gray-500">ID: {connection.connection_id}</div>
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-900">{connection.purok_no}</td>
                                    <td className="py-4 px-4 text-sm text-gray-900">
                                      {connection.previous_reading} → {connection.present_reading}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-900">
                                      {connection.calculated} m³
                                    </td>
                                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                      ₱{calculateBillAmount(connection).toFixed(2)}
                                    </td>
                                    <td className="py-4 px-4 text-sm text-gray-900">
                                      {calculateDueDate(connection)}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>


                      {/* Bulk Summary */}
                      {selectedConnections.length > 0 && (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-green-900 mb-2">Bulk Generation Summary</h3>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-green-700">Selected Connections:</span>
                              <p className="font-medium">{selectedConnections.length}</p>
                            </div>
                            <div>
                              <span className="text-green-700">Total Consumption:</span>
                              <p className="font-medium">
                                {selectedConnections.reduce((total, id) => {
                                  const conn = availableConnections.find(c => c.connection_id === id);
                                  return total + (conn ? conn.present_reading - conn.previous_reading : 0);
                                }, 0)} m³
                              </p>
                            </div>
                            <div>
                              <span className="text-green-700">Total Revenue:</span>
                              <p className="font-bold text-lg text-green-900">
                                ₱{selectedConnections.reduce((total, id) => {
                                  const conn = availableConnections.find(c => c.connection_id === id);
                                  return total + (conn ? calculateBillAmount(conn) : 0);
                                }, 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setSelectedConnections([])}
                          data-testid="button-clear-selection"
                        >
                          Clear Selection
                        </Button>
                        <Button
                          onClick={handleBulkBillSubmit}
                          disabled={isGeneratingBulkBills || selectedConnections.length === 0}
                          data-testid="button-generate-bulk-bills"
                        >
                          {isGeneratingBulkBills ? "Generating..." : `Generate ${selectedConnections.length} Bills`}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}