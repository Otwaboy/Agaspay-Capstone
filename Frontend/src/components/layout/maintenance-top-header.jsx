import { Bell, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useAuth } from "../../hooks/use-auth";

export default function MaintenanceTopHeader() {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-xl">
          <div className="relative">
          </div>
        </div> 

        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 hover:bg-red-500">
              3
            </Badge>
          </Button>

          {/* User Info */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.username || 'Maintenance Staff'}
              </p>
              <p className="text-xs text-gray-500">Maintenance Personnel</p>
            </div>
            <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.username?.charAt(0)?.toUpperCase() || 'M'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
