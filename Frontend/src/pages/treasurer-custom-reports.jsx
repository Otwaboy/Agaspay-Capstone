import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  Settings,
  BarChart3
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";

export default function TreasurerCustomReports() {
  const [reportConfig, setReportConfig] = useState({
    reportType: "financial",
    dateFrom: "",
    dateTo: "",
    includeRevenue: true,
    includeExpenses: true,
    includePayments: false,
    includeOutstanding: false,
    groupBy: "monthly",
    format: "pdf"
  });

  const [generatedReport, setGeneratedReport] = useState(null);

  const handleConfigChange = (field, value) => {
    setReportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerateReport = () => {
    // Mock report generation
    const mockReport = {
      title: `Custom ${reportConfig.reportType} Report`,
      period: `${reportConfig.dateFrom} to ${reportConfig.dateTo}`,
      summary: {
        totalRevenue: 245680,
        totalExpenses: 85200,
        totalPayments: 189420,
        outstandingBalance: 28350
      },
      generatedAt: new Date().toISOString()
    };
    setGeneratedReport(mockReport);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <TreasurerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TreasurerTopHeader />
        
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="text-custom-reports-title">
                    Custom Reports Generator
                  </h1>
                  <p className="text-gray-600">Create customized financial reports</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Report Configuration */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Settings className="h-5 w-5 mr-2" />
                      Report Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Report Type */}
                    <div className="space-y-2">
                      <Label htmlFor="report-type">Report Type</Label>
                      <Select 
                        value={reportConfig.reportType} 
                        onValueChange={(value) => handleConfigChange('reportType', value)}
                      >
                        <SelectTrigger id="report-type" data-testid="select-report-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="financial">Financial Summary</SelectItem>
                          <SelectItem value="revenue">Revenue Analysis</SelectItem>
                          <SelectItem value="expense">Expense Analysis</SelectItem>
                          <SelectItem value="collection">Collection Report</SelectItem>
                          <SelectItem value="outstanding">Outstanding Balances</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date-from">From Date</Label>
                        <Input
                          id="date-from"
                          type="date"
                          value={reportConfig.dateFrom}
                          onChange={(e) => handleConfigChange('dateFrom', e.target.value)}
                          data-testid="input-date-from"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date-to">To Date</Label>
                        <Input
                          id="date-to"
                          type="date"
                          value={reportConfig.dateTo}
                          onChange={(e) => handleConfigChange('dateTo', e.target.value)}
                          data-testid="input-date-to"
                        />
                      </div>
                    </div>

                    {/* Include Options */}
                    <div className="space-y-3">
                      <Label>Include in Report</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-revenue"
                            checked={reportConfig.includeRevenue}
                            onCheckedChange={(checked) => handleConfigChange('includeRevenue', checked)}
                            data-testid="checkbox-include-revenue"
                          />
                          <Label htmlFor="include-revenue" className="font-normal cursor-pointer">
                            Revenue Data
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-expenses"
                            checked={reportConfig.includeExpenses}
                            onCheckedChange={(checked) => handleConfigChange('includeExpenses', checked)}
                            data-testid="checkbox-include-expenses"
                          />
                          <Label htmlFor="include-expenses" className="font-normal cursor-pointer">
                            Expense Data
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-payments"
                            checked={reportConfig.includePayments}
                            onCheckedChange={(checked) => handleConfigChange('includePayments', checked)}
                            data-testid="checkbox-include-payments"
                          />
                          <Label htmlFor="include-payments" className="font-normal cursor-pointer">
                            Payment Transactions
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="include-outstanding"
                            checked={reportConfig.includeOutstanding}
                            onCheckedChange={(checked) => handleConfigChange('includeOutstanding', checked)}
                            data-testid="checkbox-include-outstanding"
                          />
                          <Label htmlFor="include-outstanding" className="font-normal cursor-pointer">
                            Outstanding Balances
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Group By */}
                    <div className="space-y-2">
                      <Label htmlFor="group-by">Group By</Label>
                      <Select 
                        value={reportConfig.groupBy} 
                        onValueChange={(value) => handleConfigChange('groupBy', value)}
                      >
                        <SelectTrigger id="group-by" data-testid="select-group-by">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Export Format */}
                    <div className="space-y-2">
                      <Label htmlFor="format">Export Format</Label>
                      <Select 
                        value={reportConfig.format} 
                        onValueChange={(value) => handleConfigChange('format', value)}
                      >
                        <SelectTrigger id="format" data-testid="select-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                          <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                          <SelectItem value="csv">CSV File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Generate Button */}
                    <Button 
                      onClick={handleGenerateReport} 
                      className="w-full"
                      data-testid="button-generate-report"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Report Preview */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Filter className="h-5 w-5 mr-2" />
                      Report Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedReport ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-700 font-medium mb-1">Report Title</p>
                          <p className="text-lg font-bold text-blue-900">
                            {generatedReport.title}
                          </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 font-medium mb-1">Period</p>
                          <p className="text-sm text-gray-900">
                            {generatedReport.period}
                          </p>
                        </div>

                        {reportConfig.includeRevenue && (
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-600">Total Revenue</p>
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency(generatedReport.summary.totalRevenue)}
                            </p>
                          </div>
                        )}

                        {reportConfig.includeExpenses && (
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-600">Total Expenses</p>
                            <p className="text-xl font-bold text-red-600">
                              {formatCurrency(generatedReport.summary.totalExpenses)}
                            </p>
                          </div>
                        )}

                        {reportConfig.includePayments && (
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-600">Total Payments</p>
                            <p className="text-xl font-bold text-blue-600">
                              {formatCurrency(generatedReport.summary.totalPayments)}
                            </p>
                          </div>
                        )}

                        {reportConfig.includeOutstanding && (
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-600">Outstanding</p>
                            <p className="text-xl font-bold text-orange-600">
                              {formatCurrency(generatedReport.summary.outstandingBalance)}
                            </p>
                          </div>
                        )}

                        <div className="pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-3">
                            Generated: {formatDate(generatedReport.generatedAt)}
                          </p>
                          <Button className="w-full" data-testid="button-download-report">
                            <Download className="h-4 w-4 mr-2" />
                            Download {reportConfig.format.toUpperCase()}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Configure and generate your custom report</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Saved Templates */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Saved Report Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Monthly Financial", type: "financial", saved: "Aug 15, 2024" },
                    { name: "Revenue Analysis Q3", type: "revenue", saved: "Aug 10, 2024" },
                    { name: "Collection Summary", type: "collection", saved: "Aug 5, 2024" }
                  ].map((template, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{template.name}</p>
                          <p className="text-sm text-gray-500 mt-1">{template.type}</p>
                          <p className="text-xs text-gray-400 mt-2">Saved: {template.saved}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Load
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
