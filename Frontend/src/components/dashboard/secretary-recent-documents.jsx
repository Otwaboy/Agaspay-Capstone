import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Eye, Download, FileText } from "lucide-react";

export default function SecretaryRecentDocuments() {
  const { data: documents, isLoading } = useQuery({
    queryKey: ['/api/secretary/documents'],
    queryFn: async () => {
      // Mock data for demonstration
      return [
        {
          id: "DOC-2024-001",
          resident: "Juan Dela Cruz",
          type: "Barangay Certificate",
          purpose: "Employment",
          date: "2024-08-19",
          status: "completed",
          priority: "normal"
        },
        {
          id: "DOC-2024-002",
          resident: "Maria Santos",
          type: "Barangay Clearance",
          purpose: "Business Permit",
          date: "2024-08-19",
          status: "processing",
          priority: "high"
        },
        {
          id: "DOC-2024-003",
          resident: "Pedro Rodriguez",
          type: "Indigency Certificate",
          purpose: "Medical Assistance",
          date: "2024-08-18",
          status: "pending",
          priority: "urgent"
        },
        {
          id: "DOC-2024-004",
          resident: "Ana Garcia",
          type: "Residency Certificate",
          purpose: "School Enrollment",
          date: "2024-08-18",
          status: "completed",
          priority: "normal"
        },
        {
          id: "DOC-2024-005",
          resident: "Carlos Mendoza",
          type: "Business Clearance",
          purpose: "Store Opening",
          date: "2024-08-17",
          status: "reviewing",
          priority: "high"
        }
      ];
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "processing": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewing": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "normal": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>Latest document processing activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4 flex-1">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Recent Documents
          </CardTitle>
          <CardDescription>Latest document processing activities</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          View All Documents
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {documents?.map((document) => (
            <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4 flex-1">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {document.type}
                    </p>
                    <p className="text-xs text-gray-500 ml-2">{document.id}</p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{document.resident}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-gray-500">{document.purpose}</p>
                    <span className="text-gray-400">•</span>
                    <p className="text-xs text-gray-500">{document.date}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Badge className={getStatusColor(document.status)}>
                  {document.status}
                </Badge>
                {document.priority !== 'normal' && (
                  <Badge className={getPriorityColor(document.priority)}>
                    {document.priority}
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2"
                  data-testid={`button-view-${document.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {document.status === 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="p-2"
                    data-testid={`button-download-${document.id}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t">
          <Button variant="outline" className="w-full">
            View All Documents
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}