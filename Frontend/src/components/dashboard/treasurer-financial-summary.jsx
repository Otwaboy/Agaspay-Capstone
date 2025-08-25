import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, Calendar, Target } from "lucide-react";

export default function TreasurerFinancialSummary() {
  const { data: financialSummary, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/financial-summary'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock data for development
  const mockSummary = {
    currentMonth: {
      revenue: 245680,
      expenses: 85200,
      netIncome: 160480,
      collectionRate: 94.2
    },
    previousMonth: {
      revenue: 220150,
      expenses: 89300,
      netIncome: 130850,
      collectionRate: 89.8
    },
    yearToDate: {
      revenue: 2156400,
      expenses: 743600,
      netIncome: 1412800,
      collectionRate: 91.5
    },
    targets: {
      monthlyRevenue: 250000,
      collectionRate: 95.0,
      netIncomeMargin: 65.0
    }
  };

  const summary = financialSummary || mockSummary;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getChangeIndicator = (change) => {
    if (change > 0) {
      return {
        icon: TrendingUp,
        color: "text-green-600",
        bg: "bg-green-50"
      };
    } else if (change < 0) {
      return {
        icon: TrendingDown,
        color: "text-red-600",
        bg: "bg-red-50"
      };
    } else {
      return {
        icon: TrendingUp,
        color: "text-gray-600",
        bg: "bg-gray-50"
      };
    }
  };

  const revenueChange = calculateChange(summary.currentMonth.revenue, summary.previousMonth.revenue);
  const netIncomeChange = calculateChange(summary.currentMonth.netIncome, summary.previousMonth.netIncome);
  const collectionRateChange = summary.currentMonth.collectionRate - summary.previousMonth.collectionRate;

  const revenueIndicator = getChangeIndicator(revenueChange);
  const netIncomeIndicator = getChangeIndicator(netIncomeChange);
  const collectionIndicator = getChangeIndicator(collectionRateChange);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Financial Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Month Performance */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Current Month
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Revenue</p>
                  <p className="text-lg font-bold text-blue-900" data-testid="text-current-revenue">
                    {formatCurrency(summary.currentMonth.revenue)}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${revenueIndicator.bg}`}>
                  <revenueIndicator.icon className={`h-4 w-4 ${revenueIndicator.color}`} />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-green-700 font-medium">Net Income</p>
                  <p className="text-lg font-bold text-green-900" data-testid="text-current-net-income">
                    {formatCurrency(summary.currentMonth.netIncome)}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${netIncomeIndicator.bg}`}>
                  <netIncomeIndicator.icon className={`h-4 w-4 ${netIncomeIndicator.color}`} />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-purple-700 font-medium">Collection Rate</p>
                  <p className="text-lg font-bold text-purple-900" data-testid="text-current-collection-rate">
                    {formatPercentage(summary.currentMonth.collectionRate)}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${collectionIndicator.bg}`}>
                  <collectionIndicator.icon className={`h-4 w-4 ${collectionIndicator.color}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Year to Date */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Year to Date
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-xl font-bold text-gray-900" data-testid="text-ytd-revenue">
                  {formatCurrency(summary.yearToDate.revenue)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Expenses: {formatCurrency(summary.yearToDate.expenses)}
                </p>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Net Income</p>
                <p className="text-xl font-bold text-gray-900" data-testid="text-ytd-net-income">
                  {formatCurrency(summary.yearToDate.netIncome)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Margin: {formatPercentage((summary.yearToDate.netIncome / summary.yearToDate.revenue) * 100)}
                </p>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">Avg Collection Rate</p>
                <p className="text-xl font-bold text-gray-900" data-testid="text-ytd-collection-rate">
                  {formatPercentage(summary.yearToDate.collectionRate)}
                </p>
              </div>
            </div>
          </div>

          {/* Performance vs Targets */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Performance vs Targets
            </h3>
            
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Revenue Target</p>
                  <Badge variant={summary.currentMonth.revenue >= summary.targets.monthlyRevenue ? "default" : "secondary"}>
                    {summary.currentMonth.revenue >= summary.targets.monthlyRevenue ? "Met" : "Below"}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(summary.targets.monthlyRevenue)}
                </p>
                <p className="text-xs text-gray-500">
                  Current: {formatPercentage((summary.currentMonth.revenue / summary.targets.monthlyRevenue) * 100)} of target
                </p>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Collection Target</p>
                  <Badge variant={summary.currentMonth.collectionRate >= summary.targets.collectionRate ? "default" : "secondary"}>
                    {summary.currentMonth.collectionRate >= summary.targets.collectionRate ? "Met" : "Below"}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatPercentage(summary.targets.collectionRate)}
                </p>
                <p className="text-xs text-gray-500">
                  Current: {formatPercentage(summary.currentMonth.collectionRate)}
                </p>
              </div>

              <div className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Net Margin Target</p>
                  <Badge variant={(summary.currentMonth.netIncome / summary.currentMonth.revenue) * 100 >= summary.targets.netIncomeMargin ? "default" : "secondary"}>
                    {(summary.currentMonth.netIncome / summary.currentMonth.revenue) * 100 >= summary.targets.netIncomeMargin ? "Met" : "Below"}
                  </Badge>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {formatPercentage(summary.targets.netIncomeMargin)}
                </p>
                <p className="text-xs text-gray-500">
                  Current: {formatPercentage((summary.currentMonth.netIncome / summary.currentMonth.revenue) * 100)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}