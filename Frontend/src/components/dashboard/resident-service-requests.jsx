import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Wrench, Eye, Plus, Clock } from "lucide-react";

export default function ResidentServiceRequests() {
  const { data: requests, isLoading } = useQuery({
    queryKey: ['/api/resident/service-requests'],
    initialData: [
      {
        id: "SR-2024-089",
        type: "Water Pressure Issue",
        description: "Low water pressure in kitchen area",
        status: "in_progress",
        priority: "medium",
        dateSubmitted: "2024-08-18",
        assignedTo: "Maintenance Team A",
        estimatedCompletion: "2024-08-22"
      },
      {
        id: "SR-2024-076",
        type: "Meter Reading Dispute",
        description: "Questioning last month's meter reading accuracy",
        status: "resolved",
        priority: "low",
        dateSubmitted: "2024-08-10",
        assignedTo: "Admin Office",
        completedDate: "2024-08-15"
      },
      {
        id: "SR-2024-063",
        type: "Billing Inquiry",
        description: "Request for payment plan options",
        status: "pending",
        priority: "low",
        dateSubmitted: "2024-08-05",
        assignedTo: "Billing Department",
        estimatedCompletion: "2024-08-25"
      }
    ]
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "resolved": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "in_progress": return <Clock className="h-4 w-4 text-blue-600" />;
      case "resolved": return <div className="h-2 w-2 bg-green-600 rounded-full" />;
      case "pending": return <div className="h-2 w-2 bg-yellow-600 rounded-full" />;
      default: return <div className="h-2 w-2 bg-gray-600 rounded-full" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Requests</CardTitle>
          <CardDescription>Your submitted requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-start space-x-3">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-6 w-16" />
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
            <Wrench className="h-5 w-5 mr-2 text-orange-600" />
            Service Requests
          </CardTitle>
          <CardDescription>Your submitted requests and their status</CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center space-x-2"
          onClick={() => window.dispatchEvent(new Event("openReportIssueModal"))}
          data-testid="button-new-request"
        >
          <Plus className="h-4 w-4" />
          <span>New Request</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests?.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No service requests submitted yet</p>
              <Button 
                onClick={() => window.dispatchEvent(new Event("openReportIssueModal"))}
                data-testid="button-submit-first-request"
              >
                Submit Your First Request
              </Button>
            </div>
          ) : (
            requests?.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(request.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">{request.type}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{request.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Request ID:</span> {request.id}
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span> {new Date(request.dateSubmitted).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Assigned to:</span> {request.assignedTo}
                        </div>
                        <div>
                          <span className="font-medium">
                            {request.status === 'resolved' ? 'Completed:' : 'Est. Completion:'}
                          </span> {' '}
                          {request.status === 'resolved' 
                            ? new Date(request.completedDate).toLocaleDateString()
                            : new Date(request.estimatedCompletion).toLocaleDateString()
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="p-2"
                      data-testid={`button-view-request-${request.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {requests?.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">In Progress</p>
                <p className="text-lg font-bold text-blue-900">
                  {requests?.filter(r => r.status === 'in_progress').length || 0}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-700 font-medium">Pending</p>
                <p className="text-lg font-bold text-yellow-900">
                  {requests?.filter(r => r.status === 'pending').length || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700 font-medium">Resolved</p>
                <p className="text-lg font-bold text-green-900">
                  {requests?.filter(r => r.status === 'resolved').length || 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}