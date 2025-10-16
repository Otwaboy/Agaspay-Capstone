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

export default function ResidentReportIssue() {
  const [formData, setFormData] = useState({
    category: "",
    location: "",
    description: "",
    severity: "medium"
  });
  const { toast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.category || !formData.location || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Issue Reported",
      description: "Your issue has been reported successfully. We'll investigate and respond soon.",
    });

    setFormData({
      category: "",
      location: "",
      description: "",
      severity: "medium"
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-report-issue-title">
                Report an Issue
              </h1>
              <p className="text-gray-600 mt-2">
                Report water service issues in your area
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                      Issue Report Form
                    </CardTitle>
                    <CardDescription>
                      Provide details about the issue you're experiencing
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="category">Issue Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                          <SelectTrigger id="category" data-testid="select-category">
                            <SelectValue placeholder="Select issue category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-water">No Water Supply</SelectItem>
                            <SelectItem value="low-pressure">Low Water Pressure</SelectItem>
                            <SelectItem value="pipe-leak">Pipe Leak</SelectItem>
                            <SelectItem value="water-quality">Water Quality Issue</SelectItem>
                            <SelectItem value="meter-issue">Meter Problem</SelectItem>
                            <SelectItem value="damaged-infrastructure">Damaged Infrastructure</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="severity">Severity Level</Label>
                        <Select value={formData.severity} onValueChange={(value) => setFormData({...formData, severity: value})}>
                          <SelectTrigger id="severity" data-testid="select-severity">
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
                        <Label htmlFor="location">Location *</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="location"
                            placeholder="e.g., Purok 3, Zone 1"
                            value={formData.location}
                            onChange={(e) => setFormData({...formData, location: e.target.value})}
                            className="pl-10"
                            data-testid="input-location"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Issue Description *</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe the issue in detail..."
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          rows={6}
                          data-testid="textarea-description"
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
                          data-testid="button-submit-issue"
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit Report
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setFormData({ category: "", location: "", description: "", severity: "medium" })}
                        >
                          Clear
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>

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
