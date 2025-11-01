import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { AlertTriangle, Plus, Search, MapPin, Calendar, User, Image } from "lucide-react";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import { apiClient } from "../lib/api";
import { useToast } from "../hooks/use-toast";
import { format } from "date-fns";

export default function MeterReaderIssues() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    issue_type: "",
    location: "",
    description: "",
    severity: "normal"
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const response = await apiClient.get("/auth/me");
      return response.data;
    }
  });

  const { data: issuesData, isLoading } = useQuery({
    queryKey: ["incident-reports"],
    queryFn: async () => {
      const response = await apiClient.get("/api/incident-reports");
      return response.data;
    }
  });

  const meterReaderZone = authUser?.user?.assigned_zone;
  const issues = issuesData?.incidents || [];

  const zoneIssues = issues.filter((issue) => issue.zone === meterReaderZone);

  const filteredIssues = zoneIssues.filter((issue) =>
    searchQuery
      ? issue.issue_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.location?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const reportIssueMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/api/incident-reports", {
        ...data,
        zone: meterReaderZone
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Issue reported successfully"
      });
      setFormData({
        issue_type: "",
        location: "",
        description: "",
        severity: "normal"
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["incident-reports"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to report issue",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    reportIssueMutation.mutate(formData);
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      high: "bg-red-500",
      normal: "bg-yellow-500",
      low: "bg-blue-500"
    };
    return <Badge className={styles[severity] || "bg-gray-500"}>{severity}</Badge>;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-500",
      in_progress: "bg-blue-500",
      resolved: "bg-green-500",
      closed: "bg-gray-500"
    };
    return <Badge className={styles[status] || "bg-gray-500"}>{status}</Badge>;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <MeterReaderSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <MeterReaderTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Issue Reports</h1>
                <p className="text-gray-600 mt-2">Field issues & maintenance reports</p>
              </div>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>

            <div className="space-y-4">
            {showForm && (
              <Card className="shadow-md border-green-200 border-2">
                <CardHeader className="bg-green-50">
                  <CardTitle>Report New Issue</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Issue Type</Label>
                        <Select
                          value={formData.issue_type}
                          onValueChange={(value) => setFormData({ ...formData, issue_type: value })}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meter_damage">Meter Damage</SelectItem>
                            <SelectItem value="leak">Water Leak</SelectItem>
                            <SelectItem value="no_access">No Access</SelectItem>
                            <SelectItem value="illegal_connection">Illegal Connection</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Severity</Label>
                        <Select
                          value={formData.severity}
                          onValueChange={(value) => setFormData({ ...formData, severity: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Enter location (e.g., Purok 3, House #45)"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the issue in detail..."
                        className="min-h-[100px]"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={reportIssueMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {reportIssueMutation.isPending ? "Submitting..." : "Submit Report"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search issues..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
            </Card>

            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Loading issues...</p>
                </CardContent>
              </Card>
            ) : filteredIssues.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No issues reported</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <Card key={issue._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 flex-wrap gap-2 mb-2">
                              <h3 className="font-semibold text-lg capitalize">{issue.issue_type?.replace("_", " ")}</h3>
                              {getSeverityBadge(issue.severity)}
                              {getStatusBadge(issue.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{issue.location}</span>
                          </div>
                          {issue.zone && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>Zone {issue.zone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(issue.createdAt), "MMM dd, yyyy")}</span>
                          </div>
                        </div>

                        {issue.reported_by && (
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            <span>Reported by: {issue.reported_by.username}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
