import React, { useState } from "react";
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
    color: "text-blue-600"
  },
  {
    title: "Meter Readings",
    icon: Gauge,
    href: "/meter-reader-dashboard/readings",
    color: "text-purple-600"
  }, 
  {
    title: "Reading History",
    icon: ClipboardList,
    href: "/meter-reader-dashboard/history",
    color: "text-blue-500"
  },
  {
    title: "Zone Management",
    icon: MapPin,
    href: "/meter-reader-dashboard/zones",
    color: "text-cyan-600"
  },
  {
    title: "Service Request",
    icon: AlertTriangle,
    color: "text-red-600",
    subItems: [
      { title: "Report Issue", href: "/meter-reader-dashboard/report-issue" },
      { title: "Report History", href: "/meter-reader-dashboard/report-issue-history" },
    ]
  },
  {
    title: "Profile",
    icon: User,
    href: "/meter-reader-dashboard/profile",
    color: "text-indigo-600"
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

  const toggleExpanded = (title) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActive = (href) =>
    location === href || (href !== "/meter-reader-dashboard" && location.startsWith(href));

  const isParentActive = (subItems) =>
    subItems?.some(item => isActive(item.href));

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-lg">
      {/* Logo */}
      <div className="flex items-center px-6 py-5.5 border-gray-200">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Droplets className="h-6 w-6 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-bold text-gray-900">AGASPAY</h2>
            <p className="text-xs text-gray-500">Meter Reader Portal</p>
          </div>
        </div>
      </div> 

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {residentMenuItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return item.subItems ? (
            <div key={item.title}>
              <button
                onClick={() => toggleExpanded(item.title)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isParentActive(item.subItems)
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center">
                  <Icon className={`mr-3 h-5 w-5 ${isParentActive(item.subItems) ? "text-blue-600" : item.color}`} />
                  <span>{item.title}</span>
                </div>
                {expandedItems[item.title] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {expandedItems[item.title] && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.subItems.map(sub => (
                    <Link key={sub.href} href={sub.href}>
                      <span className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(sub.href)
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}>
                        {sub.title}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link key={item.href} href={item.href}>
              <Button
                variant={active ? "secondary" : "ghost"}
                className={`w-full justify-start h-12 ${active ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600" : "hover:bg-gray-50 text-gray-700 hover:text-gray-900"}`}
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
        <div className="flex items-center px-2 mb-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.username || 'Personnel'}
            </p>
            <p className="text-xs text-gray-500 truncate">Barrangay Personnel</p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
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
          <Button variant="outline" size="icon" className="lg:hidden fixed top-4 left-4 z-40">
            <Menu className="h-5 w-5" />
          </Button>
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
