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
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX
} from "lucide-react";

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data - replace with API call
  const users = [
    {
      id: "USR-001",
      name: "Juan Dela Cruz",
      email: "juan.delacruz..email.com",
      accountNumber: "WS-2024-001",
      zone: "Zone 1",
      purok: "Purok 3",
      status: "active",
      balance: 450.00,
      lastPayment: "2024-01-15"
    },
    {
      id: "USR-002",
      name: "Maria Santos",
      email: "maria.santos..email.com",
      accountNumber: "WS-2024-002",
      zone: "Zone 2",
      purok: "Purok 5",
      status: "active",
      balance: 0,
      lastPayment: "2024-01-16"
    },
    {
      id: "USR-003",
      name: "Pedro Rodriguez",
      email: "pedro.rodriguez..email.com",
      accountNumber: "WS-2024-003",
      zone: "Zone 1",
      purok: "Purok 2",
      status: "suspended",
      balance: 1200.00,
      lastPayment: "2023-12-10"
    },
    {
      id: "USR-004",
      name: "Ana Garcia",
      email: "ana.garcia..email.com",
      accountNumber: "WS-2024-004",
      zone: "Zone 3",
      purok: "Purok 7",
      status: "active",
      balance: 320.00,
      lastPayment: "2024-01-14"
    }
  ];

  

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.accountNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      active: { label: "Active", className: "bg-green-100 text-green-800" },
      suspended: { label: "Suspended", className: "bg-red-100 text-red-800" },
      inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800" }
    };
    return config[status] || config.inactive;
  };

  const stats = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Users",
      value: users.filter(u => u.status === "active").length,
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Suspended",
      value: users.filter(u => u.status === "suspended").length,
      icon: UserX,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Total Balance",
      value: `₱${users.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}`,
      icon: Users,
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
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-users-title">
                      User Management
                    </h1>
                    <p className="text-gray-600">Manage resident accounts and water connections</p>
                  </div>
                </div>
                <Button data-testid="button-add-user">
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
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
                      placeholder="Search by name, email, or account number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-users"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>Resident Accounts ({filteredUsers.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          User Info
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Account Number
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Location
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Balance
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Last Payment
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => {
                        const statusConfig = getStatusBadge(user.status);
                        return (
                          <tr key={user.id} data-testid={`row-user-${user.id}`}>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-blue-600 font-medium">
                                    {user.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{user.accountNumber}</td>
                            <td className="py-4 px-6 text-sm text-gray-900">
                              {user.zone}, {user.purok}
                            </td>
                            <td className="py-4 px-6">
                              <span className={`text-sm font-medium ${user.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ₱{user.balance.toFixed(2)}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={statusConfig.className}>
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{user.lastPayment}</td>
                            <td className="py-4 px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" data-testid={`button-actions-${user.id}`}>
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
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
