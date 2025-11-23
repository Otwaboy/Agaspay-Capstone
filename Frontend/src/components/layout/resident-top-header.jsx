import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  MessageSquare,
  ExternalLink
} from "lucide-react";

import { useAuth } from "../../hooks/use-auth";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";

export default function ResidentTopHeader() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getAnnouncements({
        status: 'approved',
        limit: 3,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });
      setAnnouncements(response.announcements || []);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityBadge = (priority) => {
    if (!priority) return { text: 'Normal', color: 'text-blue-600' };

    const priorityMap = {
      'high': { text: 'High Priority', color: 'text-red-600' },
      'medium': { text: 'Medium Priority', color: 'text-orange-600' },
      'low': { text: 'Low Priority', color: 'text-green-600' },
      'normal': { text: 'Normal', color: 'text-blue-600' }
    };

    return priorityMap[priority.toLowerCase()] || { text: priority, color: 'text-gray-600' };
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:ml-0">
      <div className="flex items-center justify-between px-6 py-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">


        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer relative lg:border lg:border-gray-200 border-0 h-11 w-11 lg:h-10 lg:w-10 p-0"
                data-testid="button-notifications"
              >
                <Bell className="cursor-pointer h-5 w-5 lg:h-4 lg:w-4" />
                {announcements.length > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-0 -right-0 h-4 w-4 flex items-center justify-center text-xs p-0"
                  >
                    {announcements.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>

            {/* display when clicking the notification bell */}

            <DropdownMenuContent align="end" className="w-56 sm:w-64 md:w-72 lg:w-80">
              <DropdownMenuLabel>Announcements</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {loading ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Loading announcements...
                </div>
              ) : announcements.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  No announcements available
                </div>
              ) : (
                <>
                  {announcements.map((announcement) => (
                    <DropdownMenuItem
                      key={announcement.announcement_id}
                      className="flex items-start space-x-3 p-3 cursor-pointer"
                    >
                      <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">
                          {announcement.title}
                        </p>
                        <p className={`text-xs mt-1 font-medium ${getPriorityBadge(announcement.priority).color}`}>
                          {getPriorityBadge(announcement.priority).text}
                        </p>
                      </div>
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setLocation('/resident-dashboard/announcements')}
                    className="flex items-center justify-center p-3 text-blue-600 hover:text-blue-700 cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    <span className="font-medium">View All Announcements</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>


          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer flex items-center space-x-2 px-3 lg:border lg:border-gray-200 border-0 h-11 lg:h-10"
                data-testid="button-user-menu"
              >
                <div className="w-10 h-10 lg:w-6 lg:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm lg:text-xs font-large">
                    {user?.fullname?.charAt(0)?.toUpperCase() || 'R'}
                  </span>
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  {user?.fullname || 'Resident'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation('/resident-dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/resident-dashboard/settings')}>

                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>

              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}