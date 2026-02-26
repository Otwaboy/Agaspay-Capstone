import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Activity, Droplets, TrendingUp, TrendingDown, Minus, Download, MapPin } from "lucide-react";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import apiClient from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

export default function ResidentUsage() {
  const [selectedMeter, setSelectedMeter] = useState(null);

  // Fetch all meters for the resident
  const { data: metersData, isLoading: metersLoading } = useQuery({
    queryKey: ["resident-meters"],
    queryFn: async () => {
      const res = await apiClient.getResidentMeters();
      return res.data;
    },
    onSuccess: (data) => {
      if (data && data.length > 0 && !selectedMeter) {
        setSelectedMeter(data[0]);
      }
    }
  });

  const { data: usageData, isLoading } = useQuery({
    queryKey: ["/api/v1/billing", selectedMeter?.connection_id],
    queryFn: async () => {
      if (!selectedMeter?.connection_id) return [];
      const res = await apiClient.getCurrentBill();
      // Filter by connection_id if the API returns all meters' data
      const allData = res.data || [];
      return allData.filter(bill =>
        bill.connection_id === selectedMeter.connection_id ||
        bill.connection_id?._id === selectedMeter.connection_id
      );
    },
    retry: 1,
    enabled: !!selectedMeter?.connection_id
  });

  console.log(usageData);

  if (metersLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <ResidentSidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ResidentTopHeader />
          <main className="flex-1 overflow-auto p-6 relative z-10 flex items-center justify-center">
            <p className="text-gray-600">Loading meters...</p>
          </main>
        </div>
      </div>
    );
  }

  // If no meters found
  if (!metersData || metersData.length === 0) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <ResidentSidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ResidentTopHeader />
          <main className="flex-1 overflow-auto p-6 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Water Usage</h1>
                <p className="text-gray-600 mt-2">Track your water consumption and usage patterns</p>
              </div>
              <Card>
                <CardContent className="p-6 text-center">
                  <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">No water connections found</p>
                  <p className="text-sm text-gray-500 mt-1">Please add a water connection to view usage data.</p>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // If loading usage data for the selected meter
  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <ResidentSidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ResidentTopHeader />
          <main className="flex-1 overflow-auto p-6 relative z-10 flex items-center justify-center">
            <p className="text-gray-600">Loading usage data...</p>
          </main>
        </div>
      </div>
    );
  }

  // ✅ make a shallow copy
  const sortedData = [...(usageData || [])].sort(
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
    const date = new Date(item.inclusive_date.start);
    const monthName = date.toLocaleString("default", { month: "short" });
    return {
      month: `${monthName} ${date.getFullYear()}`,
      consumption: item.calculated || 0,
      amount: item.current_charges || 0,
    };
  });

  const averageConsumption = historicalData.length > 0 ? (
    historicalData.reduce((sum, item) => sum + item.consumption, 0) /
    historicalData.length
  ).toFixed(1) : 0;

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <ResidentTopHeader />
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Water Usage
              </h1>
              <p className="text-gray-600 mt-2">
                Track your water consumption and usage patterns
              </p>
            </div>

            {/* Meter Selector */}
            {metersLoading ? (
              <div className="mb-8">Loading meters...</div>
            ) : (
              <div className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {metersData?.map((meter) => (
                    <Button
                      key={meter.connection_id}
                      variant={selectedMeter?.connection_id === meter.connection_id ? "default" : "outline"}
                      className={`h-auto py-4 px-4 flex flex-col items-start text-left space-y-2 ${
                        selectedMeter?.connection_id === meter.connection_id
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedMeter(meter)}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <Droplets className="h-4 w-4" />
                        <span className="font-medium">Meter #{meter.meter_no}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin className="h-3 w-3" />
                        <span>Zone {meter.zone}, Purok {meter.purok}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

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
                    {historicalData.length > 0 ? Math.max(...historicalData.map((d) => d.consumption)) : 0} m³
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {
                      historicalData.length > 0 ? historicalData.find(
                        (d) =>
                          d.consumption ===
                          Math.max(...historicalData.map((d) => d.consumption))
                      )?.month : "N/A"
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
                    {historicalData.length > 0 ? Math.min(...historicalData.map((d) => d.consumption)) : 0} m³
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {
                      historicalData.length > 0 ? historicalData.find(
                        (d) =>
                          d.consumption ===
                          Math.min(...historicalData.map((d) => d.consumption))
                      )?.month : "N/A"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Bar Chart */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Water Consumption Overview</CardTitle>
                  <CardDescription>
                    Monthly consumption comparison
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {historicalData.length > 0 ? (
                  <div className="space-y-6">
                    <ResponsiveContainer width="100%" height={450}>
                      <BarChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                        <XAxis
                          dataKey="month"
                          stroke="#6b7280"
                          style={{ fontSize: '13px' }}
                          angle={-45}
                          textAnchor="end"
                          height={100}
                        />
                        <YAxis
                          stroke="#6b7280"
                          style={{ fontSize: '13px' }}
                          label={{ value: 'Consumption (m³)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#fff',
                            border: '2px solid #0ea5e9',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                          formatter={(value) => [`${value} m³`, 'Water Used']}
                          labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                        />
                        <Bar
                          dataKey="consumption"
                          radius={[6, 6, 0, 0]}
                          name="Water Consumption"
                          maxBarSize={40}
                        >
                          {historicalData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.consumption > averageConsumption ? '#f97316' : '#3b82f6'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Current Month</p>
                        <p className="text-2xl font-bold text-blue-600">{currentConsumption} m³</p>
                      </div>
                      <div className="text-center border-l border-r border-gray-300">
                        <p className="text-sm text-gray-600">Average</p>
                        <p className="text-2xl font-bold text-purple-600">{averageConsumption} m³</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Change</p>
                        <div className="flex items-center justify-center gap-1">
                          {consumptionChange > 0 ? (
                            <TrendingUp className="h-5 w-5 text-red-500" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-green-500" />
                          )}
                          <p className={`text-2xl font-bold ${consumptionChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {Math.abs(changePercentage)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-orange-500"></div>
                        <span className="text-gray-600">Above Average</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-blue-500"></div>
                        <span className="text-gray-600">Below Average</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                    <Droplets className="h-12 w-12 mb-3 opacity-50" />
                    <p>No consumption data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
