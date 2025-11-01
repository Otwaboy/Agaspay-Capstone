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
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import {
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { incidentsApi } from "../services/adminApi";
import { useToast } from "../hooks/use-toast";

export default function AdminIncidents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['incidents', statusFilter],
    queryFn: () => incidentsApi.getAll({ status: statusFilter !== 'all' ? statusFilter : undefined })
  });

 const incidents = data?.reports || [];

  console.log('incidents', incidents);
  

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, resolution_notes }) => incidentsApi.updateStatus(id, status, resolution_notes),
    onSuccess: () => {
      queryClient.invalidateQueries(['incidents']);
      toast({
        title: "Success",
        description: "Incident status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.msg || "Failed to update incident status",
        variant: "destructive",
      });
    }
  });

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.reported_issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reporter_id?.first_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    const config = {
      open: { label: "Open", className: "bg-blue-100 text-blue-800", icon: Clock },
      "in-progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      "in progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-800", icon: Clock },
      resolved: { label: "Resolved", className: "bg-green-100 text-green-800", icon: CheckCircle },
      closed: { label: "Closed", className: "bg-gray-100 text-gray-800", icon: XCircle }
    };
    return config[status] || config.open;
  };

  const getPriorityBadge = (priority) => {
    const config = {
      high: { label: "High", className: "bg-red-100 text-red-800" },
      medium: { label: "Medium", className: "bg-yellow-100 text-yellow-800" },
      low: { label: "Low", className: "bg-blue-100 text-blue-800" }
    };
    return config[priority] || config.medium;
  };

  const handleStatusChange = (id, newStatus) => {
    const notes = newStatus === 'resolved' ? prompt("Enter resolution notes:") : '';
    if (newStatus === 'resolved' && !notes) return;
    
    updateStatusMutation.mutate({ id, status: newStatus, resolution_notes: notes });
  };

  const stats = [
    {
      title: "Total Incidents",
      value: incidents.length,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Open",
      value: incidents.filter(i => i.reported_issue_status === "open").length,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "In Progress",
      value: incidents.filter(i => i.reported_issue_status === "in progress").length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Resolved",
      value: incidents.filter(i => i.reported_issue_status === "resolved").length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-auto p-6">
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
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-incidents-title">
                      Incident Management
                    </h1>
                    <p className="text-gray-600">Track and resolve water service issues</p>
                  </div>
                </div>
                <Button data-testid="button-report-incident">
                  <Plus className="h-4 w-4 mr-2" />
                  Report Incident
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
                      placeholder="Search incidents..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-incidents"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
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
                <CardTitle>Incidents ({filteredIncidents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredIncidents.map((incident) => {
                    const statusConfig = getStatusBadge(incident.reported_issue_status);
                    const priorityConfig = getPriorityBadge(incident.priority || 'medium');
                    const reporterName = incident.reported_by || 'NA'
                    const reportedDate = incident.reported_at ?
                      new Date(incident.reported_date).toLocaleString() : 'N/A';
                    
                    return (
                      <div key={incident._id} className="p-4 border rounded-lg" data-testid={`incident-${incident._id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">{incident.type}</h4>
                              <Badge className={priorityConfig.className}>
                                {priorityConfig.label}
                              </Badge>
                              <Badge className={`${statusConfig.className} flex items-center`}>
                                <statusConfig.icon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{incident.description || 'No description'}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Reporter: {reporterName}</span>
                              <span>Location: {incident.location || 'N/A'}</span>
                              <span>{reportedDate}</span>
                            </div> 
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {incident.reported_issue_status !== 'resolved' && (
                              <Button 
                                size="sm" 
                                onClick={() => handleStatusChange(incident._id, 'resolved')}
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filteredIncidents.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No incidents found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
