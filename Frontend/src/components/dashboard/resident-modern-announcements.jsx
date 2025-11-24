import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Megaphone, Calendar, AlertTriangle, Info, Wrench } from "lucide-react";
import { apiClient } from "../../lib/api";

export default function ResidentModernAnnouncements() {
  const { data, isLoading } = useQuery({
    queryKey: ["resident-announcements"],
    queryFn: () => apiClient.getAnnouncements({ status: "published" }),
  });

  const announcements = data?.announcements?.slice(0, 5) || [];

  const getCategoryIcon = (category) => {
    const icons = {
      'Maintenance': Wrench,
      'Alert': AlertTriangle,
      'Information': Info,
      'Event': Calendar,
      'Billing': Calendar
    };
    return icons[category] || Info;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Maintenance': 'bg-orange-50 text-orange-700 border-orange-200',
      'Alert': 'bg-red-50 text-red-700 border-red-200',
      'Water Schedule': 'bg-blue-50 text-blue-700 border-blue-200',
      'Event': 'bg-purple-100 text-purple-700 border-purple-200',
      'Billing': 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[category] || 'bg-green-50 text-gray-700 border-gray-200';
  };

  const getPriorityBadge = (priority) => { 
    const styles = {
      'high': 'bg-red-600 text-white',
      'normal': 'bg-blue-600 text-white',
      'low': 'bg-gray-600 text-white'
    };
    return styles[priority] || 'bg-gray-600 text-white';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-indigo-600" />
          Latest Announcements
        </CardTitle>
        <p className="text-sm text-gray-500 mt-1">Important updates and notices</p>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-lg">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-8">
            <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No announcements</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {announcements.map((announcement) => {
              const Icon = getCategoryIcon(announcement.category);
              const categoryColor = getCategoryColor(announcement.category);
              
              return (
                <div
                  key={announcement._id}
                  className={`border-2 ${categoryColor} rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${categoryColor}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                          {announcement.title}
                        </h3>
                        {announcement.priority === 'high' && (
                          <Badge className={getPriorityBadge(announcement.priority)}>
                            {announcement.priority}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(announcement.published_date || announcement.createdAt).toLocaleDateString()}</span>
                        {announcement.valid_until && (
                          <>
                            <span>•</span>
                            <span>Valid until {new Date(announcement.valid_until).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
