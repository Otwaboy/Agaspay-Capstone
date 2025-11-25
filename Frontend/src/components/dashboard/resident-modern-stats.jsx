import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Droplets, CreditCard, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { apiClient } from "../../lib/api";

export default function ResidentModernStats({ connectionId }) {
  // Fetch all meters to find the selected one
  const { data: metersData } = useQuery({
    queryKey: ["resident-meters"],
    queryFn: async () => {
      const res = await apiClient.getResidentMeters();
      return res.data;
    }
  });

  // Get the selected meter's status and zone
  const selectedMeterData = metersData?.find(meter =>
    meter.connection_id === connectionId
  );

  const { data: billingData } = useQuery({
    queryKey: ["resident-billing", connectionId],
    queryFn: async () => {
      if (!connectionId) return null;
      const res = await apiClient.getCurrentBill();
      const allBills = res.data;
      if (!allBills || allBills.length === 0) return null;

      // Filter bills for this specific meter
      const bills = allBills.filter(bill =>
        bill.connection_id === connectionId ||
        bill.connection_id?._id === connectionId
      );

      if (bills.length === 0) return null;

      const currentBill = bills[bills.length - 1];
      const previousBill = bills.length > 1 ? bills[bills.length - 2] : null;

      return {
        current: currentBill,
        previous: previousBill,
        consumption: currentBill.calculated || 0,
        amount: currentBill.balance || currentBill.total_amount || 0,
        totalAmount: currentBill.total_amount || 0,
        amountPaid: currentBill.amount_paid || 0,
        status: currentBill.payment_status || currentBill.status || "unpaid",
        dueDate: currentBill.due_date
      };
    },
    enabled: !!connectionId
  });

  const stats = [
    {
      title: "Current Bill",
      value: `₱${billingData?.amount?.toFixed(2) || "0.00"}`,
      icon: CreditCard,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
      trend: billingData?.previous ? 
        ((billingData.amount - billingData.previous.total_amount) / billingData.previous.total_amount * 100).toFixed(1) : 0,
      trendLabel: "vs last month"
    },
    {
      title: "Payment Status",
      value: billingData?.status === "paid" ? "Paid" :
             billingData?.status === "partial" ? "Partial" :
             billingData?.status === "pending" ? "Pending" :
             "Unpaid",
      icon: billingData?.status === "paid" ? CheckCircle : AlertCircle,
      iconColor: billingData?.status === "paid" ? "text-green-600" :
                 billingData?.status === "partial" ? "text-orange-600" :
                 billingData?.status === "pending" ? "text-yellow-600" :
                 "text-red-600",
      iconBg: billingData?.status === "paid" ? "bg-green-50" :
              billingData?.status === "partial" ? "bg-orange-50" :
              billingData?.status === "pending" ? "bg-yellow-50" :
              "bg-red-50",
      subtitle: billingData?.dueDate ? `Due: ${new Date(billingData.dueDate).toLocaleDateString()}` : "",
      statusColor: billingData?.status === "paid" ? "text-green-600" :
                   billingData?.status === "partial" ? "text-orange-600" :
                   billingData?.status === "pending" ? "text-yellow-600" :
                   "text-red-600"
    },
    {
      title: "Water Consumption",
      value: `${billingData?.consumption || 0} m³`,
      icon: Droplets,
      iconColor: "text-cyan-600",
      iconBg: "bg-cyan-50",
      trend: billingData?.previous ? 
        ((billingData.consumption - billingData.previous.calculated) / billingData.previous.calculated * 100).toFixed(1) : 0,
      trendLabel: "vs last month"
    },
    {
      title: "Connection Status",
      value: selectedMeterData?.connection_status?.charAt(0)?.toUpperCase() + selectedMeterData?.connection_status?.slice(1) || "Active",
      icon: TrendingUp,
      iconColor: "text-green-600",
      iconBg: "bg-green-50",
      subtitle: `Zone ${selectedMeterData?.zone || "N/A"}`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const trendValue = parseFloat(stat.trend);
        const isPositive = trendValue > 0;
        
        return (
          <Card key={index} className="bg-white/70 backdrop-blur-md border border-white/30 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500 mb-2">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.statusColor || 'text-gray-900'} mb-2`}>
                    {stat.value}
                  </p>
                  {stat.trend !== undefined && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-2 py-0.5 ${isPositive ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}
                      >
                        {isPositive ? '↑' : '↓'} {Math.abs(trendValue)}%
                      </Badge>
                      <span className="text-xs text-gray-500">{stat.trendLabel}</span>
                    </div>
                  )}
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-2">{stat.subtitle}</p>
                  )}
                </div>
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
