import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
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
  TrendingUp,
  DollarSign,
  Users,
  Receipt
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";

export default function TreasurerMonthlyReports() {
  const [selectedMonth, setSelectedMonth] = useState("august");
  const [selectedYear, setSelectedYear] = useState("2024");

  const { data: monthlyReport, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/monthly-report', selectedMonth, selectedYear],
    staleTime: 5 * 60 * 1000,
  });

  const mockReport = {
    period: "August 2024",
    summary: {
      totalRevenue: 245680,
      totalExpenses: 85200,
      netIncome: 160480,
      activeAccounts: 1247,
      billsGenerated: 1198,
      paymentsReceived: 892,
      collectionRate: 94.2
    },
    revenueBreakdown: {
      monthlyBills: 189420,
      connectionFees: 32150,
      reconnectionFees: 15680,
      penaltyFees: 8430
    },
    expenseBreakdown: {
      operations: 45200,
      maintenance: 22150,
      utilities: 12850,
      administrative: 5000
    },
    paymentMethods: [
      { method: "GCash", count: 412, amount: 98450 },
      { method: "Cash", count: 298, amount: 67230 },
      { method: "Bank Transfer", count: 125, amount: 45890 },
      { method: "PayMongo", count: 57, amount: 27350 }
    ]
  };

  const report = monthlyReport || mockReport;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const months = [
    { value: "january", label: "January" },
    { value: "february", label: "February" },
    { value: "march", label: "March" },
    { value: "april", label: "April" },
    { value: "may", label: "May" },
    { value: "june", label: "June" },
    { value: "july", label: "July" },
    { value: "august", label: "August" },
    { value: "september", label: "September" },
    { value: "october", label: "October" },
    { value: "november", label: "November" },
    { value: "december", label: "December" }
  ];

  const years = ["2024", "2023", "2022"];

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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-monthly-reports-title">
                      Monthly Financial Reports
                    </h1>
                    <p className="text-gray-600">Detailed monthly financial performance</p>
                  </div>
                </div>
                <Button data-testid="button-download-monthly-report">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Period Selector */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Select Period:</span>
                  </div>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-40" data-testid="select-month">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32" data-testid="select-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-monthly-revenue">
                    {formatCurrency(report.summary.totalRevenue)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <Receipt className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(report.summary.totalExpenses)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Net Income</p>
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(report.summary.netIncome)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {report.summary.collectionRate}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue & Expense Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Monthly Bills</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(report.revenueBreakdown.monthlyBills)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Connection Fees</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(report.revenueBreakdown.connectionFees)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Reconnection Fees</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(report.revenueBreakdown.reconnectionFees)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Penalty Fees</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(report.revenueBreakdown.penaltyFees)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Operations</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(report.expenseBreakdown.operations)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Maintenance</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(report.expenseBreakdown.maintenance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Utilities</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(report.expenseBreakdown.utilities)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Administrative</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(report.expenseBreakdown.administrative)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Payment Methods Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Payment Method
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Transactions
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Amount
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Percentage
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.paymentMethods.map((method, index) => {
                        const totalAmount = report.paymentMethods.reduce((sum, m) => sum + m.amount, 0);
                        const percentage = ((method.amount / totalAmount) * 100).toFixed(1);
                        return (
                          <tr key={index}>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              {method.method}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {method.count}
                            </td>
                            <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                              {formatCurrency(method.amount)}
                            </td>
                            <td className="py-4 px-6">
                              <Badge variant="secondary">{percentage}%</Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Key Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Active Accounts</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.activeAccounts}</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Bills Generated</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.billsGenerated}</p>
                  </div>
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Payments Received</p>
                    <p className="text-2xl font-bold text-gray-900">{report.summary.paymentsReceived}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
