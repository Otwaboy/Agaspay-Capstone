import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  UserPlus,
  Calendar,
  FileText,
  ClipboardList,
  MessageSquare,
  Users
} from "lucide-react";

export default function SecretaryQuickActions() {
  
  const actions = [
    {
      icon: UserPlus,
      title: "Register Resident",
      description: "Add new resident record",
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => window.dispatchEvent(new Event("openResidentModal")),
      testId: "button-register-resident"
    },
    {
      icon: Calendar,
      title: "Schedule Appointment",
      description: "Book resident meetings",
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => window.dispatchEvent(new Event("openAppointmentModal")),
      testId: "button-schedule-appointment"
    },
    {
      icon: FileText,
      title: "Process Document",
      description: "Handle document requests",
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: () => console.log("Process documents"),
      testId: "button-process-document"
    },
    {
      icon: ClipboardList,
      title: "Review Applications",
      description: "Check pending requests",
      color: "bg-orange-500 hover:bg-orange-600",
      onClick: () => console.log("Review applications"),
      testId: "button-review-applications"
    },
    {
      icon: MessageSquare,
      title: "Send Announcement",
      description: "Notify residents",
      color: "bg-teal-500 hover:bg-teal-600",
      onClick: () => console.log("Send announcement"),
      testId: "button-send-announcement"
    },
    {
      icon: Users,
      title: "Manage Records",
      description: "Update resident data",
      color: "bg-indigo-500 hover:bg-indigo-600",
      onClick: () => console.log("Manage records"),
      testId: "button-manage-records"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Frequently used secretary tasks
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200 ${action.color} hover:text-white border-2`}
                onClick={action.onClick}
                data-testid={action.testId}
              >
                <IconComponent className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium text-sm leading-tight">{action.title}</p>
                  <p className="text-xs opacity-70 mt-1">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>

        {/* System Status */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">System Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Secretary Portal</span>
              <span className="text-green-600 font-medium">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Document System</span>
              <span className="text-green-600 font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Last Sync</span>
              <span className="text-blue-600">1 hour ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}