import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import {
  FileText,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  History,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { apiClient } from "../lib/api";

export default function AdminBilling() {
  const [activeTab, setActiveTab] = useState("billing");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoneFilter, setZoneFilter] = useState("all");

  const { data: billingData, isLoading: billingLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: () => apiClient.getAllBilling()
  });

  const { data: paymentData, isLoading: paymentLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => apiClient.getAllPayments()
  });

  const { data: readingData, isLoading: readingLoading } = useQuery({
    queryKey: ['reading-history'],
    queryFn: () => apiClient.getReadingHistory()
  });

  const isLoading = billingLoading || paymentLoading || readingLoading;

  const bills = billingData?.data || [];
  const payments = paymentData?.payments || [];
  const readings = readingData?.data || [];

  console.log('sure uy', bills);
  
  const enrichedBills = bills.map(bill => {
    const payment = payments.find(p => p.billing_id?._id === bill._id);
    const isPaid = bill.status === 'paid';
    const isOverdue = !isPaid && new Date(bill.due_date) < new Date();
    
    return {
      ...bill,
      status: isPaid ? 'paid' : (isOverdue ? 'overdue' : 'pending'),
      payment: payment,
      paidDate: payment?.payment_date
    };
  });

  const filteredBills = enrichedBills.filter(bill => {
    const residentName = bill.resident_id ? 
      `${bill.resident_id.first_name} ${bill.resident_id.last_name}` : '';
    const matchesSearch = residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.resident_id?.account_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      paid: { label: "Paid", className: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      overdue: { label: "Overdue", className: "bg-red-100 text-red-800", icon: XCircle }
    };
    return config[status] || config.pending;
  };

  const getZoneBadge = (zone) => {
    const config = {
      1: { label: "Zone 1", className: "bg-blue-100 text-blue-800" },
      2: { label: "Zone 2", className: "bg-purple-100 text-purple-800" },
      3: { label: "Zone 3", className: "bg-pink-100 text-pink-800" },
    };
    return config[zone] || { label: `Zone ${zone}`, className: "bg-gray-100 text-gray-800" };
  };

  const getReadStatusBadge = (canReadStatus) => {
    const config = {
      can_read: { label: "Read", className: "bg-green-100 text-green-800", icon: Eye },
      cannot_read: { label: "Unable to Read", className: "bg-red-100 text-red-800", icon: AlertCircle }
    };
    return config[canReadStatus] || { label: "Unknown", className: "bg-gray-100 text-gray-800", icon: AlertCircle };
  };

  // Filter readings by zone and search term
  const filteredReadings = readings.filter((reading) => {
    const matchesZone = zoneFilter === "all" || reading.zone === parseInt(zoneFilter);
    const residentName = reading.full_name || "";
    const matchesSearch =
      residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reading.meter_number?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesZone && matchesSearch;
  });

  // Calculate zone statistics for reading history
  const zoneStats = {};
  readings.forEach((reading) => {
    const zone = reading.zone || "Unknown";
    if (!zoneStats[zone]) {
      zoneStats[zone] = {
        totalReadings: 0,
        totalConsumption: 0,
      };
    }
    zoneStats[zone].totalReadings += 1;
    zoneStats[zone].totalConsumption += reading.calculated || 0;
  });

  const totalRevenue = enrichedBills.filter(b => b.status === "paid").reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const pendingAmount = enrichedBills.filter(b => b.status === "pending").reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const overdueAmount = enrichedBills.filter(b => b.status === "overdue").reduce((sum, b) => sum + (b.total_amount || 0), 0);

  const stats = [
    {
      title: "Total Revenue",
      value: `₱${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pending Bills",
      value: `₱${pendingAmount.toLocaleString()}`,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Overdue Amount",
      value: `₱${overdueAmount.toLocaleString()}`,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Total Bills",
      value: bills.length,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  // if (isLoading) {
  //   return (
  //     <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
  //       <Sidebar />
  //       <div className="flex-1 flex flex-col overflow-hidden relative">
  //         <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
  //         <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
  //         <TopHeader />
  //         <main className="flex-1 overflow-auto p-6 relative z-10">
  //           <div className="max-w-7xl mx-auto">
  //             <Skeleton className="h-8 w-64 mb-4" />
  //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  //               {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
  //             </div>
  //             <Skeleton className="h-96" />
  //           </div>
  //         </main>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TopHeader />
        
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-billing-title">
                      Billing & Payments
                    </h1>
                    <p className="text-gray-600">Manage water bills and payment records</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  {activeTab === "billing" && (
                    <Button data-testid="button-generate-bill">
                      <Plus className="h-4 w-4 mr-2" />
                      Generate Bill
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveTab("billing");
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === "billing"
                    ? "border-orange-600 text-orange-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <FileText className="h-4 w-4" />
                Billing Records
              </button>
              <button
                onClick={() => {
                  setActiveTab("readings");
                  setSearchTerm("");
                  setZoneFilter("all");
                }}
                className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === "readings"
                    ? "border-green-600 text-green-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <History className="h-4 w-4" />
                Reading History
              </button>
            </div>

            {/* Billing Tab Content */}
            {activeTab === "billing" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {stats.map((stat, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                          </div>
                          <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {/* Reading History Tab Stats */}
            {activeTab === "readings" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[1, 2, 3].map((zone) => {
                    const stats = zoneStats[zone] || {
                      totalReadings: 0,
                      totalConsumption: 0,
                    };
                    return (
                      <Card key={zone}>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">
                                Zone {zone}
                              </p>
                              <p className="text-2xl font-bold text-gray-900">
                                {stats.totalReadings}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {stats.totalConsumption.toFixed(2)} m³ total
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
                              <TrendingUp className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </>
            )}

            {/* Filters - Billing Tab */}
            {activeTab === "billing" && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by resident, account, or bill ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-bills"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters - Reading History Tab */}
            {activeTab === "readings" && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by resident name or meter number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={zoneFilter} onValueChange={setZoneFilter}>
                      <SelectTrigger className="w-full md:w-48">
                        <SelectValue placeholder="Filter by zone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Zones</SelectItem>
                        <SelectItem value="1">Zone 1</SelectItem>
                        <SelectItem value="2">Zone 2</SelectItem>
                        <SelectItem value="3">Zone 3</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Billing Records Table */}
            {activeTab === "billing" && (
              <Card>
                <CardHeader>
                  <CardTitle>Billing Records ({filteredBills.length})</CardTitle>
                </CardHeader>
                <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Bill ID
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Resident
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Period
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Consumption
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Due Date
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBills.map((bill) => {
                        const statusConfig = getStatusBadge(bill.status);
                        const residentName = bill.full_name
                        const billingPeriod = bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A';
                        const dueDate = bill.due_date ? new Date(bill.due_date).toLocaleDateString() : 'N/A';
                        
                        return (
                          <tr key={bill._id} data-testid={`row-bill-${bill._id}`}>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">{bill.bill_id.slice(-6)}</td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{residentName}</p>
                                <p className="text-sm text-gray-500">{bill.meter_no || 'N/A'}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{billingPeriod}</td>
                            <td className="py-4 px-6 text-sm text-gray-900">{bill.calculated || 0} m³</td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              ₱{(bill.total_amount || 0).toFixed(2)}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{dueDate}</td>
                            <td className="py-4 px-6">
                              <Badge className={`${statusConfig.className} flex items-center w-fit`}>
                                <statusConfig.icon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" data-testid={`button-actions-${bill._id}`}>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Bill
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="h-4 w-4 mr-2" />
                                    Download PDF
                                  </DropdownMenuItem>
                                  {bill.status !== "paid" && (
                                    <DropdownMenuItem>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Mark as Paid
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredBills.length === 0 && (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-gray-500">
                            No billing records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            )}

            {/* Reading History Table */}
            {activeTab === "readings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Reading Records ({filteredReadings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Meter Number
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Resident Name
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Zone
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Previous Reading
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Present Reading
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Consumption (m³)
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Reading Date
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredReadings.map((reading) => {
                          const zoneBadge = getZoneBadge(reading.zone);
                          const readStatusBadge = getReadStatusBadge(reading.can_read_status);
                          const readingDate = reading.inclusive_date?.end
                            ? new Date(reading.inclusive_date.end).toLocaleDateString()
                            : reading.created_at
                            ? new Date(reading.created_at).toLocaleDateString()
                            : "N/A";

                          return (
                            <tr key={reading.reading_id}>
                              <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                {reading.meter_number || "N/A"}
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-900">
                                {reading.full_name || "Unknown"}
                              </td>
                              <td className="py-4 px-6">
                                <Badge
                                  className={`${zoneBadge.className} flex items-center w-fit`}
                                >
                                  {zoneBadge.label}
                                </Badge>
                              </td>
                              <td className="py-4 px-6">
                                <Badge
                                  className={`${readStatusBadge.className} flex items-center w-fit gap-1`}
                                >
                                  <readStatusBadge.icon className="h-3 w-3" />
                                  {readStatusBadge.label}
                                </Badge>
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-900">
                                {reading.can_read_status === 'cannot_read' ? 'N/A' : (reading.previous_reading ?? 0).toFixed(2)}
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-900">
                                {reading.can_read_status === 'cannot_read' ? 'N/A' : (reading.present_reading ?? 0).toFixed(2)}
                              </td>
                              <td className="py-4 px-6 text-sm font-medium text-gray-900">
                                {reading.can_read_status === 'cannot_read' ? 'N/A' : (reading.calculated ?? 0).toFixed(2)}
                              </td>
                              <td className="py-4 px-6 text-sm text-gray-500">
                                {readingDate}
                              </td>
                              <td className="py-4 px-6">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Eye className="h-4 w-4 mr-2" />
                                      {reading.can_read_status === 'cannot_read' ? 'View Remarks' : 'View Details'}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredReadings.length === 0 && (
                          <tr>
                            <td
                              colSpan="9"
                              className="p-8 text-center text-gray-500"
                            >
                              No reading records found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
