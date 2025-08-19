import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  UserPlus,
  Calendar,
  FileText,
  Settings,
  Bell,
  Users
} from "lucide-react";

export default function QuickActions() {
  
  const actions = [
    {
      icon: UserPlus,
      title: "Add Personnel",
      description: "Create new staff account",
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => window.dispatchEvent(new Event("openPersonnelModal")),
      testId: "button-add-personnel"
    },
    {
      icon: Calendar,
      title: "Schedule Task",
      description: "Plan maintenance work",
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => window.dispatchEvent(new Event("openTaskModal")),
      testId: "button-schedule-task"
    },
    {
      icon: Users,
      title: "Manage Residents",
      description: "View resident accounts",
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: () => console.log("Navigate to residents"),
      testId: "button-manage-residents"
    },
    {
      icon: FileText,
      title: "Generate Report",
      description: "Create billing reports",
      color: "bg-orange-500 hover:bg-orange-600",
      onClick: () => console.log("Generate reports"),
      testId: "button-generate-report"
    },
    {
      icon: Bell,
      title: "Send Announcement",
      description: "Notify all residents",
      color: "bg-teal-500 hover:bg-teal-600",
      onClick: () => console.log("Send announcement"),
      testId: "button-send-announcement"
    },
    {
      icon: Settings,
      title: "System Settings",
      description: "Configure system",
      color: "bg-gray-500 hover:bg-gray-600",
      onClick: () => console.log("Open settings"),
      testId: "button-system-settings"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Frequently used administrative tasks
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
                className={`cursor-pointer h-20 flex-col text-white border-0 ${action.color} hover:scale-105 transition-all duration-200`}
                onClick={action.onClick}
                data-testid={action.testId}
              >
                <IconComponent className="h-6 w-6 mb-2" />
                <span className="text-xs font-medium text-center">
                  {action.title}
                </span>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">System Status</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Server Status</span>
              <span className="text-green-600 font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Database</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Last Backup</span>
              <span className="text-blue-600">2 hours ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}