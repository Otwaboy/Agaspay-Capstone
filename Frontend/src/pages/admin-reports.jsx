import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Printer
} from "lucide-react";

export default function AdminReports() {
  const reportTypes = [
    {
      title: "Revenue Report",
      description: "Monthly and annual revenue analysis",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      action: "Generate"
    },
    {
      title: "Consumption Report",
      description: "Water usage statistics by zone",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      action: "Generate"
    },
    {
      title: "Billing Summary",
      description: "Billing status and collection rates",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      action: "Generate"
    },
    {
      title: "User Analytics",
      description: "Active users and connection trends",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      action: "Generate"
    },
    {
      title: "Payment Analysis",
      description: "Payment methods and transaction history",
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      action: "Generate"
    },
    {
      title: "Monthly Summary",
      description: "Complete monthly operations summary",
      icon: Calendar,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      action: "Generate"
    }
  ];

  const recentReports = [
    {
      name: "January 2024 Revenue Report",
      date: "2024-02-01",
      type: "Revenue",
      format: "PDF"
    },
    {
      name: "December 2023 Consumption Analysis",
      date: "2024-01-05",
      type: "Consumption",
      format: "Excel"
    },
    {
      name: "Q4 2023 User Analytics",
      date: "2024-01-10",
      type: "Analytics",
      format: "PDF"
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
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="text-reports-title">
                    Reports & Analytics
                  </h1>
                  <p className="text-gray-600">Generate and view system reports</p>
                </div>
              </div>
            </div>

            {/* Report Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {reportTypes.map((report, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 ${report.bgColor} rounded-lg flex items-center justify-center`}>
                        <report.icon className={`h-6 w-6 ${report.color}`} />
                      </div>
                    </div>
                    <CardTitle className="mt-4">{report.title}</CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button className="flex-1" data-testid={`button-generate-${report.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Download className="h-4 w-4 mr-2" />
                        {report.action}
                      </Button>
                      <Button variant="outline" size="icon">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Previously generated reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReports.map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{report.name}</p>
                          <p className="text-sm text-gray-500">{report.type} • {report.format} • {report.date}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
