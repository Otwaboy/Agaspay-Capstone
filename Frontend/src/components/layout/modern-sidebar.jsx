import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../ui/button";
import { Droplets, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../../hooks/use-auth";

export default function ModernSidebar({ menuItems, title = "AGASPAY", subtitle }) {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const mainMenuItems = menuItems.filter(item => !item.isOther && !item.isSettings);
  const otherMenuItems = menuItems.filter(item => item.isOther);
  const settingsItems = menuItems.filter(item => item.isSettings);

  return (
    <div className="flex flex-col h-full bg-[#2C3E50] text-white shadow-2xl w-64">
      {/* Logo Section */}
      <div className="flex items-center px-6 py-6 border-b border-white/10">
        <div className="bg-blue-500 p-2.5 rounded-xl shadow-lg">
          <Droplets className="h-6 w-6 text-white" />
        </div>
        <div className="ml-3">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-xs text-blue-200">{subtitle || "Water Management"}</p>
        </div>
      </div>

      {/* Main Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-xs font-semibold text-blue-200 mb-3 px-2 uppercase tracking-wider">
            Main Menu
          </p>
          <nav className="space-y-1">
            {mainMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={index} href={item.href}>
                  <a
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${isActive ? "text-white" : item.color || "text-gray-400"}`} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Other Menu */}
        {otherMenuItems.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-blue-200 mb-3 px-2 uppercase tracking-wider">
              Other Menu
            </p>
            <nav className="space-y-1">
              {otherMenuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={index} href={item.href}>
                    <a
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-blue-500 text-white shadow-lg"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-white" : item.color || "text-gray-400"}`} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}

        {/* Help & Settings */}
        {settingsItems.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-blue-200 mb-3 px-2 uppercase tracking-wider">
              Help & Settings
            </p>
            <nav className="space-y-1">
              {settingsItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                
                return (
                  <Link key={index} href={item.href}>
                    <a
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? "bg-blue-500 text-white shadow-lg"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-white" : item.color || "text-gray-400"}`} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User Profile & Logout */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold text-white">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-blue-200 capitalize">
              {user?.role || "Member"}
            </p>
          </div>
        </div>
        <Button
          onClick={handleLogout}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
