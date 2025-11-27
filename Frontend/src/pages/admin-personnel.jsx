import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import CreatePersonnelModal from "../components/modals/create-personnel-modal";
import EditPersonnelModal from "../components/modals/edit-personnel-modal";
import {
  UserPlus,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Shield,
  Users
} from "lucide-react";
import { apiClient } from "../lib/api";
import { toast } from "sonner";

export default function AdminPersonnel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [personnelToArchive, setPersonnelToArchive] = useState(null);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [viewingPersonnel, setViewingPersonnel] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['personnel', roleFilter],
    queryFn: () => apiClient.getAllPersonnel({ role: roleFilter !== 'all' ? roleFilter : undefined })
  });

  const personnel = data?.personnel || [];

  // Get all admin users from personnel data
  const adminUsers = personnel.filter(person => person.role === 'admin');

  const archiveMutation = useMutation({
    mutationFn: (id) => apiClient.archivePersonnel(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['personnel']);
      toast.success("Success", { description: "Personnel archived successfully" });
    },
    onError: (error) => {
      toast.error("Error", { description: error.response?.data?.message || "Failed to archive personnel" });
    }
  });

  const filteredPersonnel = personnel.filter(person => {
    // Exclude admin users from staff members list
    if (person.role === 'admin') return false;

    const fullName = `${person.first_name} ${person.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const getRoleBadge = (role) => {
    const config = {
      admin: { label: "Admin", className: "bg-purple-100 text-purple-800" },
      treasurer: { label: "Treasurer", className: "bg-blue-100 text-blue-800" },
      secretary: { label: "Secretary", className: "bg-green-100 text-green-800" },
      meter_reader: { label: "Meter Reader", className: "bg-gray-100 text-gray-800" },
      maintenance: { label: "Maintenance", className: "bg-orange-100 text-orange-800" }
    };
    return config[role] || { label: role, className: "bg-gray-100 text-gray-800" };
  };

  const getStatusBadge = (person) => {
    // Check if archived first
    if (person.archive_status === 'archived') {
      return { label: "Archived", className: "bg-red-100 text-red-700" };
    }

    // Otherwise check active/inactive status
    return person.status === "active"
      ? { label: "Inactive", className: "bg-green-100 text-green-800" }
      : { label: "Active", className: "bg-green-100 text-green-800" };
  };

  const handleArchive = (person) => {
    setPersonnelToArchive(person);
    setIsArchiveDialogOpen(true);
  };

  const confirmArchive = () => {
    if (personnelToArchive) {
      archiveMutation.mutate(personnelToArchive._id);
      setIsArchiveDialogOpen(false);
      setPersonnelToArchive(null);
    }
  };

  const handleEdit = (person) => {
    setSelectedPersonnel(person);
    setIsEditModalOpen(true);
  };

  const handleViewDetails = (person) => {
    setViewingPersonnel(person);
    setIsViewDetailsOpen(true);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries(['personnel']);
  };

  const stats = [
    {
      title: "Total Personnel",
      value: personnel.length,
      icon: UserPlus,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Active Staff",
      value: personnel.filter(p => p.status === "active").length,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Administrators",
      value: personnel.filter(p => p.role === "admin").length,
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Field Staff",
      value: personnel.filter(p => p.role === "meter reader" || p.role === "maintenance").length,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
          <TopHeader />
          <main className="flex-1 overflow-auto p-6 relative z-10">
            <div className="max-w-7xl mx-auto">
              <Skeleton className="h-8 w-64 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
              </div>
              <Skeleton className="h-96" />
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
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900" data-testid="text-personnel-title">
                      Personnel Management
                    </h1>
                    <p className="text-gray-600">Manage staff members and their roles</p>
                  </div>
                </div>
           
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-personnel"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-role-filter">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="treasurer">Treasurer</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                      <SelectItem value="meter reader">Meter Reader</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>

                       <Button 
                  onClick={() => setIsModalOpen(true)}
                  data-testid="button-add-personnel"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Personnel
                </Button>
                </div>
              </CardContent>
            </Card>

            {adminUsers.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Administrators ({adminUsers.length})</CardTitle>
                </CardHeader>
                <CardContent className="overflow-visible">
                  <div className="overflow-x-auto" style={{ overflowY: 'auto' }}>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Personnel Info
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Role
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Assigned Zone
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                            Join Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {adminUsers.map((admin) => (
                          <tr key={admin._id}>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-purple-600 font-medium">
                                    {admin?.first_name?.charAt(0) || 'A'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{admin?.first_name} {admin?.last_name}</p>
                                  <p className="text-sm text-gray-500">{admin?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className="bg-purple-100 text-purple-800">Administrator</Badge>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{admin?.assigned_zone || 'All Zone'}</td>
                            <td className="py-4 px-6">
                              <Badge variant="outline" className="text-green-700 border-green-300">Active</Badge>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">
                              {admin?.created_at ? new Date(admin?.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="overflow-visible">
              <CardHeader>
                <CardTitle>Staff Members ({filteredPersonnel.length})</CardTitle>
              </CardHeader>
              <CardContent className="overflow-visible">
                <div className="overflow-x-auto" style={{ overflowY: 'auto' }}>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Personnel Info
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Role
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Assigned Zone
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Join Date
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPersonnel.map((person) => {
                        const roleConfig = getRoleBadge(person.role);
                        const statusConfig = getStatusBadge(person);
                        const fullName = `${person.first_name} ${person.last_name}`;
                        const joinDate = person.created_at ? new Date(person.created_at).toLocaleDateString() : 'N/A';
                        
                        return (
                          <tr key={person._id} data-testid={`row-personnel-${person._id}`}>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-purple-600 font-medium">
                                    {person.first_name?.charAt(0) || 'P'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{fullName}</p>
                                  <p className="text-sm text-gray-500">{person.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={roleConfig.className}>
                                {roleConfig.label}
                              </Badge>
                            </td>
                         
                            <td className="py-4 px-6 text-sm text-gray-900">{person.assigned_zone || 'Not meter reader'}</td>
                            <td className="py-4 px-6">
                              <Badge className={statusConfig.className}>
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">{joinDate}</td>
                            <td className="py-4 px-6 relative z-50">
                              {person.role === 'admin' ? (
                                <span className="text-xs text-gray-500 font-medium">No actions</span>
                              ) : (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" data-testid={`button-actions-${person._id}`}>
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" side="top" sideOffset={10}>
                                    <DropdownMenuItem onClick={() => handleViewDetails(person)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleEdit(person)}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit Personnel
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleArchive(person)}
                                      disabled={archiveMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Archive
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {filteredPersonnel.length === 0 && (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-gray-500">
                            No personnel found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <CreatePersonnelModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          queryClient.invalidateQueries(['personnel']);
        }}
      />

      <EditPersonnelModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPersonnel(null);
        }}
        personnel={selectedPersonnel}
        onSuccess={handleEditSuccess}
      />

      {/* Archive Confirmation Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Archive Personnel
            </DialogTitle>
            <DialogDescription>
              This action will archive this personnel account.
            </DialogDescription>
          </DialogHeader>

          {personnelToArchive && (
            <div className="py-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Are you sure?</strong> You are about to archive{" "}
                  <strong>
                    {personnelToArchive.first_name} {personnelToArchive.last_name}
                  </strong>
                  . This personnel will not be able to log in to their account.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsArchiveDialogOpen(false);
                setPersonnelToArchive(null);
              }}
              disabled={archiveMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmArchive}
              disabled={archiveMutation.isPending}
            >
              {archiveMutation.isPending ? "Archiving..." : "Archive Personnel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Personnel Details
            </DialogTitle>
          </DialogHeader>

          {viewingPersonnel && (
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-purple-600 font-medium">
                    {viewingPersonnel.first_name?.charAt(0) || 'P'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Full Name</p>
                  <p className="text-sm text-gray-900">{viewingPersonnel.first_name} {viewingPersonnel.last_name}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                  <p className="text-sm text-gray-900">{viewingPersonnel.email}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Role</p>
                  <Badge className={getRoleBadge(viewingPersonnel.role).className}>
                    {getRoleBadge(viewingPersonnel.role).label}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Assigned Zone</p>
                  <p className="text-sm text-gray-900">{viewingPersonnel.assigned_zone || 'Not assigned'}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                  <Badge className={getStatusBadge(viewingPersonnel).className}>
                    {getStatusBadge(viewingPersonnel).label}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Join Date</p>
                  <p className="text-sm text-gray-900">
                    {viewingPersonnel.created_at ? new Date(viewingPersonnel.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>

                {viewingPersonnel.phone && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                    <p className="text-sm text-gray-900">{viewingPersonnel.phone}</p>
                  </div>
                )}

                {viewingPersonnel.address && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Address</p>
                    <p className="text-sm text-gray-900">{viewingPersonnel.address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
