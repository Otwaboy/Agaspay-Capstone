import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
  Printer,
  Loader2
} from "lucide-react";
import { apiClient } from "../lib/api";
import { toast } from "sonner";

export default function AdminReports() {
  const [generatingReport, setGeneratingReport] = useState(null);

  const generateReportMutation = useMutation({
    mutationFn: async ({ type, params }) => {
      setGeneratingReport(type);
      let response;
      switch (type) {
        case 'revenue':
          response = await apiClient.generateRevenueReport(params);
          break;
        case 'consumption':
          response = await apiClient.generateConsumptionReport(params);
          break;
        case 'billing':
          response = await apiClient.generateBillingReport(params);
          break;
        case 'users':
          response = await apiClient.generateUsersReport(params);
          break;
        case 'incidents':
          response = await apiClient.generateIncidentsReport(params);
          break;
        default:
          throw new Error('Unknown report type');
      }
      return response;
    },
    onSuccess: (data, variables) => {
      toast.success("Report Generated", { description: "" });
      
      if (data && typeof data === 'object') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${variables.type}-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
      
      setGeneratingReport(null);
    },
    onError: (error, variables) => {
      toast.error("Error", { description: "" });
      setGeneratingReport(null);
    }
  });

  const reportTypes = [
    {
      title: "Revenue Report",
      description: "Monthly and annual revenue analysis",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      type: "revenue"
    },
    {
      title: "Consumption Report",
      description: "Water usage statistics by zone",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      type: "consumption"
    },
    {
      title: "Billing Summary",
      description: "Billing status and collection rates",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      type: "billing"
    },
    {
      title: "User Analytics",
      description: "Active users and connection trends",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      type: "users"
    },
    {
      title: "Incident Report",
      description: "Service incidents and resolution statistics",
      icon: BarChart3,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      type: "incidents"
    },
    {
      title: "Monthly Summary",
      description: "Complete monthly operations summary",
      icon: Calendar,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      type: "billing"
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

  const handleGenerateReport = (type) => {
    generateReportMutation.mutate({ 
      type, 
      params: {} 
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TopHeader />
        
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {reportTypes.map((report, index) => {
                const isGenerating = generatingReport === report.type;
                return (
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
                        <Button 
                          className="flex-1" 
                          data-testid={`button-generate-${report.title.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => handleGenerateReport(report.type)}
                          disabled={isGenerating || generateReportMutation.isPending}
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="icon">
                          <Printer className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

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
                  {recentReports.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No recent reports
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
