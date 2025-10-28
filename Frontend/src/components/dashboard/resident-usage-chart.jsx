import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Droplets, TrendingUp, TrendingDown } from "lucide-react";
import { apiClient } from "../../lib/api";

export default function ResidentUsageChart() {
  const { data, isLoading } = useQuery({
    queryKey: ["resident-usage-history"],
    queryFn: async () => {
      const res = await apiClient.getCurrentBill();
      const bills = res.data || [];
      
      const last6Months = bills.slice(-6).map((bill, index) => {
        const date = new Date(bill.created_at);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          consumption: bill.calculated || 0,
          amount: bill.total_amount || 0,
          reading: bill.present_reading || 0
        };
      });
      
      const totalConsumption = last6Months.reduce((sum, item) => sum + item.consumption, 0);
      const avgConsumption = last6Months.length > 0 ? totalConsumption / last6Months.length : 0;
      
      const currentMonth = last6Months[last6Months.length - 1];
      const previousMonth = last6Months[last6Months.length - 2];
      const trend = previousMonth ? 
        ((currentMonth?.consumption - previousMonth.consumption) / previousMonth.consumption * 100) : 0;
      
      return {
        months: last6Months,
        avgConsumption: avgConsumption.toFixed(1),
        trend: trend.toFixed(1),
        maxConsumption: Math.max(...last6Months.map(m => m.consumption))
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-600" />
            Water Usage Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const months = data?.months || [];
  const maxValue = data?.maxConsumption || 100;
  const trend = parseFloat(data?.trend || 0);
  const isIncreasing = trend > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-600" />
            Water Usage Trend
          </CardTitle>
          <Badge className={`${isIncreasing ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {isIncreasing ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {isIncreasing ? '+' : ''}{trend}%
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mt-1">Last 6 months consumption history</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Average Consumption */}
          <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <p className="text-sm text-gray-600 mb-1">Average Monthly Consumption</p>
            <p className="text-3xl font-bold text-cyan-600">{data?.avgConsumption} m³</p>
          </div>

          {/* Bar Chart */}
          <div className="space-y-3">
            {months.map((month, index) => {
              const percentage = (month.consumption / maxValue) * 100;
              const isCurrentMonth = index === months.length - 1;
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-medium ${isCurrentMonth ? 'text-cyan-700' : 'text-gray-600'}`}>
                      {month.month}
                    </span>
                    <span className={`font-bold ${isCurrentMonth ? 'text-cyan-700' : 'text-gray-700'}`}>
                      {month.consumption} m³
                    </span>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${isCurrentMonth ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-cyan-200'} rounded-lg transition-all duration-500 flex items-center justify-end pr-3`}
                      style={{ width: `${percentage}%` }}
                    >
                      {percentage > 30 && (
                        <span className="text-xs font-semibold text-white">
                          ₱{month.amount.toFixed(0)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips Section */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200 mt-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">💡 Water Saving Tips</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Fix leaky faucets to save up to 20% on your bill</li>
              <li>• Take shorter showers (5-7 minutes max)</li>
              <li>• Water plants early morning or evening</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
