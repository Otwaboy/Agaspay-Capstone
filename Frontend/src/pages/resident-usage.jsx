import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import {
  Droplets,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Activity,
  Minus
} from "lucide-react";
import apiClient from "../lib/api";

export default function ResidentUsage() {
  const [period, setPeriod] = useState("6months");

  const { data: usageData, isLoading } = useQuery({
    queryKey: ['/api/v1/billing'],
    queryFn: async () => {
      const res = await apiClient.getCurrentBill();
      return res.billingDetails?.[0] || null;
    },
    retry: 1
  });

  // Mock historical data - replace with actual API call
  const historicalData = [
    { month: "Mar 2024", consumption: 18, amount: 450 },
    { month: "Apr 2024", consumption: 22, amount: 520 },
    { month: "May 2024", consumption: 19, amount: 475 },
    { month: "Jun 2024", consumption: 25, amount: 600 },
    { month: "Jul 2024", consumption: 20, amount: 500 },
    { month: "Aug 2024", consumption: usageData?.consumption || 23, amount: usageData?.total_amount || 550 }
  ];

  const currentConsumption = usageData?.consumption || 0;
  const previousConsumption = historicalData[historicalData.length - 2]?.consumption || 0;
  const consumptionChange = currentConsumption - previousConsumption;
  const changePercentage = previousConsumption > 0 
    ? ((consumptionChange / previousConsumption) * 100).toFixed(1) 
    : 0;

  const averageConsumption = (
    historicalData.reduce((sum, item) => sum + item.consumption, 0) / historicalData.length
  ).toFixed(1);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900" data-testid="text-usage-title">
                  Water Usage
                </h1>
                <p className="text-gray-600 mt-2">
                  Track your water consumption and usage patterns
                </p>
              </div>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-40" data-testid="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Droplets className="h-4 w-4 mr-2 text-blue-600" />
                    Current Month
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {currentConsumption} m³
                  </div>
                  <div className="flex items-center mt-2">
                    {consumptionChange > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                    ) : consumptionChange < 0 ? (
                      <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <Minus className="h-4 w-4 text-gray-500 mr-1" />
                    )}
                    <span className={`text-sm ${consumptionChange > 0 ? 'text-red-600' : consumptionChange < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                      {Math.abs(changePercentage)}% from last month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-purple-600" />
                    Average Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {averageConsumption} m³
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Monthly average</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-orange-600" />
                    Highest Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">
                    {Math.max(...historicalData.map(d => d.consumption))} m³
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {historicalData.find(d => d.consumption === Math.max(...historicalData.map(d => d.consumption)))?.month}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                    <TrendingDown className="h-4 w-4 mr-2 text-green-600" />
                    Lowest Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {Math.min(...historicalData.map(d => d.consumption))} m³
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {historicalData.find(d => d.consumption === Math.min(...historicalData.map(d => d.consumption)))?.month}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Chart */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Consumption History</CardTitle>
                  <CardDescription>Your water usage over the last 6 months</CardDescription>
                </div>
                <Button variant="outline" size="sm" data-testid="button-export-usage">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {/* Simple Bar Chart */}
                <div className="space-y-4">
                  {historicalData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{item.month}</span>
                        <span className="text-gray-600">{item.consumption} m³ • ₱{item.amount}</span>
                      </div>
                      <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{ width: `${(item.consumption / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tips and Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-600" />
                    Usage Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {consumptionChange > 0 ? (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <strong>Higher than usual:</strong> Your consumption increased by {Math.abs(consumptionChange)} m³ compared to last month.
                      </p>
                    </div>
                  ) : consumptionChange < 0 ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Great job!</strong> Your consumption decreased by {Math.abs(consumptionChange)} m³ compared to last month.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Stable usage:</strong> Your consumption is consistent with last month.
                      </p>
                    </div>
                  )}

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>Monthly Average:</strong> You're consuming {averageConsumption} m³ on average per month.
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Reading Date:</strong> {usageData?.reading_date ? new Date(usageData.reading_date).toLocaleDateString() : 'Not available'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Droplets className="h-5 w-5 mr-2 text-green-600" />
                    Water Saving Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="bg-green-100 p-1 rounded-full mt-0.5">
                        <div className="h-2 w-2 bg-green-600 rounded-full" />
                      </div>
                      <p className="text-sm text-gray-700">
                        Fix leaking faucets immediately - a dripping tap can waste up to 15 liters per day
                      </p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="bg-green-100 p-1 rounded-full mt-0.5">
                        <div className="h-2 w-2 bg-green-600 rounded-full" />
                      </div>
                      <p className="text-sm text-gray-700">
                        Use a bucket instead of a hose when washing your vehicle
                      </p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="bg-green-100 p-1 rounded-full mt-0.5">
                        <div className="h-2 w-2 bg-green-600 rounded-full" />
                      </div>
                      <p className="text-sm text-gray-700">
                        Install water-saving fixtures like low-flow showerheads
                      </p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="bg-green-100 p-1 rounded-full mt-0.5">
                        <div className="h-2 w-2 bg-green-600 rounded-full" />
                      </div>
                      <p className="text-sm text-gray-700">
                        Reuse water from washing vegetables for watering plants
                      </p>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="bg-green-100 p-1 rounded-full mt-0.5">
                        <div className="h-2 w-2 bg-green-600 rounded-full" />
                      </div>
                      <p className="text-sm text-gray-700">
                        Take shorter showers - reducing time by 2 minutes can save up to 30 liters
                      </p>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
