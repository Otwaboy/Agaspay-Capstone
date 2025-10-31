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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";

export default function SecretaryAnnouncements() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form states for creating an announcement
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("normal");

  // Fetch announcements from backend
      const { data, isLoading } = useQuery({
        queryKey: ["announcements"],
        queryFn: () => apiClient.getAnnouncements(),
      });

  const announcements = data?.announcements || [];

console.log(announcements);
  

  // Create announcement mutation
  const createAnnouncement = useMutation({
    mutationFn: (data) => apiClient.createAnnouncements(data),
    onSuccess: () => {
      toast({
        title: "Announcement Created",
        description: "Your announcement has been submitted for approval.",
      });
      queryClient.invalidateQueries(["announcements"]);
      setCreateModalOpen(false);
      setTitle("");
      setContent("");
      setCategory("");
      setPriority("normal");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create announcement",
        variant: "destructive",
      });
    },
  });

  const categories = ["Maintenance", "Event", "Information", "Billing", "Alert"];

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesSearch =
      ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ann.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "all" || ann.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const handleViewDetails = (announcement) => {
    setSelectedAnnouncement(announcement);
    setViewDetailsOpen(true);
  };

  const handleCreateAnnouncement = () => {
    if (!title || !content || !category) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createAnnouncement.mutate({
      title,
      content,
      category,
      priority,
    });
  };

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Loading announcements...
      </div>
    );
  }

  const priorityConfig = {
    normal: { color: "bg-gray-100 text-gray-700", label: "Normal", icon: MessageSquare },
    high: { color: "bg-orange-100 text-orange-700", label: "High", icon: AlertCircle },
    urgent: { color: "bg-red-100 text-red-700", label: "Urgent", icon: Bell },
  };

  const statusConfig = {
    draft: { color: "bg-gray-100 text-gray-700", label: "Draft" },
    pending_approval: { color: "bg-yellow-100 text-yellow-700", label: "Pending Approval" },
    approved: { color: "bg-blue-100 text-blue-700", label: "Approved" },
    published: { color: "bg-green-100 text-green-700", label: "Published" },
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
              <h1 className="text-3xl font-bold text-gray-900">Announcement Management</h1>
              <p className="text-gray-600 mt-2">
                Create and manage barangay announcements and notices
              </p>
            </div>

            {/* Stats */}
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
                      <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {announcements.filter((a) => a.status === "pending_approval").length}
                      </p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Published</p>
                      <p className="text-2xl font-bold text-green-600">
                        {announcements.filter((a) => a.status === "published").length}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <Bell className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* List */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Announcement List</CardTitle>
                    <CardDescription>View and manage all barangay announcements</CardDescription>
                  </div>
                  <Button onClick={() => setCreateModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" /> Create Announcement
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
                    />
                  </div>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-full md:w-48">
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

                {/* Announcements */}
                <div className="space-y-4">
                  {filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((ann) => {
                      const PriorityIcon = priorityConfig[ann.priority]?.icon || MessageSquare;
                      return (
                        <Card key={ann._id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-start gap-3 mb-2">
                                  <div
                                    className={`p-2 rounded-lg ${
                                      priorityConfig[ann.priority]?.color.split(" ")[0]
                                    }`}
                                  >
                                    <PriorityIcon
                                      className={`h-5 w-5 ${priorityConfig[ann.priority]?.color.split(" ")[1]}`}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="text-lg font-semibold text-gray-900">{ann.title}</h3>
                                      <Badge className={statusConfig[ann.status]?.color}>
                                        {statusConfig[ann.status]?.label}
                                      </Badge>
                                      <Badge className={priorityConfig[ann.priority]?.color}>
                                        {priorityConfig[ann.priority]?.label}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">{ann.content}</p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      <span className="flex items-center">
                                        <MessageSquare className="h-3 w-3 mr-1" />
                                        {ann.category}
                                      </span>
                                      <span>Created {new Date(ann.createdAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleViewDetails(ann)}>
                                  <Eye className="h-4 w-4 mr-1" /> View
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

      {/* View Details */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
            <DialogDescription>Complete information about the announcement</DialogDescription>
          </DialogHeader>
          {selectedAnnouncement && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Title</label>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {selectedAnnouncement.title}
                </p>
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
                  <Badge className={priorityConfig[selectedAnnouncement.priority]?.color}>
                    {priorityConfig[selectedAnnouncement.priority]?.label}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Badge className={statusConfig[selectedAnnouncement.status]?.color}>
                    {statusConfig[selectedAnnouncement.status]?.label}
                  </Badge>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewDetailsOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Announcement */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>Fill in the details to publish a new announcement</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter announcement title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Enter announcement content..."
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="mt-2">
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
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAnnouncement} disabled={createAnnouncement.isLoading}>
              {createAnnouncement.isLoading ? "Publishing..." : "Publish Announcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
