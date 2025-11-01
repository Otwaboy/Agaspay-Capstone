import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { 
  BarChart3, 
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";

export default function TreasurerAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/analytics', selectedPeriod],
    staleTime: 5 * 60 * 1000,
  });

  const mockAnalytics = {
    overview: {
      totalRevenue: 2654890,
      revenueGrowth: 15.8,
      totalCustomers: 1247,
      customerGrowth: 3.2,
      averageRevenue: 2129,
      collectionEfficiency: 94.2
    },
    revenueAnalysis: {
      highestMonth: { month: "August", amount: 245680 },
      lowestMonth: { month: "January", amount: 198450 },
      averageMonthly: 221241,
      trend: "increasing"
    },
    customerSegments: [
      { segment: "Residential", count: 1089, percentage: 87.3, avgBill: 385 },
      { segment: "Commercial", count: 124, percentage: 9.9, avgBill: 1250 },
      { segment: "Industrial", count: 34, percentage: 2.7, avgBill: 3890 }
    ],
    paymentBehavior: {
      onTime: { count: 892, percentage: 71.5 },
      late: { count: 312, percentage: 25.0 },
      defaulted: { count: 43, percentage: 3.4 }
    },
    topPerformers: [
      { name: "Zone 1", revenue: 58920, growth: 18.5 },
      { name: "Zone 2", revenue: 52340, growth: 12.3 },
      { name: "Zone 3", revenue: 48560, growth: 9.8 }
    ]
  };

  const analytics = analyticsData || mockAnalytics;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-analytics-title">
                      Financial Analytics
                    </h1>
                    <p className="text-gray-600">Comprehensive financial insights and trends</p>
                  </div>
                </div>
                <Button data-testid="button-export-analytics">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={selectedPeriod === "weekly" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("weekly")}
              >
                Weekly
              </Button>
              <Button
                variant={selectedPeriod === "monthly" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("monthly")}
              >
                Monthly
              </Button>
              <Button
                variant={selectedPeriod === "quarterly" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("quarterly")}
              >
                Quarterly
              </Button>
              <Button
                variant={selectedPeriod === "yearly" ? "default" : "outline"}
                onClick={() => setSelectedPeriod("yearly")}
              >
                Yearly
              </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-total-revenue">
                    {formatCurrency(analytics.overview.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium ml-1">
                      +{analytics.overview.revenueGrowth}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Total Customers</p>
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.overview.totalCustomers.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-600 font-medium ml-1">
                      +{analytics.overview.customerGrowth}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600">Collection Rate</p>
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.overview.collectionEfficiency}%
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Efficiency rate</p>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Analysis */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-medium mb-1">Highest Month</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(analytics.revenueAnalysis.highestMonth.amount)}
                    </p>
                    <p className="text-sm text-green-700 mt-1">{analytics.revenueAnalysis.highestMonth.month}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-700 font-medium mb-1">Lowest Month</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {formatCurrency(analytics.revenueAnalysis.lowestMonth.amount)}
                    </p>
                    <p className="text-sm text-orange-700 mt-1">{analytics.revenueAnalysis.lowestMonth.month}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 font-medium mb-1">Monthly Average</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(analytics.revenueAnalysis.averageMonthly)}
                    </p>
                    <Badge className="mt-2 bg-blue-100 text-blue-800">
                      {analytics.revenueAnalysis.trend}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Segments */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.customerSegments.map((segment, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{segment.segment}</h4>
                          <p className="text-sm text-gray-500">{segment.count} customers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">Avg Bill: {formatCurrency(segment.avgBill)}</p>
                          <Badge variant="secondary">{segment.percentage}%</Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${segment.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Behavior & Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Behavior</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-900">On-Time Payments</p>
                        <p className="text-sm text-green-700">{analytics.paymentBehavior.onTime.count} customers</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {analytics.paymentBehavior.onTime.percentage}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="font-medium text-yellow-900">Late Payments</p>
                        <p className="text-sm text-yellow-700">{analytics.paymentBehavior.late.count} customers</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {analytics.paymentBehavior.late.percentage}%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-red-900">Defaulted</p>
                        <p className="text-sm text-red-700">{analytics.paymentBehavior.defaulted.count} customers</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800">
                        {analytics.paymentBehavior.defaulted.percentage}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Zones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topPerformers.map((zone, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">{zone.name}</p>
                          <p className="text-sm text-gray-500">{formatCurrency(zone.revenue)}</p>
                        </div>
                        <div className="flex items-center">
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600 ml-1">
                            +{zone.growth}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
