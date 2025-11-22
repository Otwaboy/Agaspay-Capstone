import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import apiClient from "../../lib/api";

export default function TreasurerStatsCards() {
  // Fetch financial statistics
  const { data: financialData, isLoading } = useQuery({
    queryKey: ["treasurer-financial-stats"],
    queryFn: () => apiClient.getSecretaryFinancialStats(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Extract financial data safely
  const totalRevenue = financialData?.data?.totalRevenue || 0;
  const monthlyCollection = financialData?.data?.monthlyCollection || 0;
  const outstandingBalances = financialData?.data?.outstandingBalances || 0;

  const statsCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      change: "+12.5%",
      trend: "up",
      subtitle: "All-time confirmed payments",
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      chartColor: "bg-blue-500",
      testId: "card-total-revenue"
    },
    {
      title: "Monthly Collections",
      value: formatCurrency(monthlyCollection),
      change: "+8.3%",
      trend: "up",
      subtitle: "Current month payments",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
      chartColor: "bg-green-500",
      testId: "card-monthly-collections"
    },
    {
      title: "Outstanding Balance",
      value: formatCurrency(outstandingBalances),
      change: "-5.2%",
      trend: "down",
      subtitle: "Unpaid/Partial/Overdue bills",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      chartColor: "bg-orange-500",
      testId: "card-outstanding-balance"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((stat) => (
        <Card key={stat.title} data-testid={stat.testId} className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900" data-testid={`text-${stat.testId}-value`}>
                  {stat.value}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`text-xs font-medium ${
                      stat.trend === "up" ? "text-blue-600" : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-blue-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
              </div>

              {/* Mini bar chart */}
              <div className="flex items-end gap-0.5 h-12 ml-2">
                {[30, 45, 35, 50, 40, 60, 55, 70, 65, 75].map((height, i) => (
                  <div
                    key={i}
                    className={`w-1.5 ${stat.chartColor} opacity-${
                      i === 9 ? "100" : "40"
                    } rounded-sm`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}