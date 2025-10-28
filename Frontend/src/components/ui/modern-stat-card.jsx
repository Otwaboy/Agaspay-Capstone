import React from "react";
import { Card, CardContent } from "./card";
import { ChevronRight } from "lucide-react";

export default function ModernStatCard({ 
  icon: Icon, 
  iconBg = "bg-blue-100", 
  iconColor = "text-blue-600",
  title, 
  value, 
  subtitle,
  trend = [],
  trendColor = "bg-blue-500",
  onClick,
  badge
}) {
  const maxTrendValue = Math.max(...trend, 1);
  
  return (
    <Card 
      className={`border-none shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`${iconBg} p-3 rounded-xl`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          {onClick && (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
          {badge && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        
        <div>
          <h3 className="text-4xl font-bold text-gray-900 mb-1">{value}</h3>
          <p className="text-sm text-gray-600 mb-3">{title}</p>
          
          {/* Inline mini chart */}
          {trend.length > 0 && (
            <div className="flex items-end gap-1 h-8">
              {trend.map((value, index) => {
                const height = (value / maxTrendValue) * 100;
                return (
                  <div
                    key={index}
                    className={`flex-1 rounded-t ${trendColor} ${index === trend.length - 1 ? 'opacity-100' : 'opacity-40'}`}
                    style={{ height: `${height}%` }}
                  ></div>
                );
              })}
            </div>
          )}
          
          {subtitle && !trend.length && (
            <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
