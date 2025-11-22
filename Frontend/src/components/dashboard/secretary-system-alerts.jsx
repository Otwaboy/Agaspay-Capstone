import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Bell, ArrowRight, Calendar } from "lucide-react";
import { Link } from "wouter";
import apiClient from "../../lib/api";

export default function SecretarySystemAlerts() {
  const { data: announcementsData, isLoading } = useQuery({
    queryKey: ["pending-announcements"],
    queryFn: () => apiClient.getAnnouncements({ status: 'pending_approval' }),
  });

  const pendingAnnouncements = announcementsData?.announcements || [];
  
 
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-green-100 text-green-800";
      case "submitted": return "bg-yellow-100 text-yellow-800";
      case "pending": return "bg-blue-100 text-blue-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Pending Announcements
          </CardTitle>
          <CardDescription>Announcements awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-purple-600" />
              Pending Announcements
            </CardTitle>
            <CardDescription>Announcements awaiting approval</CardDescription>
          </div>
          <Link href="/secretary-dashboard/announcements">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {pendingAnnouncements.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No pending announcements</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="p-3 border rounded-lg transition-colors bg-white hover:bg-gray-50"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium text-gray-900">{announcement.title}</h4>
                      <Badge className={getStatusColor(announcement.status)}>
                        {announcement.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(announcement.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}