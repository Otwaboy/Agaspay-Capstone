import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { dashboardApi } from "../../services/adminApi";

export default function ConnectionBreakdown() {
  const { data } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats
  });

  const stats = data?.stats || {};
  const total = stats?.connections?.total || 0;
  const active = stats?.connections?.active || 0;
  const pending = stats?.connections?.pending || 0;
  const disconnected = stats?.connections?.disconnected || 0;

  const categories = [
    { name: "Active", count: active, color: "text-blue-600", bgColor: "bg-blue-600", percentage: total ? ((active / total) * 100).toFixed(1) : 0 },
    { name: "Pending", count: pending, color: "text-orange-600", bgColor: "bg-orange-500", percentage: total ? ((pending / total) * 100).toFixed(1) : 0 },
    { name: "Disconnected", count: disconnected, color: "text-yellow-600", bgColor: "bg-yellow-500", percentage: total ? ((disconnected / total) * 100).toFixed(1) : 0 }
  ];

  // Calculate angles for donut chart
  let currentAngle = 0;
  const segments = categories.map(cat => {
    const angle = (parseFloat(cat.percentage) / 100) * 360;
    const segment = {
      ...cat,
      startAngle: currentAngle,
      endAngle: currentAngle + angle
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Connection Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center mb-6">
          {/* Donut Chart */}
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 200 200" className="transform -rotate-90">
              {segments.map((segment, index) => {
                const radius = 70;
                const centerX = 100;
                const centerY = 100;
                const startAngle = (segment.startAngle * Math.PI) / 180;
                const endAngle = (segment.endAngle * Math.PI) / 180;

                const x1 = centerX + radius * Math.cos(startAngle);
                const y1 = centerY + radius * Math.sin(startAngle);
                const x2 = centerX + radius * Math.cos(endAngle);
                const y2 = centerY + radius * Math.sin(endAngle);

                const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;

                return (
                  <path
                    key={index}
                    d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    className={segment.bgColor}
                    opacity={index === 0 ? 1 : 0.8}
                  />
                );
              })}
              {/* Center circle for donut effect */}
              <circle cx="100" cy="100" r="50" fill="white" />
            </svg>
            
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Total Connections</p>
              <p className="text-3xl font-bold text-gray-900">{total}</p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${category.bgColor}`} />
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">{category.count}</span>
                <span className="text-xs text-gray-500">{category.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
