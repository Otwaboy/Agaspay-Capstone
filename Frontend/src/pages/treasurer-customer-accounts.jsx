import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Users,
  Search,
  Eye,
  Mail,
  Phone,
  MapPin,
  PhilippinePesoIcon,
  Calendar
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";

export default function TreasurerCustomerAccounts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/customer-accounts', filterStatus],
    staleTime: 2 * 60 * 1000,
  });

  const mockAccounts = [
    { 
      id: "ACC-12345",
      name: "Juan Dela Cruz",
      email: "juan.delacruz@email.com",
      phone: "+63 912 345 6789",
      address: "Purok 1, Biking, Dauis",
      accountType: "Residential",
      status: "active",
      balance: 0,
      lastPayment: "2024-08-15",
      joinDate: "2023-01-15"
    },
    {
      id: "ACC-12346",
      name: "Maria Santos",
      email: "maria.santos@email.com",
      phone: "+63 923 456 7890",
      address: "Purok 2, Biking, Dauis",
      accountType: "Residential",
      status: "active",
      balance: 320,
      lastPayment: "2024-07-20",
      joinDate: "2022-06-10"
    },
    {
      id: "ACC-12347",
      name: "Pedro Reyes",
      email: "pedro.reyes@email.com",
      phone: "+63 934 567 8901",
      address: "Purok 3, Biking, Dauis",
      accountType: "Commercial",
      status: "active",
      balance: 890,
      lastPayment: "2024-07-15",
      joinDate: "2021-03-22"
    },
    {
      id: "ACC-12348",
      name: "Ana Garcia",
      email: "ana.garcia@email.com",
      phone: "+63 945 678 9012",
      address: "Purok 2, Biking, Dauis",
      accountType: "Residential",
      status: "suspended",
      balance: 1350,
      lastPayment: "2024-05-10",
      joinDate: "2022-09-05"
    },
    {
      id: "ACC-12349",
      name: "Roberto Luna",
      email: "roberto.luna@email.com",
      phone: "+63 956 789 0123",
      address: "Purok 4, Biking, Dauis",
      accountType: "Residential",
      status: "active",
      balance: 0,
      lastPayment: "2024-08-18",
      joinDate: "2023-11-12"
    }
  ];

  const accountData = accounts || mockAccounts;

  const filteredData = accountData.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || account.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalAccounts = filteredData.length;
  const activeAccounts = filteredData.filter(a => a.status === "active").length;
  const suspendedAccounts = filteredData.filter(a => a.status === "suspended").length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "active":
        return {
          label: "Active",
          className: "bg-green-100 text-green-800"
        };
      case "suspended":
        return {
          label: "Suspended",
          className: "bg-red-100 text-red-800"
        };
      case "inactive":
        return {
          label: "Inactive",
          className: "bg-gray-100 text-gray-800"
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800"
        };
    }
  };

  const getAccountTypeColor = (type) => {
    switch (type) {
      case "Residential":
        return "bg-blue-100 text-blue-800";
      case "Commercial":
        return "bg-purple-100 text-purple-800";
      case "Industrial":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
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
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="text-customer-accounts-title">
                    Customer Accounts
                  </h1>
                  <p className="text-gray-600">Manage customer accounts and billing information</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                      <p className="text-2xl font-bold text-gray-900" data-testid="text-total-accounts">
                        {totalAccounts}
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
                      <p className="text-sm font-medium text-gray-600">Active Accounts</p>
                      <p className="text-2xl font-bold text-green-600">
                        {activeAccounts}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Suspended Accounts</p>
                      <p className="text-2xl font-bold text-red-600">
                        {suspendedAccounts}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search by name, account number, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-account"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      onClick={() => setFilterStatus("all")}
                      data-testid="button-filter-all"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === "active" ? "default" : "outline"}
                      onClick={() => setFilterStatus("active")}
                      data-testid="button-filter-active"
                    >
                      Active
                    </Button>
                    <Button
                      variant={filterStatus === "suspended" ? "default" : "outline"}
                      onClick={() => setFilterStatus("suspended")}
                      data-testid="button-filter-suspended"
                    >
                      Suspended
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Accounts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredData.map((account) => {
                const statusConfig = getStatusConfig(account.status);
                return (
                  <Card key={account.id} data-testid={`account-card-${account.id}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{account.name}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{account.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getAccountTypeColor(account.accountType)}>
                            {account.accountType}
                          </Badge>
                          <Badge className={statusConfig.className}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-2">
                          <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="text-sm font-medium text-gray-900">{account.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="text-sm font-medium text-gray-900">{account.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="text-sm font-medium text-gray-900">{account.address}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2">
                            <PhilippinePesoIcon className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-600">Balance</p>
                              <p className={`text-sm font-bold ${account.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(account.balance)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-xs text-gray-600">Last Payment</p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(account.lastPayment)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            data-testid={`button-view-${account.id}`}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
