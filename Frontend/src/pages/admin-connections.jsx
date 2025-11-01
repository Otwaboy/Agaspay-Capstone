import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { connectionsApi } from "../services/adminApi";
import { useToast } from "../hooks/use-toast";

export default function AdminConnections() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['connections', statusFilter],
    queryFn: () => connectionsApi.getAll({ status: statusFilter !== 'all' ? statusFilter : undefined })
  });

  const connections = data?.connections || [];

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => connectionsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['connections']);
      toast({
        title: "Success",
        description: "Connection status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to update connection status",
        variant: "destructive",
      });
    }
  });

  const filteredConnections = connections.filter(conn => {
    const residentName = conn.resident_id ? 
      `${conn.resident_id.first_name} ${conn.resident_id.last_name}` : '';
    const matchesSearch = residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.account_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conn.meter_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const config = {
      active: { label: "Active", className: "bg-green-100 text-green-800", icon: CheckCircle },
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      disconnected: { label: "Disconnected", className: "bg-red-100 text-red-800", icon: XCircle },
      inactive: { label: "Inactive", className: "bg-gray-100 text-gray-800", icon: XCircle }
    };
    return config[status] || config.pending;
  };

  const handleStatusChange = (id, newStatus) => {
    if (confirm(`Are you sure you want to change this connection status to ${newStatus}?`)) {
      updateStatusMutation.mutate({ id, status: newStatus });
    }
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
      value: connections.filter(c => c.connection_status === "active").length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Pending",
      value: connections.filter(c => c.connection_status === "pending").length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Disconnected",
      value: connections.filter(c => c.connection_status === "disconnected").length,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
          <TopHeader />
          <main className="flex-1 overflow-auto p-6 relative z-10">
            <div className="max-w-7xl mx-auto">
              <Skeleton className="h-8 w-64 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
              <Skeleton className="h-96" />
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                          Install Date
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
                        const statusConfig = getStatusBadge(conn.connection_status);
                        const residentName = conn.resident_id ? 
                          `${conn.resident_id.first_name} ${conn.resident_id.last_name}` : 'N/A';
                        const installDate = conn.installation_date ? 
                          new Date(conn.installation_date).toLocaleDateString() : 'N/A';
                        
                        return (
                          <tr key={conn._id} data-testid={`row-connection-${conn._id}`}>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center mr-3">
                                  <Droplets className="h-5 w-5 text-cyan-600" />
                                </div>
                                <p className="text-sm font-medium text-gray-900">{residentName}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{conn.account_number || 'N/A'}</td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">{conn.meter_number || 'N/A'}</td>
                            <td className="py-4 px-6 text-sm text-gray-900">
                              {conn.resident_id?.zone || 'N/A'}, {conn.resident_id?.purok || 'N/A'}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{installDate}</td>
                            <td className="py-4 px-6">
                              <Badge className={`${statusConfig.className} flex items-center w-fit`}>
                                <statusConfig.icon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    data-testid={`button-actions-${conn._id}`}
                                    disabled={updateStatusMutation.isPending}
                                  >
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
                                  {conn.connection_status !== 'active' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusChange(conn._id, 'active')}
                                      className="text-green-600"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Activate
                                    </DropdownMenuItem>
                                  )}
                                  {conn.connection_status !== 'disconnected' && (
                                    <DropdownMenuItem 
                                      onClick={() => handleStatusChange(conn._id, 'disconnected')}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Disconnect
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredConnections.length === 0 && (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-gray-500">
                            No connections found
                          </td>
                        </tr>
                      )}
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
