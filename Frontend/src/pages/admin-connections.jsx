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
  Droplets,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

export default function AdminConnections() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data - replace with API call
  const connections = [
    {
      id: "CON-001",
      residentName: "Juan Dela Cruz",
      accountNumber: "WS-2024-001",
      meterNumber: "MTR-10245",
      zone: "Zone 1",
      purok: "Purok 3",
      status: "active",
      currentReading: 245,
      lastReading: 220,
      installDate: "2023-05-15"
    },
    {
      id: "CON-002",
      residentName: "Maria Santos",
      accountNumber: "WS-2024-002",
      meterNumber: "MTR-10246",
      zone: "Zone 2",
      purok: "Purok 5",
      status: "active",
      currentReading: 189,
      lastReading: 165,
      installDate: "2023-06-20"
    },
    {
      id: "CON-003",
      residentName: "Pedro Rodriguez",
      accountNumber: "WS-2024-003",
      meterNumber: "MTR-10247",
      zone: "Zone 1",
      purok: "Purok 2",
      status: "disconnected",
      currentReading: 320,
      lastReading: 320,
      installDate: "2023-03-10"
    },
    {
      id: "CON-004",
      residentName: "Ana Garcia",
      accountNumber: "WS-2024-004",
      meterNumber: "MTR-10248",
      zone: "Zone 3",
      purok: "Purok 7",
      status: "pending",
      currentReading: 0,
      lastReading: 0,
      installDate: "2024-01-15"
    }
  ];

  const filteredConnections = connections.filter(conn => {
    const matchesSearch = conn.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.meterNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || conn.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      active: { label: "Active", className: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      disconnected: { label: "Disconnected", className: "bg-red-100 text-red-800", icon: XCircle }
    };
    return config[status] || config.pending;
  };

  const stats = [
    {
      title: "Total Connections",
      value: connections.length,
      icon: Droplets,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50"
    },
    {
      title: "Active",
      value: connections.filter(c => c.status === "active").length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pending",
      value: connections.filter(c => c.status === "pending").length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Disconnected",
      value: connections.filter(c => c.status === "disconnected").length,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
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
                  <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                    <Droplets className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-connections-title">
                      Water Connections
                    </h1>
                    <p className="text-gray-600">Manage water service connections and meters</p>
                  </div>
                </div>
                <Button data-testid="button-add-connection">
                  <Plus className="h-4 w-4 mr-2" />
                  New Connection
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
                      placeholder="Search by resident, account, or meter number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-connections"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="disconnected">Disconnected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Connections Table */}
            <Card>
              <CardHeader>
                <CardTitle>Water Service Connections ({filteredConnections.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Resident
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Account Number
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Meter Number
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Location
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Current Reading
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
                      {filteredConnections.map((conn) => {
                        const statusConfig = getStatusBadge(conn.status);
                        const consumption = conn.currentReading - conn.lastReading;
                        return (
                          <tr key={conn.id} data-testid={`row-connection-${conn.id}`}>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center mr-3">
                                  <Droplets className="h-5 w-5 text-cyan-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">{conn.residentName}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{conn.accountNumber}</td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">{conn.meterNumber}</td>
                            <td className="py-4 px-6 text-sm text-gray-900">
                              {conn.zone}, {conn.purok}
                            </td>
                            <td className="py-4 px-6">
                              <div className="text-sm text-gray-900">
                                <span className="font-medium">{conn.currentReading} m³</span>
                                {consumption > 0 && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    (+{consumption} m³)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={`${statusConfig.className} flex items-center w-fit`}>
                                <statusConfig.icon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" data-testid={`button-actions-${conn.id}`}>
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
                                    Edit Connection
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Disconnect
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
