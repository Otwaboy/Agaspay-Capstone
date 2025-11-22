import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { AlertTriangle, MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import apiClient from "../../lib/api";

export default function SecretaryRecentActivities() {
  const { data: incidentData, isLoading } = useQuery({
    queryKey: ["recent-incident-reports"],
    queryFn: () => apiClient.getIncidentReports(),
  });

  // Get only the 5 most recent incidents
  const recentIncidents = incidentData?.reports?.slice(0, 5) || [];
  console.log(recentIncidents);
  

  const getUrgencyColor = (urgency) => {
    const level = urgency?.toLowerCase();

    if (level === "critical") {
      return "bg-red-100 text-red-800 border-red-200";
    }
    if (level === "high") {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
    if (level === "medium") {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    if (level === "low") {
      return "bg-green-100 text-green-800 border-green-200";
    }

    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Incident Reports</CardTitle>
          <CardDescription>Latest reported incidents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-4 p-3 rounded-lg bg-gray-50">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Incident Reports</CardTitle>
          <CardDescription>Latest reported incidents (Read Only)</CardDescription>
        </div>
        <Link href="/secretary-dashboard/incident-reports">
          <Button variant="outline" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {recentIncidents.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No incident reports found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentIncidents.map((incident) => (
              <div key={incident._id || incident.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border">
                <div className="p-2 rounded-full bg-red-100 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900">{incident.type || "Incident Report"}</p>
                    <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${getUrgencyColor(incident.urgency_level)}`}>
                      {incident.urgency_level ? incident.urgency_level.charAt(0).toUpperCase() + incident.urgency_level.slice(1) : "Medium"}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-gray-600">
                      Reported by: <span className="font-medium text-gray-900">{incident.reported_by || "N/A"}</span>
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(incident.reported_at || incident.reported_date)}</p>
                  </div>
                  {incident.location && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {incident.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}