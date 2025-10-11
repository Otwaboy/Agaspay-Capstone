import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Download,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";

export default function TreasurerRevenueReports() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/revenue-reports', selectedPeriod],
    staleTime: 5 * 60 * 1000,
  });

  const mockRevenueData = {
    summary: {
      totalRevenue: 245680,
      revenueGrowth: 12.5,
      averagePerCustomer: 197,
      collectionEfficiency: 94.2
    },
    monthlyBreakdown: [
      { month: "January", revenue: 198450, collections: 192300, outstanding: 6150 },
      { month: "February", revenue: 203580, collections: 197890, outstanding: 5690 },
      { month: "March", revenue: 215320, collections: 208420, outstanding: 6900 },
      { month: "April", revenue: 221450, collections: 215680, outstanding: 5770 },
      { month: "May", revenue: 228670, collections: 220340, outstanding: 8330 },
      { month: "June", revenue: 235890, collections: 228560, outstanding: 7330 },
      { month: "July", revenue: 242150, collections: 235480, outstanding: 6670 },
      { month: "August", revenue: 245680, collections: 238920, outstanding: 6760 },
    ],
    revenueBySource: [
      { source: "Monthly Bills", amount: 189420, percentage: 77.1 },
      { source: "Connection Fees", amount: 32150, percentage: 13.1 },
      { source: "Reconnection Fees", amount: 15680, percentage: 6.4 },
      { source: "Penalty Fees", amount: 8430, percentage: 3.4 }
    ]
  };

  const revenue = revenueData || mockRevenueData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <TreasurerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TreasurerTopHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-revenue-reports-title">
                      Revenue Reports
                    </h1>
                    <p className="text-gray-600">Comprehensive revenue analysis and insights</p>
                  </div>
                </div>
                <Button data-testid="button-download-report">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={selectedPeriod === "monthly" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("monthly")}
                data-testid="button-period-monthly"
              >
                Monthly
              </Button>
              <Button
                variant={selectedPeriod === "quarterly" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("quarterly")}
                data-testid="button-period-quarterly"
              >
                Quarterly
              </Button>
              <Button
                variant={selectedPeriod === "yearly" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("yearly")}
                data-testid="button-period-yearly"
              >
                Yearly
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-total-revenue">
                    {formatCurrency(revenue.summary.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium ml-1">
                      {revenue.summary.revenueGrowth}%
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last period</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Avg per Customer</p>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(revenue.summary.averagePerCustomer)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Average revenue</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {revenue.summary.collectionEfficiency}%
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Efficiency rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Outstanding</p>
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(revenue.monthlyBreakdown[revenue.monthlyBreakdown.length - 1].outstanding)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Pending collection</p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Breakdown */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Monthly Revenue Breakdown</CardTitle>
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
                          Total Revenue
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Collections
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Outstanding
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Collection Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenue.monthlyBreakdown.map((month, index) => {
                        const collectionRate = (month.collections / month.revenue * 100).toFixed(1);
                        return (
                          <tr key={index} data-testid={`month-row-${month.month}`}>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              {month.month}
                            </td>
                            <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                              {formatCurrency(month.revenue)}
                            </td>
                            <td className="py-4 px-6 text-sm text-green-600 font-medium">
                              {formatCurrency(month.collections)}
                            </td>
                            <td className="py-4 px-6 text-sm text-orange-600 font-medium">
                              {formatCurrency(month.outstanding)}
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={collectionRate >= 95 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                {collectionRate}%
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Source */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenue.revenueBySource.map((source, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-900">{source.source}</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(source.amount)}
                          </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${source.percentage}%` }}
                          />
                        </div>
                      </div>
                      <Badge variant="secondary" className="ml-4">
                        {source.percentage}%
                      </Badge>
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
