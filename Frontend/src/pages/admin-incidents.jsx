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

export default function AdminIncidents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const incidents = [
    {
      id: "INC-001",
      title: "Water Leak in Zone 2",
      reporter: "Maria Santos",
      location: "Zone 2, Purok 5",
      priority: "high",
      status: "in-progress",
      reportedDate: "2024-01-20 08:30 AM",
      description: "Major water leak near the main pipeline"
    },
    {
      id: "INC-002",
      title: "Low Water Pressure",
      reporter: "Juan Dela Cruz",
      location: "Zone 1, Purok 3",
      priority: "medium",
      status: "open",
      reportedDate: "2024-01-20 10:15 AM",
      description: "Residents experiencing low water pressure"
    },
    {
      id: "INC-003",
      title: "Meter Malfunction",
      reporter: "Pedro Rodriguez",
      location: "Zone 3, Purok 7",
      priority: "low",
      status: "resolved",
      reportedDate: "2024-01-19 02:00 PM",
      description: "Water meter not recording accurate readings"
    },
    {
      id: "INC-004",
      title: "Pipeline Damage",
      reporter: "Ana Garcia",
      location: "Zone 2, Purok 4",
      priority: "high",
      status: "open",
      reportedDate: "2024-01-21 09:00 AM",
      description: "Damaged pipeline causing water interruption"
    }
  ];

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || incident.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      open: { label: "Open", className: "bg-blue-100 text-blue-800", icon: Clock },
      "in-progress": { label: "In Progress", className: "bg-yellow-100 text-yellow-800", icon: Clock },
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
      value: incidents.filter(i => i.status === "open").length,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "In Progress",
      value: incidents.filter(i => i.status === "in-progress").length,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Resolved",
      value: incidents.filter(i => i.status === "resolved").length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
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
                      <SelectItem value="in-progress">In Progress</SelectItem>
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

            {/* Incidents List */}
            <Card>
              <CardHeader>
                <CardTitle>Incidents ({filteredIncidents.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredIncidents.map((incident) => {
                    const statusConfig = getStatusBadge(incident.status);
                    const priorityConfig = getPriorityBadge(incident.priority);
                    return (
                      <div key={incident.id} className="p-4 border rounded-lg" data-testid={`incident-${incident.id}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-sm font-medium text-gray-900">{incident.title}</h4>
                              <Badge className={priorityConfig.className}>
                                {priorityConfig.label}
                              </Badge>
                              <Badge className={`${statusConfig.className} flex items-center`}>
                                <statusConfig.icon className="w-3 h-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{incident.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Reporter: {incident.reporter}</span>
                              <span>Location: {incident.location}</span>
                              <span>{incident.reportedDate}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
