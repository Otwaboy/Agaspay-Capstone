import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  Home,
  Users,
  Droplets,
  FileText,
  Settings,
  LogOut,
  Menu,
  UserPlus,
  Calendar,
  BarChart3,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";

const menuItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/",
    color: "text-blue-600"
  },
  {
    icon: Users,
    label: "User Management",
    href: "/admin-dashboard/users",
    color: "text-green-600"
  },
  {
    icon: UserPlus,
    label: "Personnel",
    href: "/admin-dashboard/personnel",
    color: "text-purple-600"
  },
  {
    icon: Droplets,
    label: "Water Connections",
    href: "/admin-dashboard/connections",
    color: "text-cyan-600"
  },
  {
    icon: FileText,
    label: "Billing & Payments",
    href: "/admin-dashboard/billing",
    color: "text-orange-600"
  },
  {
    icon: BarChart3,
    label: "Reports",
    href: "/admin-dashboard/reports",
    color: "text-indigo-600"
  },
  {
    icon: Calendar,
    label: "Scheduling",
    href: "/admin-dashboard/scheduling",
    color: "text-teal-600"
  },
  {
    icon: AlertTriangle,
    label: "Incidents",
    href: "/admin-dashboard/incidents",
    color: "text-red-600"
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/admin-dashboard/settings",
    color: "text-gray-600"
  }
];

//sidebar sa desktop
function SidebarContent() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      
      {/* Logo Section */}
      <div className="flex items-center px-6 py-5.5 border-b border-b-gray-200">
        <div className="flex items-center">
          <div className="bg-blue-500 p-2 rounded-4xl">
            <Droplets className="h-9 w-9 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="text-xl font-bold text-gray-900">AGASPAY</h2>
            <p className="text-xs text-gray-500">Waterworks Admin</p>
          </div>
        </div>
      </div>
      {/* Logo Section */}


      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = location === item.href;
          const IconComponent = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`cursor-pointer w-full justify-start text-left h-12 ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" 
                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <IconComponent className={`mr-3 h-5 w-5 ${isActive ? "text-blue-600" : item.color}`} />
                <span className="font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center px-3 py-2 mb-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.username?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || 'Administrator'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role || 'admin'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="cursor-pointer w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          data-testid="button-logout"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

//mobile sidebar
export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="ml-5 absolute  mt-5 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 bg-white shadow-md"
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        {/* pop up when clicking the menu mao ni mugawas */}
        <SheetContent side="left" className="p-0 w-72">
          <SidebarContent />
        </SheetContent>

      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 bg-white shadow-lg">
        <SidebarContent />
      </div>
    </>
  );
}