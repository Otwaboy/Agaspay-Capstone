import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import {
  Megaphone,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle,
  Bell
} from "lucide-react";

export default function ResidentAnnouncements() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ['/api/v1/announcements'],
    queryFn: async () => {
      try {
        // Try to fetch announcements from backend
        const res = await fetch('/api/v1/announcements');
        if (res.ok) {
          const data = await res.json();
          return data;
        }
        // Return empty array if endpoint doesn't exist yet
        return [];
      } catch (error) {
        console.log('Announcements endpoint not available yet', error);
        return [];
      }
    },
    retry: 1
  });

  const announcementList = announcements || [];

  const getTypeConfig = (type) => {
    switch (type) {
      case "maintenance":
        return {
          icon: AlertTriangle,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          badgeClass: "bg-orange-100 text-orange-800"
        };
      case "announcement":
        return {
          icon: Megaphone,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          badgeClass: "bg-blue-100 text-blue-800"
        };
      case "advisory":
        return {
          icon: Info,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          badgeClass: "bg-purple-100 text-purple-800"
        };
      case "schedule":
        return {
          icon: Calendar,
          color: "text-green-600",
          bgColor: "bg-green-100",
          badgeClass: "bg-green-100 text-green-800"
        };
      case "event":
        return {
          icon: CheckCircle,
          color: "text-indigo-600",
          bgColor: "bg-indigo-100",
          badgeClass: "bg-indigo-100 text-indigo-800"
        };
      default:
        return {
          icon: Bell,
          color: "text-gray-600",
          bgColor: "bg-gray-100",
          badgeClass: "bg-gray-100 text-gray-800"
        };
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === "high") {
      return <Badge className="bg-red-100 text-red-800 ml-2">Important</Badge>;
    }
    return null;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6">
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
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">All</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-orange-50">Maintenance</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-blue-50">Announcements</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-purple-50">Advisories</Badge>
              <Badge variant="outline" className="cursor-pointer hover:bg-green-50">Schedules</Badge>
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
                const config = getTypeConfig(announcement.type);
                const Icon = config.icon;

                return (
                  <Card key={announcement.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-3 rounded-lg ${config.bgColor}`}>
                            <Icon className={`h-6 w-6 ${config.color}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center">
                              <CardTitle className="text-lg">
                                {announcement.title}
                              </CardTitle>
                              {getPriorityBadge(announcement.priority)}
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(announcement.date).toLocaleDateString('en-PH', {
                                  month: 'long',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                              <span>•</span>
                              <span>{announcement.author}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={config.badgeClass}>
                          {announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">
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
