import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Droplets, ArrowRight } from "lucide-react";
import { apiClient } from "../../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function ResidentUsageChart({ connectionId }) {
  const { data, isLoading } = useQuery({
    queryKey: ["resident-usage-history", connectionId],
    queryFn: async () => {
      const res = await apiClient.getCurrentBill(connectionId);
      const bills = res.data || [];

      console.log('bill data', bills);
      
      
      const last6Months = bills.slice(-6).map((bill) => {
        const date = new Date(bill.inclusive_date.start);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5 text-cyan-600" />
            Water Usage Trend
          </CardTitle>

          <Link href="/resident-dashboard/usage">
            <Button variant="outline" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
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
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '2px solid #06b6d4',
                    borderRadius: '8px',
                    padding: '10px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`${value} m³`, 'Usage']}
                  labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
                />
                <Bar
                  dataKey="consumption"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={35}
                >
                  {months.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.consumption > data?.avgConsumption ? '#f97316' : '#06b6d4'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
