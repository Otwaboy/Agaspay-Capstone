import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  Home,
  Users,
  FileText,
  Calendar,
  ClipboardList,
  MessageSquare,
  LogOut,
  Menu,
  AlertTriangle,
  UserPlus,
  Settings,
  Droplets,
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";

const secretaryMenuItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/secretary-dashboard",
    color: "text-blue-600"
  },
  {
    icon: Users,
    label: "Residents",
    href: "/secretary-dashboard/residents",
    color: "text-green-600"
  },
  {
    icon: UserPlus,
    label: "Registration",
    href: "/secretary-dashboard/registration",
    color: "text-purple-600"
  },
  {
    icon: FileText,
    label: "Documents",
    href: "/secretary-dashboard/documents",
    color: "text-orange-600"
  },
  {
    icon: AlertTriangle,
    label: "Incident Reports",
    href: "/secretary-dashboard/applications",
    color: "text-cyan-600"
  },
  {
    icon: Calendar,
    label: "Assignments",
    href: "/secretary-dashboard/appointments",
    color: "text-teal-600"
  },
  {
    icon: MessageSquare,
    label: "Announcements",
    href: "/secretary-dashboard/announcements",
    color: "text-indigo-600"
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/secretary-dashboard/settings",
    color: "text-gray-600"
  }
];

function SecretarySidebarContent() {
  const [location, setLocation] = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-5.5 border-b border-b-gray-200">
        <div className="flex items-center">
          <div className="bg-green-600 p-2 rounded-lg">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-bold text-gray-900">AGASPAY</h2>
            <p className="text-xs text-gray-500">Secretary Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {secretaryMenuItems.map((item) => {
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
                data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
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
          <div className="bg-green-100 p-2 rounded-full">
            <Users className="h-4 w-4 text-green-600" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.username || 'Secretary'
              }
            </p>
            <p className="text-xs text-gray-500 truncate">Barangay Secretary</p>
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

export default function SecretarySidebar() {
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
          <SecretarySidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <SecretarySidebarContent />
        </div>
      </div>
    </>
  );
} 