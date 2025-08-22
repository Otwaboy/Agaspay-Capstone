import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { MessageSquare, AlertTriangle, Info, Calendar, Megaphone } from "lucide-react";

export default function ResidentAnnouncements() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['/api/resident/announcements'],
    initialData: [
      {
        id: 1,
        title: "Scheduled Water Service Interruption",
        content: "Water service will be temporarily interrupted on August 25, 2024, from 8:00 AM to 2:00 PM for pipeline maintenance in Zones 1 and 2.",
        type: "maintenance",
        priority: "high",
        datePosted: "2024-08-20",
        validUntil: "2024-08-25"
      },
      {
        id: 2,
        title: "New Payment Options Available",
        content: "We're excited to announce that you can now pay your water bills through PayMaya and GrabPay. Visit our payment portal to set up your preferred method.",
        type: "service",
        priority: "medium",
        datePosted: "2024-08-18",
        validUntil: "2024-09-18"
      },
      {
        id: 3,
        title: "Water Conservation Reminder",
        content: "Due to the ongoing dry season, we encourage all residents to practice water conservation. Please report any water leaks immediately.",
        type: "advisory",
        priority: "medium",
        datePosted: "2024-08-15",
        validUntil: "2024-09-30"
      },
      {
        id: 4,
        title: "Monthly Billing Cycle Update",
        content: "Your next billing statement will be available on September 1, 2024. Bills are due within 15 days of the statement date.",
        type: "billing",
        priority: "low",
        datePosted: "2024-08-12",
        validUntil: "2024-09-01"
      }
    ]
  });

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "maintenance": return AlertTriangle;
      case "service": return Info;
      case "advisory": return MessageSquare;
      case "billing": return Calendar;
      default: return Info;
    }
  };

  const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "maintenance": return "text-orange-600 bg-orange-100";
      case "service": return "text-blue-600 bg-blue-100";
      case "advisory": return "text-green-600 bg-green-100";
      case "billing": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const isExpiringSoon = (validUntil) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays > 0;
  };

  const isExpired = (validUntil) => {
    const today = new Date();
    const expiryDate = new Date(validUntil);
    return today > expiryDate;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-48" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter out expired announcements and sort by priority and date
  const activeAnnouncements = announcements
    ?.filter(announcement => !isExpired(announcement.validUntil))
    ?.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.datePosted) - new Date(a.datePosted);
    });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Megaphone className="h-5 w-5 mr-2 text-blue-600" />
            Announcements
          </CardTitle>
          <CardDescription>Important updates and notices</CardDescription>
        </div>
        {activeAnnouncements?.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {activeAnnouncements.length} active
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeAnnouncements?.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active announcements at this time</p>
            </div>
          ) : (
            activeAnnouncements?.slice(0, 4).map((announcement) => {
              const IconComponent = getTypeIcon(announcement.type);
              return (
                <div 
                  key={announcement.id} 
                  className={`p-4 border rounded-lg transition-colors hover:bg-gray-50 ${
                    isExpiringSoon(announcement.validUntil) ? 'border-yellow-300 bg-yellow-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getTypeColor(announcement.type)}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{announcement.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(announcement.priority)}>
                            {announcement.priority}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{announcement.content}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span>Posted: {new Date(announcement.datePosted).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="capitalize">{announcement.type}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isExpiringSoon(announcement.validUntil) && (
                            <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                              Expires Soon
                            </Badge>
                          )}
                          <span>Valid until: {new Date(announcement.validUntil).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {activeAnnouncements?.length > 4 && (
          <div className="mt-6 pt-4 border-t">
            <Button variant="outline" className="w-full">
              View All Announcements ({activeAnnouncements.length})
            </Button>
          </div>
        )}

        {/* Quick Stats */}
        {activeAnnouncements?.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-700 font-medium">High Priority</p>
                <p className="text-lg font-bold text-red-900">
                  {activeAnnouncements?.filter(a => a.priority === 'high').length || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700 font-medium">Expiring Soon</p>
                <p className="text-lg font-bold text-yellow-900">
                  {activeAnnouncements?.filter(a => isExpiringSoon(a.validUntil)).length || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}