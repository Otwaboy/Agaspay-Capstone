import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  TrendingUp, 
  FileText, 
  AlertCircle,
  BarChart3,
  DollarSign,
  Users,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/treasurer-dashboard",
  },
  {
    title: "Revenue Management",
    icon: DollarSign,
    subItems: [
      { title: "Payment Collection", href: "/treasurer-dashboard/payments" },
      { title: "Revenue Reports", href: "/treasurer-dashboard/revenue" },
      { title: "Outstanding Balances", href: "/treasurer-dashboard/balances" },
    ]
  },
  {
    title: "Financial Reports",
    icon: FileText,
    subItems: [
      { title: "Monthly Reports", href: "/treasurer-dashboard/reports/monthly" },
      { title: "Annual Reports", href: "/treasurer-dashboard/reports/annual" },
      { title: "Custom Reports", href: "/treasurer-dashboard/reports/custom" },
    ]
  },
  {
    title: "Billing Management",
    icon: Receipt,
    subItems: [
      { title: "Generate Bills", href: "/treasurer-dashboard/billing/generate" },
      { title: "Bill History", href: "/treasurer-dashboard/billing/history" },
      { title: "Billing Settings", href: "/treasurer-dashboard/billing/settings" },
    ]
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/treasurer-dashboard/analytics",
  },
  {
    title: "Payment Methods",
    icon: CreditCard,
    href: "/treasurer-dashboard/payment-methods",
  },
  {
    title: "Customer Accounts",
    icon: Users,
    href: "/treasurer-dashboard/accounts",
  },
  {
    title: "Financial Alerts",
    icon: AlertCircle,
    href: "/treasurer-dashboard/alerts",
  }
];

export default function TreasurerSidebar() {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (title) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActive = (href) => {
    return location === href || (href !== "/treasurer-dashboard" && location.startsWith(href));
  };

  const isParentActive = (subItems) => {
    return subItems?.some(item => isActive(item.href));
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
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AGASPAY</h1>
            <p className="text-xs text-gray-500">Treasurer Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.title}>
            {item.subItems ? (
              <div>
                <button
                  onClick={() => toggleExpanded(item.title)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isParentActive(item.subItems)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  data-testid={`button-toggle-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                  {expandedItems[item.title] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {expandedItems[item.title] && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link key={subItem.href} href={subItem.href}>
                        <span
                          className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                            isActive(subItem.href)
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                          data-testid={`link-${subItem.title.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {subItem.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link href={item.href}>
                <span
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.title}</span>
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link href="/treasurer-dashboard/settings">
          <span
            className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive("/treasurer-dashboard/settings")
                ? "bg-blue-50 text-blue-700"
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