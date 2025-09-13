import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Route, 
  Gauge, 
  ClipboardList, 
  MapPin, 
  AlertTriangle,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  Navigation,
  Clock
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/meter-reader-dashboard",
  },
  {
    title: "Today's Route",
    icon: Route,
    href: "/meter-reader-dashboard/route",
  },
  {
    title: "Meter Readings",
    icon: Gauge,
    href: "/meter-reader-dashboard/readings",
  },
  {
    title: "Reading History",
    icon: ClipboardList,
    href: "/meter-reader-dashboard/history",
  },
  {
    title: "Zone Management", 
    icon: MapPin,
    href: "/meter-reader-dashboard/zones",
  },
  {
    title: "Schedule",
    icon: Calendar,
    href: "/meter-reader-dashboard/schedule",
  },
  {
    title: "Navigation",
    icon: Navigation,
    href: "/meter-reader-dashboard/navigation",
  },
  {
    title: "Issue Reports",
    icon: AlertTriangle,
    href: "/meter-reader-dashboard/issues",
  },
  {
    title: "Performance",
    icon: BarChart3,
    href: "/meter-reader-dashboard/performance",
  },
  {
    title: "Time Tracking",
    icon: Clock,
    href: "/meter-reader-dashboard/time-tracking",
  }
];

export default function MeterReaderSidebar() {
  const [location] = useLocation();

  const isActive = (href) => {
    return location === href || (href !== "/meter-reader-dashboard" && location.startsWith(href));
  };

  const handleLogout = () => {
    // Clear auth state and redirect
    localStorage.removeItem('token');
    window.location.href = '/api/logout';
  };

  return (
    <div className="bg-white w-64 min-h-screen shadow-lg flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
            <Gauge className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AGASPAY</h1>
            <p className="text-xs text-gray-500">Field Operations</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-').replace("'", "")}`}
              >
                <Icon className="mr-3 h-5 w-5" />
                <span>{item.title}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link href="/meter-reader-dashboard/settings">
          <span
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive("/meter-reader-dashboard/settings")
                ? "bg-green-50 text-green-700"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            data-testid="link-settings"
          >
            <Settings className="mr-3 h-5 w-5" />
            <span>Settings</span>
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          data-testid="button-logout"
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}