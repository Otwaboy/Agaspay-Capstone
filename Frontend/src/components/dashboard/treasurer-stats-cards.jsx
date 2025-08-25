import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, CreditCard, AlertTriangle, Users, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function TreasurerStatsCards() {
  const { data: financialStats, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/financial-stats'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock data structure for development
  const mockStats = {
    totalRevenue: {
      amount: 245680,
      change: 12.5,
      trend: "up"
    },
    monthlyCollections: {
      amount: 45280,
      change: 8.3,
      trend: "up"
    },
    outstandingBalance: {
      amount: 28350,
      change: -5.2,
      trend: "down"
    },
    activeAccounts: {
      count: 1247,
      change: 3.8,
      trend: "up"
    },
    paidBills: {
      count: 892,
      change: 15.4,
      trend: "up"
    },
    overduePayments: {
      count: 23,
      change: -18.2,
      trend: "down"
    }
  };

  const stats = financialStats || mockStats;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatChange = (change, trend) => {
    const sign = trend === 'up' ? '+' : '';
    return `${sign}${change}%`;
  };

  const getChangeColor = (trend) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const statsCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue?.amount || 0),
      change: stats.totalRevenue?.change || 0,
      trend: stats.totalRevenue?.trend || "up",
      icon: DollarSign,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      testId: "card-total-revenue"
    },
    {
      title: "Monthly Collections",
      value: formatCurrency(stats.monthlyCollections?.amount || 0),
      change: stats.monthlyCollections?.change || 0,
      trend: stats.monthlyCollections?.trend || "up",
      icon: TrendingUp,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      testId: "card-monthly-collections"
    },
    {
      title: "Outstanding Balance",
      value: formatCurrency(stats.outstandingBalance?.amount || 0),
      change: stats.outstandingBalance?.change || 0,
      trend: stats.outstandingBalance?.trend || "down",
      icon: AlertTriangle,
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      testId: "card-outstanding-balance"
    },
    {
      title: "Active Accounts",
      value: (stats.activeAccounts?.count || 0).toLocaleString(),
      change: stats.activeAccounts?.change || 0,
      trend: stats.activeAccounts?.trend || "up",
      icon: Users,
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      testId: "card-active-accounts"
    },
    {
      title: "Paid Bills (This Month)",
      value: (stats.paidBills?.count || 0).toLocaleString(),
      change: stats.paidBills?.change || 0,
      trend: stats.paidBills?.trend || "up",
      icon: Receipt,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      testId: "card-paid-bills"
    },
    {
      title: "Overdue Payments",
      value: (stats.overduePayments?.count || 0).toLocaleString(),
      change: stats.overduePayments?.change || 0,
      trend: stats.overduePayments?.trend || "down",
      icon: CreditCard,
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      testId: "card-overdue-payments"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900" data-testid={`text-${stat.testId}-value`}>
                {stat.value}
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${getChangeColor(stat.trend)}`}>
                  {formatChange(stat.change, stat.trend)}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}