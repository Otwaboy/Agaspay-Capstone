import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Check, X, AlertCircle, Megaphone, Calendar, User } from "lucide-react";
import { announcementsApi } from "../../services/adminApi";
import { toast } from "sonner";

export default function PendingAnnouncements() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['pending-announcements'],
    queryFn: () => announcementsApi.getPending(),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => announcementsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Announcement approved and published');
    },
    onError: () => {
      toast.error('Failed to approve announcement');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => announcementsApi.reject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Announcement rejected');
    },
    onError: () => {
      toast.error('Failed to reject announcement');
    }
  });

  const announcements = data?.announcements || [];

  const getCategoryColor = (category) => {
    const colors = {
      'Maintenance': 'bg-orange-100 text-orange-700',
      'Event': 'bg-purple-100 text-purple-700',
      'Information': 'bg-blue-100 text-blue-700',
      'Billing': 'bg-green-100 text-green-700',
      'Alert': 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-700',
      'normal': 'bg-blue-100 text-blue-700',
      'low': 'bg-gray-100 text-gray-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-lg font-semibold">Pending Announcements</CardTitle>
        </div>
        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
          {announcements.length} pending
        </Badge>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <Megaphone className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No pending announcements</p>
            <p className="text-xs text-gray-500 mt-1">All announcements have been reviewed</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {announcements.map((announcement) => (
              <div
                key={announcement._id}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-indigo-100 text-indigo-600 text-sm font-medium">
                        {announcement.created_by?.first_name?.[0] || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        {announcement.title}
                      </h3>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {announcement.content}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={`text-xs ${getCategoryColor(announcement.category)}`}>
                          {announcement.category}
                        </Badge>
                        <Badge className={`text-xs ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {announcement.created_by?.first_name} {announcement.created_by?.last_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(announcement._id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectMutation.mutate(announcement._id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
