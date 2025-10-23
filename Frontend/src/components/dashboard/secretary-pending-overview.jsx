import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Wrench,
  Droplets,
  AlertCircle,
  FileWarning
} from "lucide-react";

export default function SecretaryPendingOverview() {
  const pendingReports = [
    {
      id: 1,
      type: "incident",
      title: "Water Pipe Burst Incident",
      reportedBy: "Maria Santos",
      priority: "urgent",
      deadline: "Today, 3:00 PM",
      location: "Purok 3, Main Street",
      icon: AlertTriangle,
      testId: "pending-report-1"
    },
    {
      id: 2,
      type: "maintenance",
      title: "Pump Station Maintenance Request",
      reportedBy: "Juan Dela Cruz",
      priority: "high",
      deadline: "Due in 2 hours",
      location: "Water Pump Station A",
      icon: Wrench,
      testId: "pending-report-2"
    },
    {
      id: 3,
      type: "complaint",
      title: "Low Water Pressure Complaint",
      reportedBy: "Pedro Garcia",
      priority: "normal",
      deadline: "Tomorrow, 10:00 AM",
      location: "Purok 5, Oak Avenue",
      icon: Droplets,
      testId: "pending-report-3"
    },
    {
      id: 4,
      type: "incident",
      title: "Illegal Water Connection Report",
      reportedBy: "Ana Reyes",
      priority: "high",
      deadline: "Dec 28, 2024",
      location: "Purok 7, Pine Road",
      icon: FileWarning,
      testId: "pending-report-4"
    },
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "normal":
        return "secondary";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Pending Reports
            </CardTitle>
            <CardDescription>Incident and maintenance reports to review</CardDescription>
          </div>
          <Badge variant="outline" className="text-orange-600 border-orange-300">
            {pendingReports.length} Pending
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {pendingReports.map((report) => {
            const IconComponent = report.icon;
            return (
              <div
                key={report.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                data-testid={report.testId}
              >
                <div className="mt-1">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IconComponent className="h-4 w-4 text-blue-600" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 leading-tight">
                      {report.title}
                    </h4>
                    <Badge
                      variant={getPriorityColor(report.priority)}
                      className="text-xs shrink-0"
                      data-testid={`badge-priority-${report.id}`}
                    >
                      {report.priority}
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-1">
                    Reported by: {report.reportedBy}
                  </p>
                  
                  <p className="text-xs text-gray-500 mt-1">
                    📍 {report.location}
                  </p>
                  
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className="text-xs text-gray-500">
                      {report.deadline}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 h-8 w-8 p-0"
                  data-testid={`button-view-${report.id}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-medium">8 reports resolved today</span>
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-blue-600 p-0 h-auto"
              data-testid="button-view-all-reports"
            >
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}