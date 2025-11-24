import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Activity, Droplets, TrendingUp, TrendingDown, Minus, Download } from "lucide-react";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import apiClient from "../lib/api";

export default function ResidentUsage() {
  
  const { data: usageData } = useQuery({
    queryKey: ["/api/v1/billing"],
    queryFn: async () => {
      const res = await apiClient.getCurrentBill();
      return res.data || []; // ✅ access the .data array from your payload
    },
    retry: 1,
  });

  console.log(usageData);
  

  // ✅ make a shallow copy
  const sortedData = [...usageData].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at) // basically get first the value of the oldest date 
  );

  // ✅ Get current month & year
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // ✅ Filter bills that belong to the current month
  const currentMonthBills = sortedData.filter((bill) => {
    const date = new Date(bill.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  // ✅ If no current month bills, fallback to last entry
  const currentBill =
    currentMonthBills.length > 0
      ? currentMonthBills[currentMonthBills.length - 1]
      : sortedData[sortedData.length - 1];

  const previousBill =
    sortedData.length > 1
      ? sortedData[sortedData.length - 2]
      : null;

  const currentConsumption = currentBill?.calculated || 0;
  const previousConsumption = previousBill?.calculated || 0;
  const consumptionChange = currentConsumption - previousConsumption;

  const changePercentage =
    previousConsumption > 0
      ? ((consumptionChange / previousConsumption) * 100).toFixed(1)
      : 0;

  // ✅ Create a simple historical dataset for chart display
  const historicalData = sortedData.map((item) => {
    const date = new Date(item.due_date);
    const monthName = date.toLocaleString("default", { month: "short" });
    return {
      month: `${monthName} ${date.getFullYear()}`,
      consumption: item.calculated,
      amount: item.total_amount,
    };
  });

  const averageConsumption = (
    historicalData.reduce((sum, item) => sum + item.consumption, 0) /
    historicalData.length
  ).toFixed(1);

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <ResidentTopHeader />
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Water Usage
                </h1>
                <p className="text-gray-600 mt-2">
                  Track your water consumption and usage patterns
                </p>
              </div>
            </div>

            {/* Stats */}
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
                    <span
                      className={`text-sm ${
                        consumptionChange > 0
                          ? "text-red-600"
                          : consumptionChange < 0
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
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
                    {averageConsumption || 0 } m³
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Monthly average
                  </p>
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
                    {Math.max(...historicalData.map((d) => d.consumption))} m³
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {
                      historicalData.find(
                        (d) =>
                          d.consumption ===
                          Math.max(...historicalData.map((d) => d.consumption))
                      )?.month
                    }
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
                    {Math.min(...historicalData.map((d) => d.consumption))} m³
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {
                      historicalData.find(
                        (d) =>
                          d.consumption ===
                          Math.min(...historicalData.map((d) => d.consumption))
                      )?.month
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Simple chart */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Consumption History</CardTitle>
                  <CardDescription>
                    Your water usage for recent months
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historicalData.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          {item.month}
                        </span>
                        <span className="text-gray-600">
                          {item.consumption} m³ • ₱{item.amount}
                        </span>
                      </div>
                      <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all"
                          style={{
                            width: `${(item.consumption / 30) * 100}%`,
                          }}
                        />
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
