import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import {
  Home,
  Droplets,
  AlertTriangle,
  User,
  Settings,
  Gauge,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  MapPin,
  ClipboardList
} from "lucide-react";
import { useAuth } from "../../hooks/use-auth";

const residentMenuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/meter-reader-dashboard",
    color: "text-gray-600"
  },
  {
    title: "Meter Readings",
    icon: Gauge,
    href: "/meter-reader-dashboard/readings",
    color: "text-gray-600"
  },
  {
    title: "Reading History",
    icon: ClipboardList,
    href: "/meter-reader-dashboard/history",
    color: "text-gray-600"
  },
  {
    title: "Zone Management",
    icon: MapPin,
    href: "/meter-reader-dashboard/zones",
    color: "text-gray-600"
  },
  {
    title: "Service Request",
    icon: AlertTriangle,
    color: "text-gray-600",
    subItems: [
      { title: "Report Issue", href: "/meter-reader-dashboard/report-issue" },
      { title: "Report History", href: "/meter-reader-dashboard/report-issue-history" },
    ]
  },
  {
    title: "Profile",
    icon: User,
    href: "/meter-reader-dashboard/profile",
    color: "text-gray-600"
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/meter-reader-dashboard/settings",
    color: "text-gray-600"
  },

];

function MeterReaderSidebarContent() {
  const [location, setLocation] = useLocation();
  const { logout, user } = useAuth();
  const [expandedItems, setExpandedItems] = useState({});

  const isActive = (href) =>
    location === href || (href !== "/meter-reader-dashboard" && location.startsWith(href));

  // Auto-expand dropdowns if a subitem is active
  useEffect(() => {
    const newExpandedItems = {};
    residentMenuItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(sub => isActive(sub.href));
        if (hasActiveSubItem) {
          newExpandedItems[item.title] = true;
        }
      }
    });
    setExpandedItems(prev => ({ ...prev, ...newExpandedItems }));
  }, [location]);

  const toggleExpanded = (title) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isParentActive = (subItems) =>
    subItems?.some(item => isActive(item.href));

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center px-6 py-5.5 border-b border-b-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-lg">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-blue-900">AGASPAY</h1>
            <p className="text-xs text-blue-600">Meter Reader Portal</p>
          </div>
        </div>
      </div> 

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {residentMenuItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return item.subItems ? (
            <div key={item.title}>
              <Button
                variant="ghost"
                onClick={() => toggleExpanded(item.title)}
                className={`cursor-pointer w-full justify-start text-left h-12 ${
                  isParentActive(item.subItems)
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isParentActive(item.subItems) ? "text-blue-600" : item.color}`} />
                <span className="font-medium flex-1">{item.title}</span>
                {expandedItems[item.title] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>

              {expandedItems[item.title] && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems.map(sub => {
                    const isSubActive = isActive(sub.href);
                    return (
                      <Link key={sub.href} href={sub.href}>
                        <Button
                          variant={isSubActive ? "secondary" : "ghost"}
                          className={`cursor-pointer w-full justify-start text-left h-10 text-sm ${
                            isSubActive
                              ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                              : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                          }`}
                        >
                          {sub.title}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <Link key={item.href} href={item.href}>
              <Button
                variant={active ? "secondary" : "ghost"}
                className={`cursor-pointer w-full justify-start text-left h-12 ${
                  active
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${active ? "text-blue-600" : item.color}`} />
                <span className="font-medium">{item.title}</span>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center px-3 py-2 mb-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.username?.charAt(0)?.toUpperCase() || 'M'}
            </span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.username || 'Meter Reader'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role || 'meter reader'}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          variant="outline"
          className="cursor-pointer w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function MeterReaderSidebar() {
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
          <MeterReaderSidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-72">
          <MeterReaderSidebarContent />
        </div>
      </div>
    </>
  );
}
