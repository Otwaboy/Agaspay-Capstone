import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { apiClient } from "../../lib/api";

export default function RecentActivities() {
  const { data } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.getDashboardStats()
  });

  const transactions = data?.recentTransactions || [];
  const recentActivities = transactions.slice(0, 4);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  return (
    <Card className="border-none shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No recent activities</p>
            </div>
          ) : (
            recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 pb-4 border-b last:border-0 last:pb-0">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white text-sm">
                    {getInitials(
                      activity.resident_id?.first_name,
                      activity.resident_id?.last_name
                    )}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {activity.resident_id?.first_name} {activity.resident_id?.last_name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {activity.payment_method || 'Payment'} - ₱{activity.amount_paid?.toLocaleString()}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-gray-500">Today</p>
                  <p className="text-xs font-medium text-gray-700">
                    {new Date(activity.createdAt).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: false
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
