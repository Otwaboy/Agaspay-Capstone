import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
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
  DollarSign
} from "lucide-react";

export default function AdminBilling() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data - replace with API call
  const bills = [
    {
      id: "BILL-001",
      residentName: "Juan Dela Cruz",
      accountNumber: "WS-2024-001",
      period: "January 2024",
      consumption: 25,
      amount: 450.00,
      dueDate: "2024-02-05",
      status: "paid",
      paidDate: "2024-01-28"
    },
    {
      id: "BILL-002",
      residentName: "Maria Santos",
      accountNumber: "WS-2024-002",
      period: "January 2024",
      consumption: 18,
      amount: 320.00,
      dueDate: "2024-02-05",
      status: "pending",
      paidDate: null
    },
    {
      id: "BILL-003",
      residentName: "Pedro Rodriguez",
      accountNumber: "WS-2024-003",
      period: "January 2024",
      consumption: 42,
      amount: 890.00,
      dueDate: "2024-01-20",
      status: "overdue",
      paidDate: null
    },
    {
      id: "BILL-004",
      residentName: "Ana Garcia",
      accountNumber: "WS-2024-004",
      period: "January 2024",
      consumption: 15,
      amount: 275.00,
      dueDate: "2024-02-05",
      status: "paid",
      paidDate: "2024-01-25"
    }
  ];

  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.id.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const totalRevenue = bills.filter(b => b.status === "paid").reduce((sum, b) => sum + b.amount, 0);
  const pendingAmount = bills.filter(b => b.status === "pending").reduce((sum, b) => sum + b.amount, 0);
  const overdueAmount = bills.filter(b => b.status === "overdue").reduce((sum, b) => sum + b.amount, 0);

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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
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
                  <Button data-testid="button-generate-bill">
                    <Plus className="h-4 w-4 mr-2" />
                    Generate Bill
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
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

            {/* Filters and Search */}
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

            {/* Bills Table */}
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
                        return (
                          <tr key={bill.id} data-testid={`row-bill-${bill.id}`}>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">{bill.id}</td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{bill.residentName}</p>
                                <p className="text-sm text-gray-500">{bill.accountNumber}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{bill.period}</td>
                            <td className="py-4 px-6 text-sm text-gray-900">{bill.consumption} m³</td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              ₱{bill.amount.toFixed(2)}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{bill.dueDate}</td>
                            <td className="py-4 px-6">
                              <Badge className={`${statusConfig.className} flex items-center w-fit`}>
                                <statusConfig.icon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" data-testid={`button-actions-${bill.id}`}>
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
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
