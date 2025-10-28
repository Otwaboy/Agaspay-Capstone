import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { AlertCircle, AlertTriangle, Clock, CheckCircle2, Megaphone, Droplets } from "lucide-react";
import { dashboardApi, incidentsApi, connectionsApi, announcementsApi } from "../../services/adminApi";

export default function SystemAlerts() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats(),
  });

  const { data: incidents } = useQuery({
    queryKey: ['unresolved-incidents'],
    queryFn: () => incidentsApi.getAll({ reported_issue_status: 'Pending' }),
  });

  const { data: pendingConnections } = useQuery({
    queryKey: ['pending-connections'],
    queryFn: () => connectionsApi.getAll({ connection_status: 'Pending' }),
  });

  const { data: pendingAnnouncements } = useQuery({
    queryKey: ['pending-announcements-count'],
    queryFn: () => announcementsApi.getPending(),
  });

  const alerts = [
    {
      id: 1,
      title: 'Overdue Payments',
      count: stats?.overdueBills || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Bills past due date',
      severity: 'high'
    },
    {
      id: 2,
      title: 'Pending Connections',
      count: pendingConnections?.connections?.length || 0,
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Awaiting approval',
      severity: 'medium'
    },
    {
      id: 3,
      title: 'Unresolved Incidents',
      count: incidents?.incident_reports?.length || 0,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: 'Require attention',
      severity: 'high'
    },
    {
      id: 4,
      title: 'Pending Announcements',
      count: pendingAnnouncements?.announcements?.length || 0,
      icon: Megaphone,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Need approval',
      severity: 'low'
    },
    {
      id: 5,
      title: 'Active Connections',
      count: stats?.activeConnections || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Currently active',
      severity: 'info'
    },
    {
      id: 6,
      title: 'Pending Payments',
      count: stats?.totalPendingPayments || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      description: 'Awaiting confirmation',
      severity: 'medium'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-indigo-600" />
          System Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div
                key={alert.id}
                className={`${alert.bgColor} ${alert.borderColor} border rounded-lg p-3 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-4 w-4 ${alert.color}`} />
                      <p className="text-xs font-medium text-gray-700">{alert.title}</p>
                    </div>
                    <p className={`text-2xl font-bold ${alert.color} mb-1`}>
                      {alert.count}
                    </p>
                    <p className="text-xs text-gray-600">{alert.description}</p>
                  </div>
                  {alert.count > 0 && alert.severity === 'high' && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                      !
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-xs font-medium text-gray-700">System Status: Operational</p>
          </div>
          <p className="text-xs text-gray-600">
            All services running normally. Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
