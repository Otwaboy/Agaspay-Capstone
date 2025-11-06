import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Receipt, Droplets, AlertTriangle, MessageSquare, User, Settings } from "lucide-react";

const residentMenuItems = [
  {
    icon: Home,
    label: "Dashboard",
    href: "/resident-dashboard",
    color: "text-blue-600"
  },
  {
    icon: Receipt,
    label: "Payment History",
    href: "/resident-dashboard/payment-history",
    color: "text-purple-600"
  },
  {
    icon: Droplets,
    label: "Water Usage",
    href: "/resident-dashboard/usage",
    color: "text-blue-500"
  },
  {
    icon: AlertTriangle,
    label: "Reported Issue",
    href: "/resident-dashboard/report-issue",
    color: "text-red-600"
  },
  {
    icon: MessageSquare,
    label: "Announcements",
    href: "/resident-dashboard/announcements",
    color: "text-indigo-600"
  },
  {
    icon: User,
    label: "Profile",
    href: "/resident-dashboard/profile",
    color: "text-gray-600"
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/resident-dashboard/settings",
    color: "text-gray-600"
  }
];

export default function ResidentBottomBar() {
  const [location] = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-inner z-50">
      <ul className="flex justify-around items-center py-2">
        {residentMenuItems.slice(0, 5).map((item) => { // show first 5 items
          const isActive = location === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link href={item.href}>
                <div className="flex flex-col items-center justify-center text-center">
                  <Icon className={`h-6 w-6 mb-1 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                  <span className={`text-xs font-medium ${isActive ? "text-blue-600" : "text-gray-400"}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
