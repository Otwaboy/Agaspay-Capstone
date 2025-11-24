import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { 
  Gauge, 
  Navigation, 
  Plus, 
  AlertTriangle, 
  Map, 
  ClipboardCheck, 
  Route,
  FileText
} from "lucide-react";

import RecordMeterReadingModal from "../modals/meter-reading-modal";

export default function MeterReaderQuickActions() {
  const [showReadingModal, setShowReadingModal] = useState(false);

  const handleAction = (action) => {
    if (action === "record-reading") {
      setShowReadingModal(true);
      return;
    }
    console.log(`Executing action: ${action}`);
    // Add your other action handlers here
  };

  const quickActions = [
    {
      title: "Record Reading",
      description: "Input new meter reading measurement",
      icon: Gauge,
      color: "bg-blue-50 text-blue-600 hover:bg-blue-100",
      action: "record-reading",
      testId: "button-record-reading"
    },
    {
      title: "Navigate to Next",
      description: "Get directions to next meter location",
      icon: Navigation,
      color: "bg-green-50 text-green-600 hover:bg-green-100",
      action: "navigate-next",
      testId: "button-navigate-next"
    },
    {
      title: "Report Issue",
      description: "Report meter or access problems",
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600 hover:bg-red-100",
      action: "report-issue",
      testId: "button-report-issue"
    },
    {
      title: "View Route Map",
      description: "See today's route on interactive map",
      icon: Map,
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
      action: "view-route-map",
      testId: "button-view-route-map"
    },
    {
      title: "Bulk Entry",
      description: "Enter multiple readings at once",
      icon: Plus,
      color: "bg-orange-50 text-orange-600 hover:bg-orange-100",
      action: "bulk-entry",
      testId: "button-bulk-entry"
    },
    {
      title: "Daily Summary",
      description: "Review today's progress and readings",
      icon: ClipboardCheck,
      color: "bg-teal-50 text-teal-600 hover:bg-teal-100",
      action: "daily-summary",
      testId: "button-daily-summary"
    },
    {
      title: "Optimize Route",
      description: "Get optimized path for remaining readings",
      icon: Route,
      color: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100",
      action: "optimize-route",
      testId: "button-optimize-route"
    },
    {
      title: "Submit Report",
      description: "Submit daily reading report to office",
      icon: FileText,
      color: "bg-gray-50 text-gray-600 hover:bg-gray-100",
      action: "submit-report",
      testId: "button-submit-report"
    }
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.action}
                  variant="ghost"
                  className={`justify-start h-auto p-4 ${action.color} transition-colors`}
                  onClick={() => handleAction(action.action)}
                  data-testid={action.testId}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs opacity-75 mt-1">{action.description}</div>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Record Meter Reading Modal */}
      <RecordMeterReadingModal 
        open={showReadingModal} 
        onClose={() => setShowReadingModal(false)} 
      />
    </>
  );
}