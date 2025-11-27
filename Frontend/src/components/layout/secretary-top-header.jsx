import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  MessageSquare,
  AlertCircle
} from "lucide-react";

import { useAuth } from "../../hooks/use-auth";
import { useLocation } from "wouter";
import { Link } from "wouter";

export default function SecretaryTopHeader() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setLocation("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 lg:ml-0">
      <div className="flex items-center justify-between px-6 py-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">


        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
        


          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="cursor-pointer flex items-center space-x-2 px-3"
                data-testid="button-user-menu"
              >
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-medium">
                    {user?.fullname?.charAt(0)?.toUpperCase() || 'S'}
                  </span>
                </div>
                 <span className="text-sm font-medium hidden sm:block">
                    {(user?.role || 'Administrator')
                      .charAt(0).toUpperCase() +
                      (user?.role || 'Administrator').slice(1).toLowerCase()}
                  </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setLocation('/secretary-dashboard/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/secretary-dashboard/settings')}>

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
    </header>
  );
}