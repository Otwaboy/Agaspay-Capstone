import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import { AlertTriangle, MapPin, Camera, Send } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import apiClient from "../lib/api";

export default function ResidentReportIssue() {

  const [formData, setFormData] = useState({
    type: "",
    location: "",
    description: "",
    urgency_level: "", 
  });


  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type || !formData.location || !formData.description || !formData.urgency_level) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.createIncidentReport(formData);
      toast({
        title: "Issue Reported",
        description:
          "Your issue has been reported successfully. We'll investigate and respond soon.",
      });

      setFormData({
        type: "",
        location: "",
        description: "",
        urgency_level: "",
      });
    } catch (error) {
      toast({
        title: "Failed to Report Issue",
        description:
          error?.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
              <p className="text-gray-600 mt-2">Report water service issues in your area</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Card */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                      Issue Report Form
                    </CardTitle>
                    <CardDescription>Provide details about the issue you're experiencing</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label>Issue Category *</Label>
                        <Select
                          value={formData.type}
                          onValueChange={(value) => setFormData({ ...formData, type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="No Water Supply">No Water Supply</SelectItem>
                            <SelectItem value="Low Water Pressure">Low Water Pressure</SelectItem>
                            <SelectItem value="Pipe Leak">Pipe Leak</SelectItem>
                            <SelectItem value="Water Quality Issue">Water Quality Issue</SelectItem>
                            <SelectItem value="Meter Problem">Meter Problem</SelectItem>
                            <SelectItem value="Damaged Infrastructure">Damaged Infrastructure</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Urgencly Level</Label>
                        <Select
                          value={formData.urgency_level}
                          onValueChange={(value) => setFormData({ ...formData, urgency_level: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select urgency level" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low - Minor inconvenience</SelectItem>
                            <SelectItem value="medium">Medium - Moderate impact</SelectItem>
                            <SelectItem value="high">High - Urgent attention needed</SelectItem>
                            <SelectItem value="critical">Critical - Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Location *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="e.g., Purok 3, Zone 1"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Issue Description *</Label>
                        <Textarea
                          placeholder="Describe the issue in detail..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={6}
                        />
                        <p className="text-xs text-gray-500">
                          Include relevant details like when the issue started, how often it occurs, and any other observations
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Attach Photo (Optional)</Label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                          <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload photo</p>
                          <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="submit"
                          className="flex-1 bg-orange-600 hover:bg-orange-700"
                          disabled={isLoading}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isLoading ? "Submitting..." : "Submit Report"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setFormData({ category: "", location: "", description: "", severity: "medium" })
                          }
                          disabled={isLoading}
                        >
                          Clear
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side Cards */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Emergency Contacts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900">Emergency Hotline</p>
                      <p className="text-lg font-bold text-red-600">123-4567</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Barangay Office</p>
                      <p className="text-lg font-bold text-blue-600">123-8910</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Reporting Guidelines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Be specific about the issue location</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Include date and time of occurrence</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>Attach photos if possible</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>For emergencies, call hotline directly</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Common Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• No water supply</li>
                      <li>• Low water pressure</li>
                      <li>• Pipe leaks</li>
                      <li>• Discolored water</li>
                      <li>• Meter malfunction</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
