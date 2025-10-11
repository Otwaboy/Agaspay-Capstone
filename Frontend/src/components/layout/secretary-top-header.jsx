import React from "react";
import { useLocation } from "wouter";
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
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";

export default function SecretaryTopHeader() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };
 
  return (
     <header className="bg-white shadow-sm border-b border-gray-200 lg:ml-0">
      <div className="flex items-center justify-between px-6 py-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          {/* <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search residents, documents, applications..."
              className="pl-10 pr-4 w-full"
              data-testid="input-search"
            />
          </div> */}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="relative"
                data-testid="button-notifications"
              >
                <Bell className="h-4 w-4" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0"
                >
                  5
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start space-x-3 p-3">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">New Application</p>
                  <p className="text-xs text-gray-500 mt-1">Water connection request from Maria Santos</p>
                  <p className="text-xs text-gray-400 mt-1">10 minutes ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start space-x-3 p-3">
                <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Document Ready</p>
                  <p className="text-xs text-gray-500 mt-1">Barangay certificate for Juan Dela Cruz is ready</p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start space-x-3 p-3">
                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Urgent: Missing Documents</p>
                  <p className="text-xs text-gray-500 mt-1">Pedro Rodriguez application needs additional documents</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button variant="outline" className="w-full text-xs">
                  View All Notifications
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="flex items-center space-x-2 px-3"
                data-testid="button-user-menu"
              >
                <div className="bg-green-100 p-1 rounded-full">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.username || 'Secretary'
                    }
                  </p>
                  <p className="text-xs text-gray-500">Barangay Secretary</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}