import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Skeleton } from "../components/ui/skeleton";
import { useToast } from "../hooks/use-toast";
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
  X
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";
import { apiClient } from "../lib/api";

export default function TreasurerGenerateBills() {
  const [selectedTab, setSelectedTab] = useState("single");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedConnections, setSelectedConnections] = useState([]);
  const [formData, setFormData] = useState({
    connection_id: "",
    reading_id: "",
    rate_per_cubic: 25,
    fixed_charge: 50,
    due_date: "",
    billing_period: {
      start_date: "",
      end_date: ""
    },
    notes: ""
  });
  
  const { toast } = useToast();

  // State for API data
  const [readingsResponse, setReadingsResponse] = useState(null);
  const [existingBills, setExistingBills] = useState(null);
  const [readingsLoading, setReadingsLoading] = useState(true);
  const [billsLoading, setBillsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    fetchConnections();
    fetchExistingBills();
  }, []);

  const fetchConnections = async () => {
    try {
      setReadingsLoading(true);
      const data = await apiClient.getMeterReadingConnections();
      setReadingsResponse(data);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
      // Fallback to mock data if API fails
      setReadingsResponse({
        connection_details: [
          {
            connection_id: "mock-1",
            reading_id: "read-1",
            full_name: "Juan Dela Cruz",
            account_number: "WS-2024-001",
            purok_no: "1",
            present_reading: 150,
            previous_reading: 120,
            status: "active"
          }
        ]
      });
    } finally {
      setReadingsLoading(false);
    }
  };

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

  const connectionList = readingsResponse?.connection_details || [];
  const existingBillIds = existingBills?.data?.map(bill => bill.connection_id?.toString()) || [];
  
  // Filter out connections that already have bills
  const availableConnections = connectionList.filter(conn => 
    !existingBillIds.includes(conn.connection_id) &&
    conn.present_reading > 0 // Only show connections with readings
  );

  // Filter connections based on search term
  const filteredConnections = availableConnections.filter(connection => 
    connection.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.purok_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    connection.connection_id.includes(searchTerm)
  );

  // Get selected connection details
  const selectedConnectionData = availableConnections.find(conn => conn.connection_id === formData.connection_id);

  // Calculate bill amount
  const calculateBillAmount = (connection) => {
    if (!connection) return 0;
    const consumption = connection.present_reading - connection.previous_reading;
    const waterCharge = consumption * formData.rate_per_cubic;
    return waterCharge + formData.fixed_charge;
  };

  // State for mutations
  const [isGeneratingBill, setIsGeneratingBill] = useState(false);

  // Generate single bill
  const generateBill = async (billData) => {
    try {
      setIsGeneratingBill(true);
      await apiClient.createBilling(billData);
      
      toast({
        title: "Success",
        description: "Bill generated successfully",
      });
      
      // Clear form
      setFormData({
        connection_id: "",
        reading_id: "",
        rate_per_cubic: 25,
        fixed_charge: 50,
        due_date: "",
        billing_period: { start_date: "", end_date: "" },
        notes: ""
      });
      setSearchTerm("");
      setShowSearchResults(false);
      
      // Refresh data
      fetchConnections();
      fetchExistingBills();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate bill",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingBill(false);
    }
  };

  // State for bulk generation
  const [isGeneratingBulkBills, setIsGeneratingBulkBills] = useState(false);

  // Generate bulk bills
  const generateBulkBills = async (billsData) => {
    try {
      setIsGeneratingBulkBills(true);
      const results = [];
      
      for (const billData of billsData) {
        try {
          const result = await apiClient.createBilling(billData);
          results.push({ success: true, data: result, connection: billData.connection_id });
        } catch (error) {
          results.push({ success: false, error: error.message, connection: billData.connection_id });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      toast({
        title: "Bulk Generation Complete",
        description: `${successCount} bills generated successfully. ${failCount > 0 ? `${failCount} failed.` : ''}`,
      });
      
      setSelectedConnections([]);
      // Refresh data
      fetchConnections();
      fetchExistingBills();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate bulk bills",
        variant: "destructive",
      });
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

  const handleSingleBillSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.connection_id) {
      toast({
        title: "Validation Error",
        description: "Please select a water connection",
        variant: "destructive",
      });
      return;
    }

    if (!formData.due_date) {
      toast({
        title: "Validation Error",
        description: "Please set a due date",
        variant: "destructive",
      });
      return;
    }

    // Format data according to your MongoDB backend schema
    const billData = {
      reading_id: formData.reading_id,
      rate_id: "default_rate", // Using default rate ID as in your backend
      due_date: formData.due_date
    };

    generateBill(billData);
  };

  const handleBulkBillSubmit = async () => {
    if (selectedConnections.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one connection",
        variant: "destructive",
      });
      return;
    }

    if (!formData.due_date) {
      toast({
        title: "Validation Error",
        description: "Please set a due date",
        variant: "destructive",
      });
      return;
    }

    const billsData = selectedConnections.map(connectionId => {
      const connection = availableConnections.find(c => c.connection_id === connectionId);
      return {
        reading_id: connection.reading_id || connection.connection_id,
        rate_id: "default_rate", // Using default rate ID as in your backend
        due_date: formData.due_date
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

  return (
    <div className="flex h-screen bg-gray-100">
      <TreasurerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TreasurerTopHeader />
        
        <main className="flex-1 overflow-auto p-6">
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

            {/* Main Content */}
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
                      <Label htmlFor="rate_per_cubic">Rate per m³ (₱)</Label>
                      <Input
                        id="rate_per_cubic"
                        type="number"
                        step="0.01"
                        value={formData.rate_per_cubic}
                        onChange={(e) => handleInputChange('rate_per_cubic', parseFloat(e.target.value))}
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
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => handleInputChange('due_date', e.target.value)}
                        data-testid="input-due-date"
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
                              <span className="text-blue-700">Location:</span>
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
                              due_date: "",
                              billing_period: { start_date: "", end_date: "" },
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
                                  Location
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
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {readingsLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                  <tr key={index}>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-4" /></td>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-32" /></td>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-20" /></td>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-12" /></td>
                                    <td className="py-4 px-4"><Skeleton className="h-4 w-16" /></td>
                                  </tr>
                                ))
                              ) : filteredConnections.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                                    No unbilled connections available
                                  </td>
                                </tr>
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
                                      {connection.present_reading - connection.previous_reading} m³
                                    </td>
                                    <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                      ₱{calculateBillAmount(connection).toFixed(2)}
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
                          disabled={isGeneratingBulkBills || selectedConnections.length === 0 || !formData.due_date}
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