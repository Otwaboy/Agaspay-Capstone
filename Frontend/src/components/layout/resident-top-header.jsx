import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
  Settings,
  User,
  LogOut,
  Droplets
} from "lucide-react";

import { useAuth } from "../../hooks/use-auth";
import { useLocation } from "wouter";

export default function ResidentTopHeader() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:ml-0">
      <div className="flex items-center justify-between px-6 py-6">
        {/* Left spacer - Visible only on mobile */}
        <div className="flex-1 lg:hidden"></div>

        {/* Logo - Visible only on mobile */}
        <div className="flex lg:hidden items-center justify-center mr-6">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-2 rounded-lg">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900">AGASPAY</h1>
              <p className="text-xs text-blue-600">Resident Portal</p>
            </div>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer flex items-center space-x-2 px-3 lg:border-gray-200 border-0 h-10 lg:h-10"
                data-testid="button-user-menu"
              >
                <div className="w-10 h-10 lg:w-6 lg:h-10 lg:w-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-full flex items-center justify-center ">
                  <span className="text-white text-sm lg:text-lg font-large">
                    {user?.fullname?.charAt(0)?.toUpperCase() || 'R'}
                  </span>
                </div>
                
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation('/resident-dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/resident-dashboard/settings')}>

                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>

              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}