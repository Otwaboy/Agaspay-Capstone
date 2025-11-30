import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import {
  Search,
  Archive,
  FileArchive,
  User,
  Briefcase,
  Calendar,
  RotateCcw,
  AlertTriangle
} from "lucide-react";
import apiClient from "../lib/api";
import { toast } from "sonner";

export default function AdminArchivedUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("residents"); // residents or personnel
  const [selectedUser, setSelectedUser] = useState(null);
  const [unarchiveModalOpen, setUnarchiveModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all water connections
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['archived-connections'],
    queryFn: () => apiClient.getAllWaterConnections()
  });

  // Fetch all personnel
  const { data: personnelData, isLoading: isLoadingPersonnel } = useQuery({
    queryKey: ['archived-personnel'],
    queryFn: () => apiClient.getAllPersonnel()
  });

  // Filter archived residents
  const archivedResidents = (connections?.data || []).filter(
    conn => conn.archive_status === 'archived'
  );

  // Filter archived personnel
  const archivedPersonnel = (personnelData?.personnel || []).filter(
    person => person.archive_status === 'archived'
  );

  // Determine which list to use based on active tab
  const currentArchived = activeTab === "residents" ? archivedResidents : archivedPersonnel;

  // Filter based on search
  const filteredArchived = currentArchived.filter(item => {
    if (activeTab === "residents") {
      const residentName = `${item.resident_id?.first_name || ''} ${item.resident_id?.last_name || ''}`.toLowerCase();
      const meterNo = item.meter_no?.toLowerCase() || '';
      const accountNo = item.resident_id?.account_number?.toLowerCase() || '';

      return residentName.includes(searchTerm.toLowerCase()) ||
             meterNo.includes(searchTerm.toLowerCase()) ||
             accountNo.includes(searchTerm.toLowerCase());
    } else {
      // Personnel search
      const personnelName = `${item.first_name || ''} ${item.last_name || ''}`.toLowerCase();
      const email = item.email?.toLowerCase() || '';
      const role = item.role?.toLowerCase() || '';

      return personnelName.includes(searchTerm.toLowerCase()) ||
             email.includes(searchTerm.toLowerCase()) ||
             role.includes(searchTerm.toLowerCase());
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Unarchive mutation
  const unarchiveMutation = useMutation({
    mutationFn: async ({ id, type }) => {
      if (type === "residents") {
        return await apiClient.unarchiveResident(id);
      } else {
        return await apiClient.unarchivePersonnel(id);
      }
    },
    onSuccess: () => {
      toast.success("User unarchived successfully!");
      queryClient.invalidateQueries(['archived-connections']);
      queryClient.invalidateQueries(['archived-personnel']);
      setUnarchiveModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unarchive user");
    }
  });

  const handleUnarchive = (user) => {
    setSelectedUser(user);
    setUnarchiveModalOpen(true);
  };

  const confirmUnarchive = () => {
    if (selectedUser) {
      let userId;
      if (activeTab === "residents") {
        userId = selectedUser._id || selectedUser.water_connection_id;
      } else {
        userId = selectedUser._id;
      }

      if (!userId) {
        toast.error("Cannot find user ID");
        console.error("Selected user object:", selectedUser);
        return;
      }

      unarchiveMutation.mutate({ id: userId, type: activeTab });
    }
  };

  const stats = [
    {
      title: "Archived Residents",
      value: archivedResidents.length,
      icon: User,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Archived Personnel",
      value: archivedPersonnel.length,
      icon: Briefcase,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Total Archived",
      value: archivedResidents.length + archivedPersonnel.length,
      icon: Archive,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    }
  ];

  const isLoading = isLoadingConnections || isLoadingPersonnel;

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          <TopHeader />
          <main className="flex-1 overflow-auto p-6 relative z-10 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading archived users...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <TopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Archive className="mr-3 h-8 w-8 text-gray-600" />
                Archived Users
              </h1>
              <p className="text-gray-600 mt-2">
                View archived accounts from residents and personnel
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`${stat.bgColor} p-3 rounded-lg`}>
                          <IconComponent className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Archived Users Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <CardTitle>Archived Users</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder={activeTab === "residents" ? "Search by name, meter no, or account..." : "Search by name, email, or role..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full md:w-80"
                      />
                    </div>
                  </div>

                  {/* Tab Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant={activeTab === "residents" ? "default" : "outline"}
                      onClick={() => {
                        setActiveTab("residents");
                        setSearchTerm("");
                      }}
                      className={activeTab === "residents" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Residents ({archivedResidents.length})
                    </Button>
                    <Button
                      variant={activeTab === "personnel" ? "default" : "outline"}
                      onClick={() => {
                        setActiveTab("personnel");
                        setSearchTerm("");
                      }}
                      className={activeTab === "personnel" ? "bg-purple-600 hover:bg-purple-700" : ""}
                    >
                      <Briefcase className="h-4 w-4 mr-2" />
                      Personnel ({archivedPersonnel.length})
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredArchived.length === 0 ? (
                  <div className="text-center py-12">
                    <FileArchive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No archived users found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {activeTab === "residents" ? (
                            <>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Resident Name</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Meter No.</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Zone/Purok</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Archived Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </>
                          ) : (
                            <>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Personnel Name</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned Zone</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Archived Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredArchived.map((item) => (
                          <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                            {activeTab === "residents" ? (
                              <>
                                <td className="py-3 px-4">
                                  <div className="font-medium text-gray-900">
                                    {item.full_name}
                                  </div>
                                  <div className="text-sm text-gray-500">{item.resident_id?.email}</div>
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {item.meter_no}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {item.zone} / {item.purok}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                    {formatDate(item.archive_approved_date)}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                                    Archived
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleUnarchive(item)}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Unarchive
                                  </Button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="py-3 px-4">
                                  <div className="font-medium text-gray-900">
                                    {item.first_name} {item.last_name}
                                  </div>
                                  <div className="text-sm text-gray-500">{item.email}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant="outline" className="capitalize">
                                    {item.role?.replace('_', ' ')}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  {item.assigned_zone || 'N/A'}
                                </td>
                                <td className="py-3 px-4 text-gray-700">
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                    {formatDate(item.archive_approved_date)}
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                                    Archived
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    onClick={() => handleUnarchive(item)}
                                  >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Unarchive
                                  </Button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Unarchive Confirmation Modal */}
        <Dialog open={unarchiveModalOpen} onOpenChange={setUnarchiveModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-blue-600">
                <RotateCcw className="h-5 w-5 mr-2" />
                Unarchive User
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to unarchive this user?
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="py-4">
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  {activeTab === "residents" ? (
                    <>
                      <p className="text-sm">
                        <span className="font-semibold">Resident:</span>{' '}
                        {selectedUser.full_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Meter No:</span> {selectedUser.meter_no}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Zone:</span> {selectedUser.zone}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Purok:</span> {selectedUser.purok}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-semibold">Personnel:</span>{' '}
                        {selectedUser.first_name} {selectedUser.last_name}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Email:</span> {selectedUser.email}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Role:</span>{' '}
                        <span className="capitalize">{selectedUser.role?.replace('_', ' ')}</span>
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Department:</span> {selectedUser.department || 'N/A'}
                      </p>
                    </>
                  )}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This will restore the account and allow {activeTab === "residents" ? "the resident" : "the personnel"} to log in again.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setUnarchiveModalOpen(false)}
                disabled={unarchiveMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={confirmUnarchive}
                disabled={unarchiveMutation.isPending}
              >
                {unarchiveMutation.isPending ? "Processing..." : "Yes, Unarchive"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
