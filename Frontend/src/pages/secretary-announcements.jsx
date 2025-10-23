import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../hooks/use-auth";
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle, 
  DialogFooter,
} from "../components/ui/dialog";
import { Search, MessageSquare, Plus, Edit, Trash2, Eye, AlertCircle, Bell } from "lucide-react";
import { useToast } from "../hooks/use-toast";

export default function SecretaryAnnouncements() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Mock data - Replace with actual API call
  const announcements = [
    {
      id: 1,
      title: "Water Interruption Notice",
      content: "Water service will be temporarily suspended on January 28, 2025, from 8:00 AM to 12:00 PM for system maintenance in Zone 1.",
      category: "Maintenance",
      priority: "high",
      datePosted: "2025-01-20",
      status: "active",
      views: 245
    },
    {
      id: 2,
      title: "Monthly Barangay Assembly",
      content: "All residents are invited to attend the monthly barangay assembly on January 30, 2025, at 2:00 PM at the Barangay Hall.",
      category: "Event",
      priority: "normal",
      datePosted: "2025-01-18",
      status: "active",
      views: 156
    },
    {
      id: 3,
      title: "New Payment Methods Available",
      content: "Residents can now pay their water bills through GCash and PayMaya. Visit the treasurer's office for more details.",
      category: "Information",
      priority: "normal",
      datePosted: "2025-01-15",
      status: "active",
      views: 189
    },
    {
      id: 4,
      title: "Urgent: Water Quality Advisory",
      content: "Temporary water quality issue detected in Zone 3. Residents are advised to boil water before consumption. Resolution expected within 24 hours.",
      category: "Alert",
      priority: "urgent",
      datePosted: "2025-01-21",
      status: "active",
      views: 312
    },
    {
      id: 5,
      title: "Barangay Cleanup Drive",
      content: "Join us for a community cleanup drive on February 1, 2025. Meeting point at the Barangay Hall at 6:00 AM.",
      category: "Event",
      priority: "normal",
      datePosted: "2025-01-17",
      status: "archived",
      views: 98
    },
  ];

  const categories = ["Maintenance", "Event", "Information", "Alert", "Emergency"];

  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "all" || ann.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const handleViewDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDetailsOpen(true);
  };

  const handleCreateAnnouncement = () => {
    toast({
      title: "Announcement Posted",
      description: "The announcement has been successfully published.",
    });
    setCreateModalOpen(false);
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  const priorityConfig = {
    normal: { color: "bg-gray-100 text-gray-700", label: "Normal", icon: MessageSquare },
    high: { color: "bg-orange-100 text-orange-700", label: "High", icon: AlertCircle },
    urgent: { color: "bg-red-100 text-red-700", label: "Urgent", icon: Bell },
  };

  const statusConfig = {
    active: { color: "bg-green-100 text-green-700", label: "Active" },
    archived: { color: "bg-gray-100 text-gray-700", label: "Archived" },
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SecretarySidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <SecretaryTopHeader />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">
                Announcement Management
              </h1>
              <p className="text-gray-600 mt-2">
                Create and manage barangay announcements and notices
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Announcements</p>
                      <p className="text-2xl font-bold text-gray-900">{announcements.length}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-green-600">
                        {announcements.filter(a => a.status === "active").length}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Bell className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">High Priority</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {announcements.filter(a => a.priority === "high" || a.priority === "urgent").length}
                      </p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {announcements.reduce((sum, a) => sum + a.views, 0)}
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Eye className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Announcement List</CardTitle>
                    <CardDescription>
                      View and manage all barangay announcements
                    </CardDescription>
                  </div>
                  <Button onClick={() => setCreateModalOpen(true)} data-testid="button-create-announcement">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Announcement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search announcements..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      data-testid="input-search"
                    />
                  </div>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-full md:w-48" data-testid="select-priority-filter">
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Announcement Cards */}
                <div className="space-y-4">
                  {filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((ann) => {
                      const PriorityIcon = priorityConfig[ann.priority].icon;
                      return (
                        <Card key={ann.id} data-testid={`card-announcement-${ann.id}`}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3 mb-2">
                                  <div className={`p-2 rounded-lg ${priorityConfig[ann.priority].color.replace('text', 'bg').replace('700', '100')}`}>
                                    <PriorityIcon className={`h-5 w-5 ${priorityConfig[ann.priority].color.replace('bg', 'text')}`} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="text-lg font-semibold text-gray-900">{ann.title}</h3>
                                      <Badge className={statusConfig[ann.status].color} data-testid={`badge-status-${ann.id}`}>
                                        {statusConfig[ann.status].label}
                                      </Badge>
                                      <Badge className={priorityConfig[ann.priority].color} data-testid={`badge-priority-${ann.id}`}>
                                        {priorityConfig[ann.priority].label}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{ann.content}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <span className="flex items-center">
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        {ann.category}
                                      </span>
                                      <span className="flex items-center">
                                        <Eye className="h-3 w-3 mr-1" />
                                        {ann.views} views
                                      </span>
                                      <span>Posted on {new Date(ann.datePosted).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(ann)}
                                  data-testid={`button-view-${ann.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  data-testid={`button-edit-${ann.id}`}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  data-testid={`button-delete-${ann.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No announcements found matching your criteria
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
            <DialogDescription>
              Complete information about the announcement
            </DialogDescription>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">{selectedAnnouncement.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Content</label>
                <p className="text-gray-900 mt-1">{selectedAnnouncement.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <p className="text-gray-900 mt-1">{selectedAnnouncement.category}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <div className="mt-1">
                    <Badge className={priorityConfig[selectedAnnouncement.priority].color}>
                      {priorityConfig[selectedAnnouncement.priority].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Date Posted</label>
                  <p className="text-gray-900 mt-1">{new Date(selectedAnnouncement.datePosted).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={statusConfig[selectedAnnouncement.status].color}>
                      {statusConfig[selectedAnnouncement.status].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Views</label>
                  <p className="text-gray-900 mt-1">{selectedAnnouncement.views}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewDetailsOpen(false)} data-testid="button-close-dialog">
                  Close
                </Button>
                <Button data-testid="button-edit-announcement-dialog">Edit Announcement</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Announcement Dialog */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>
              Fill in the details to publish a new announcement
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter announcement title" className="mt-2" data-testid="input-title" />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter announcement content..."
                rows={5}
                className="mt-2"
                data-testid="input-content"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select>
                  <SelectTrigger className="mt-2" data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select>
                  <SelectTrigger className="mt-2" data-testid="select-priority">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)} data-testid="button-cancel">
              Cancel
            </Button>
            <Button onClick={handleCreateAnnouncement} data-testid="button-publish">Publish Announcement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
