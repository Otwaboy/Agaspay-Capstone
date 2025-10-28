import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { TrendingDown } from "lucide-react";
import { dashboardApi } from "../../services/adminApi";

export default function RevenueOverview() {
  const [period, setPeriod] = useState("1year");
  
  const { data } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats
  });

  const stats = data?.stats || {};
  const monthlyRevenue = stats?.financial?.totalRevenue || 0;

  // Sample monthly data - replace with real API data
  const monthlyData = [
    { month: "Jan", amount: 28000 },
    { month: "Feb", amount: 32000 },
    { month: "Mar", amount: 29000 },
    { month: "Apr", amount: 35000 },
    { month: "May", amount: 38000 },
    { month: "Jun", amount: 42000 },
    { month: "Jul", amount: 47500 },
    { month: "Aug", amount: 40000 },
    { month: "Sep", amount: 38000 },
    { month: "Oct", amount: 41000 },
    { month: "Nov", amount: 39000 },
    { month: "Dec", amount: 43000 }
  ];

  const maxAmount = Math.max(...monthlyData.map(d => d.amount));

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Overview</CardTitle>
          <div className="flex gap-2">
            {['1year', '6months', '3months', '1month'].map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriod(p)}
                className={`text-xs px-3 py-1 h-8 ${
                  period === p 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p === '1year' ? '1 Year' : p === '6months' ? '6 Months' : p === '3months' ? '3 Months' : '1 Month'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Avg per month</p>
          <div className="flex items-center gap-2">
            <h2 className="text-4xl font-bold">₱{monthlyRevenue.toLocaleString()}</h2>
            <div className="flex items-center gap-1 text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">13.4%</span>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="relative h-64">
          <div className="flex items-end justify-between h-full gap-2">
            {monthlyData.map((data, index) => {
              const height = (data.amount / maxAmount) * 100;
              const isHighlighted = data.month === "Jul";
              
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  {isHighlighted && (
                    <div className="text-xs font-medium text-indigo-600 mb-1">
                      {data.month} 2024
                      <div className="text-xs text-gray-900 font-semibold">
                        ₱{(data.amount / 1000).toFixed(0)}k
                      </div>
                    </div>
                  )}
                  <div className="w-full flex flex-col items-center">
                    <div
                      className={`w-full rounded-t-md transition-all ${
                        isHighlighted
                          ? 'bg-indigo-600'
                          : 'bg-indigo-200'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-sm text-gray-600">Billing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-sm text-gray-600">Payments</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
