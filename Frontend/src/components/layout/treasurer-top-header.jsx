import { useState } from "react";
import { Bell, Search, User, ChevronDown, DollarSign } from "lucide-react";
import { useAuth } from "../../hooks/use-auth";
import { useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";

export default function TreasurerTopHeader() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };


  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-6">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Financial Status Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Collections: ₱45,280
            </span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" data-testid="button-notifications">
            <Bell className="h-5 w-5" />
            <Badge variant="destructive" className="absolute -top-1 -right-1 px-1 min-w-0 h-5 text-xs">
              3
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 px-3" data-testid="button-user-menu">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName || 'Treasurer'} {user?.lastName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">Treasurer</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Financial Manager</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="menu-profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="menu-financial-settings">
                <DollarSign className="mr-2 h-4 w-4" />
                <span>Financial Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
                data-testid="menu-logout"
              >
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}