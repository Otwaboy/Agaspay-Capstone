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
  CreditCard,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";

export default function ResidentTopHeader() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
     <header className="bg-gradient-to-br from-blue-50 via-white to-cyan-50  border-gray-200 lg:ml-0">
       <div className="flex items-center justify-between px-6 py-6">
        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-lg">
          <div className="relative w-full">

          </div> 
        </div> 

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 md:space-x-4 ml-auto md:ml-0">
          {/* Quick Pay Button */}
          <Button 
            variant="outline" 
            className="hidden md:flex items-center space-x-2 text-green-600 border-green-200 hover:bg-green-50"
            onClick={() => window.dispatchEvent(new Event("openPayBillModal"))}
            data-testid="button-quick-pay"
          >
            <CreditCard className="h-4 w-4" />
            <span>Quick Pay</span>
          </Button>

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
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start space-x-3 p-3">
                <CreditCard className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Bill Due Soon</p>
                  <p className="text-xs text-gray-500 mt-1">Your water bill for this month is due in 3 days</p>
                  <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start space-x-3 p-3">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                  <p className="text-xs text-gray-500 mt-1">Your payment of ₱450.00 has been processed</p>
                  <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-start space-x-3 p-3">
                <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">Service Maintenance</p>
                  <p className="text-xs text-gray-500 mt-1">Scheduled water service maintenance on Friday</p>
                  <p className="text-xs text-gray-400 mt-1">2 days ago</p>
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
                <div className="bg-blue-100 p-1 rounded-full">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user?.username || 'Resident'
                    }
                  </p>
                  <p className="text-xs text-gray-500">Account: WS-2024-001</p>
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
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Methods
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Account Preferences
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