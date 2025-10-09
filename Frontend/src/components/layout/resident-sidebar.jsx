import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  Home,
  CreditCard,
  FileText,
  Wrench,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Menu,
  Droplets,
  Receipt,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";

const residentMenuItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/resident",
    color: "text-blue-600"
  },
  {
    icon: CreditCard,
    label: "Bills & Payments",
    href: "/resident/bills",
    color: "text-green-600"
  },
  {
    icon: Receipt,
    label: "Payment History",
    href: "/resident/payment-history",
    color: "text-purple-600"
  },
  {
    icon: Droplets,
    label: "Water Usage",
    href: "/resident/usage",
    color: "text-blue-500"
  },
  {
    icon: Wrench,
    label: "Service Requests",
    href: "/resident/service-requests",
    color: "text-orange-600"
  },
  {
    icon: AlertTriangle,
    label: "Report Issue",
    href: "/resident/report-issue",
    color: "text-red-600"
  },
  {
    icon: MessageSquare,
    label: "Announcements",
    href: "/resident/announcements",
    color: "text-indigo-600"
  },
  {
    icon: User,
    label: "Profile",
    href: "/resident/profile",
    color: "text-gray-600"
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/resident/settings",
    color: "text-gray-600"
  }
];

function ResidentSidebarContent() {
  const [location, setLocation] = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-bold text-gray-900">AGASPAY</h2>
            <p className="text-xs text-gray-500">Resident Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {residentMenuItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-11 px-4 ${
                  isActive 
                    ? "bg-blue-600 hover:bg-blue-700 text-white" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-').replace('&', 'and')}`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : item.color}`} />
                <span className="font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info and Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center mb-3 px-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.username || 'Resident'
              }
            </p>
            <p className="text-xs text-gray-500 truncate">Water Service Customer</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          data-testid="button-logout"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function ResidentSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-40"
            data-testid="button-mobile-menu"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <ResidentSidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <ResidentSidebarContent />
        </div>
      </div>
    </>
  );
}