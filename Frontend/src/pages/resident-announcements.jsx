import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import apiClient from "../lib/api";
import {
  Megaphone,
  Calendar,
  AlertTriangle,
  Info,
  Droplets,
  Bell,
  MessageSquare
} from "lucide-react";

export default function ResidentAnnouncements() {
  const [filterCategory, setFilterCategory] = useState("all");

  // Fetch announcements using API client
  const { data, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => apiClient.getAnnouncements(),
  });

  // Filter to show only PUBLISHED announcements to residents
  const allAnnouncements = data?.announcements || [];
  const publishedAnnouncements = allAnnouncements.filter(
    (ann) => ann.status === "published"
  );

  // Apply category filter
  const announcementList = filterCategory === "all"
    ? publishedAnnouncements
    : publishedAnnouncements.filter((ann) => ann.category === filterCategory);

  // Map backend categories to UI configuration
  const getCategoryConfig = (category) => {
    switch (category) {
      case "Maintenance":
        return {
          icon: AlertTriangle,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          badgeClass: "bg-orange-100 text-orange-800"
        };
      case "Water Schedule":
        return {
          icon: Droplets,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          badgeClass: "bg-blue-100 text-blue-800"
        };
      case "Alert":
        return {
          icon: Bell,
          color: "text-red-600",
          bgColor: "bg-red-100",
          badgeClass: "bg-red-100 text-red-800"
        };
      default:
        return {
          icon: MessageSquare,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          badgeClass: "bg-gray-100 text-gray-800"
        };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-100 text-red-800 ml-2">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800 ml-2">High Priority</Badge>;
      case "normal":
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-announcements-title">
                Announcements
              </h1>
              <p className="text-gray-600 mt-2">
                Stay updated with barangay water service news and announcements
              </p>
            </div>

            {/* Filter Badges */}
            <div className="mb-6 flex flex-wrap gap-2">
              <Badge
                variant={filterCategory === "all" ? "default" : "outline"}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => setFilterCategory("all")}
              >
                All ({publishedAnnouncements.length})
              </Badge>
              <Badge
                variant={filterCategory === "Water Schedule" ? "default" : "outline"}
                className="cursor-pointer hover:bg-blue-50"
                onClick={() => setFilterCategory("Water Schedule")}
              >
                Water Schedule ({publishedAnnouncements.filter(a => a.category === "Water Schedule").length})
              </Badge>
              <Badge
                variant={filterCategory === "Maintenance" ? "default" : "outline"}
                className="cursor-pointer hover:bg-orange-50"
                onClick={() => setFilterCategory("Maintenance")}
              >
                Maintenance ({publishedAnnouncements.filter(a => a.category === "Maintenance").length})
              </Badge>
              <Badge
                variant={filterCategory === "Alert" ? "default" : "outline"}
                className="cursor-pointer hover:bg-red-50"
                onClick={() => setFilterCategory("Alert")}
              >
                Alerts ({publishedAnnouncements.filter(a => a.category === "Alert").length})
              </Badge>
            </div>

            {/* Announcements List */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : announcementList.length === 0 ? (
              <Card>
                <CardContent className="py-16">
                  <div className="text-center">
                    <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Announcements
                    </h3>
                    <p className="text-gray-600">
                      There are no announcements at the moment. Check back later for updates.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {announcementList.map((announcement) => {
                const config = getCategoryConfig(announcement.category);
                const Icon = config.icon;

                return (
                  <Card key={announcement._id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-3 rounded-lg ${config.bgColor}`}>
                            <Icon className={`h-6 w-6 ${config.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap">
                              <CardTitle className="text-lg">
                                {announcement.title}
                              </CardTitle>
                              {getPriorityBadge(announcement.priority)}
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(announcement.createdAt).toLocaleDateString('en-PH', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span>•</span>
                              <span>{announcement.created_by?.first_name || 'Admin'} {announcement.created_by?.last_name || ''}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={config.badgeClass}>
                          {announcement.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {announcement.content}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
