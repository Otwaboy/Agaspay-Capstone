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
  TrendingDown,
  DollarSign,
  BarChart3
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";

export default function TreasurerAnnualReports() {
  const [selectedYear, setSelectedYear] = useState("2024");

  const { data: annualReport, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/annual-report', selectedYear],
    staleTime: 5 * 60 * 1000,
  });

  const mockReport = {
    year: 2024,
    summary: {
      totalRevenue: 2654890,
      totalExpenses: 892450,
      netIncome: 1762440,
      averageMonthlyRevenue: 221241,
      growthRate: 15.8,
      collectionRate: 92.3
    },
    quarterlyData: [
      { 
        quarter: "Q1", 
        revenue: 612450, 
        expenses: 198200, 
        netIncome: 414250,
        collectionRate: 89.5
      },
      { 
        quarter: "Q2", 
        revenue: 685920, 
        expenses: 215680, 
        netIncome: 470240,
        collectionRate: 91.2
      },
      { 
        quarter: "Q3", 
        revenue: 723680, 
        expenses: 234150, 
        netIncome: 489530,
        collectionRate: 93.8
      },
      { 
        quarter: "Q4", 
        revenue: 632840, 
        expenses: 244420, 
        netIncome: 388420,
        collectionRate: 94.7
      }
    ],
    monthlyTrend: [
      { month: "Jan", revenue: 198450, expenses: 65200 },
      { month: "Feb", revenue: 203580, expenses: 67150 },
      { month: "Mar", revenue: 210420, expenses: 65850 },
      { month: "Apr", revenue: 225680, expenses: 68900 },
      { month: "May", revenue: 232150, expenses: 72450 },
      { month: "Jun", revenue: 228090, expenses: 74330 },
      { month: "Jul", revenue: 238920, expenses: 76890 },
      { month: "Aug", revenue: 245680, expenses: 78150 },
      { month: "Sep", revenue: 239080, expenses: 79110 },
      { month: "Oct", revenue: 215450, expenses: 81250 },
      { month: "Nov", revenue: 208190, expenses: 80890 },
      { month: "Dec", revenue: 209200, expenses: 82280 }
    ],
    yearComparison: {
      currentYear: 2654890,
      previousYear: 2294560,
      growth: 360330,
      growthPercentage: 15.7
    }
  };

  const report = annualReport || mockReport;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const years = ["2024", "2023", "2022", "2021"];

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
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-annual-reports-title">
                      Annual Financial Reports
                    </h1>
                    <p className="text-gray-600">Comprehensive yearly financial analysis</p>
                  </div>
                </div>
                <Button data-testid="button-download-annual-report">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Year Selector */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Select Year:</span>
                  </div>
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
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-annual-revenue">
                    {formatCurrency(report.summary.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium ml-1">
                      +{report.summary.growthRate}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(report.summary.totalExpenses)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Operating costs</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Net Income</p>
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(report.summary.netIncome)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Annual profit</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Avg Collection</p>
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {report.summary.collectionRate}%
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Collection rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Year Comparison */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Year-over-Year Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-2">{selectedYear} Revenue</p>
                    <p className="text-3xl font-bold text-blue-900">
                      {formatCurrency(report.yearComparison.currentYear)}
                    </p>
                  </div>
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 font-medium mb-2">{parseInt(selectedYear) - 1} Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(report.yearComparison.previousYear)}
                    </p>
                  </div>
                  <div className="p-6 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium mb-2">Growth</p>
                    <p className="text-3xl font-bold text-green-900">
                      +{formatCurrency(report.yearComparison.growth)}
                    </p>
                    <Badge className="mt-2 bg-green-100 text-green-800">
                      +{report.yearComparison.growthPercentage}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quarterly Performance */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Quarterly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Quarter
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Revenue
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Expenses
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Net Income
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Collection Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.quarterlyData.map((quarter, index) => (
                        <tr key={index} data-testid={`quarter-row-${quarter.quarter}`}>
                          <td className="py-4 px-6 text-sm font-medium text-gray-900">
                            {quarter.quarter}
                          </td>
                          <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                            {formatCurrency(quarter.revenue)}
                          </td>
                          <td className="py-4 px-6 text-sm text-red-600">
                            {formatCurrency(quarter.expenses)}
                          </td>
                          <td className="py-4 px-6 text-sm font-bold text-green-600">
                            {formatCurrency(quarter.netIncome)}
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={quarter.collectionRate >= 92 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {quarter.collectionRate}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trend */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue & Expense Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Month
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Revenue
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Expenses
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Net Profit
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.monthlyTrend.map((month, index) => {
                        const netProfit = month.revenue - month.expenses;
                        return (
                          <tr key={index}>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              {month.month}
                            </td>
                            <td className="py-4 px-6 text-sm font-semibold text-green-600">
                              {formatCurrency(month.revenue)}
                            </td>
                            <td className="py-4 px-6 text-sm text-red-600">
                              {formatCurrency(month.expenses)}
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-blue-600">
                              {formatCurrency(netProfit)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
