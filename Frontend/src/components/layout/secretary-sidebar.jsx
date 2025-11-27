import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
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
  Unplug,
  Power,
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";

const secretaryMenuItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/secretary-dashboard",
    color: "text-gray-600"
  },
  {
    icon: Users,
    label: "Resident Management",
    color: "text-gray-600",
    isParent: true,
    subItems: [
      {
        icon: UserPlus,
        label: "Add Residents",
        href: "/secretary-dashboard/residents",
        color: "text-gray-600"

      },
      {
        icon: AlertTriangle,
        label: "Deliquency List",
        href: "/secretary-dashboard/deliquency-list",
        color: "text-gray-600"
      },
    ]
  },
  {
    icon: AlertTriangle,
    label: "Incident Reports",
    href: "/secretary-dashboard/applications",
    color: "text-gray-600"
  },
  {
    icon: ClipboardList,
    label: "Task Management",
    color: "text-gray-600",
    isParent: true,
    subItems: [
      {
        icon: Unplug,
        label: "Schedule Disconnection",
        href: "/secretary-dashboard/schedule-disconnection",
        color: "text-gray-600"
      },
      {
        icon: Power,
        label: "Schedule Reconnection",
        href: "/secretary-dashboard/schedule-reconnection",
        color: "text-gray-600"
      },
    ]
  },
  {
    icon: Calendar,
    label: "Assignments",
    href: "/secretary-dashboard/appointments",
    color: "text-gray-600"
  },
  {
    icon: MessageSquare,
    label: "Announcements",
    href: "/secretary-dashboard/announcements",
    color: "text-gray-600"
  },
  {
    icon: User,
    label: "Profile",
    href: "/secretary-dashboard/profile",
    color: "text-gray-600"
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
  const [expandedItems, setExpandedItems] = useState({});
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Auto-expand dropdowns if a subitem is active
  useEffect(() => {
    const newExpandedItems = {};
    secretaryMenuItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(sub => location === sub.href);
        if (hasActiveSubItem) {
          newExpandedItems[item.label] = true;
        }
      }
    });
    setExpandedItems(prev => ({ ...prev, ...newExpandedItems }));
  }, [location]);

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setLocation("/login");
  };

  const toggleExpanded = (label) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-5.5 border-b border-b-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-lg">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900">AGASPAY</h1>
            <p className="text-xs text-blue-600">Secretary Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {secretaryMenuItems.map((item) => {
          const Icon = item.icon;

          if (item.isParent) {
            const isExpanded = expandedItems[item.label];
            const hasActiveSubItem = item.subItems?.some(sub => location === sub.href);

            return (
              <div key={item.label}>
                <Button
                  variant="ghost"
                  onClick={() => toggleExpanded(item.label)}
                  className={`cursor-pointer w-full justify-start text-left h-12 ${
                    hasActiveSubItem
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${hasActiveSubItem ? "text-blue-600" : item.color}`} />
                  <span className="font-medium flex-1">{item.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>

                {isExpanded && item.subItems && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isActive = location === subItem.href;
                      const SubIcon = subItem.icon;

                      return (
                        <Link key={subItem.href} href={subItem.href}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={`cursor-pointer w-full justify-start text-left h-10 text-sm ${
                              isActive
                                ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                                : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                            }`}
                            data-testid={`nav-${subItem.label.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <SubIcon className={`mr-3 h-4 w-4 ${isActive ? "text-blue-600" : subItem.color}`} />
                            <span>{subItem.label}</span>
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = location === item.href;
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
                <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-600" : item.color}`} />
                <span className="font-medium">{item.label}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Info and Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center px-3 py-2 mb-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.fullname.charAt(0)?.toUpperCase() || 'S'}
            </span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.fullname || 'Secretary'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role.toUpperCase() || 'secretary'}
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

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out? You'll need to log in again to access your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLogoutConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SecretarySidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <button className="lg:hidden absolute top-6 left-4 z-40 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72">
          <SecretarySidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <SecretarySidebarContent />
        </div>
      </div>
    </>
  );
} 