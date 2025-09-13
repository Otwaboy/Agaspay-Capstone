import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { MapPin, Clock, CheckCircle, AlertCircle, Navigation, Camera } from "lucide-react";

export default function MeterReaderRouteSchedule() {
  const { data: routeSchedule, isLoading } = useQuery({
    queryKey: ['/api/v1/meter-reader/route-schedule'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mock data for development
  const mockSchedule = [
    {
      id: "METER-001",
      accountNumber: "WC-2024-001",
      customerName: "Juan Dela Cruz",
      address: "123 Barangay St, Zone 2",
      meterNumber: "MTR-20240001",
      lastReading: 125.6,
      status: "pending",
      estimatedTime: "09:00 AM",
      priority: "normal",
      notes: "Gate access required"
    },
    {
      id: "METER-002", 
      accountNumber: "WC-2024-002",
      customerName: "Maria Santos",
      address: "456 Main Ave, Zone 2", 
      meterNumber: "MTR-20240002",
      lastReading: 89.3,
      status: "completed",
      estimatedTime: "09:15 AM",
      priority: "normal",
      actualTime: "09:12 AM",
      currentReading: 92.1
    },
    {
      id: "METER-003",
      accountNumber: "WC-2024-003", 
      customerName: "Pedro Rodriguez",
      address: "789 Side St, Zone 2",
      meterNumber: "MTR-20240003",
      lastReading: 156.8,
      status: "issue",
      estimatedTime: "09:30 AM",
      priority: "high",
      notes: "Meter cover damaged"
    },
    {
      id: "METER-004",
      accountNumber: "WC-2024-004",
      customerName: "Ana Bautista", 
      address: "321 Hill Road, Zone 2",
      meterNumber: "MTR-20240004",
      lastReading: 98.2,
      status: "pending",
      estimatedTime: "09:45 AM",
      priority: "normal"
    },
    {
      id: "METER-005",
      accountNumber: "WC-2024-005",
      customerName: "Carlos Lopez",
      address: "654 Valley Dr, Zone 2",
      meterNumber: "MTR-20240005", 
      lastReading: 201.5,
      status: "pending",
      estimatedTime: "10:00 AM",
      priority: "normal"
    }
  ];

  const schedule = routeSchedule || mockSchedule;

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        variant: "default",
        className: "bg-green-100 text-green-800 hover:bg-green-100",
        icon: CheckCircle
      },
      pending: {
        variant: "secondary", 
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        icon: Clock
      },
      issue: {
        variant: "destructive",
        className: "bg-red-100 text-red-800 hover:bg-red-100", 
        icon: AlertCircle
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: "bg-red-100 text-red-800",
      normal: "bg-gray-100 text-gray-800",
      low: "bg-blue-100 text-blue-800"
    };

    return (
      <Badge variant="outline" className={priorityConfig[priority] || priorityConfig.normal}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const handleNavigate = (address) => {
    console.log(`Navigate to: ${address}`);
    // Add navigation handler
  };

  const handleRecordReading = (meterId) => {
    console.log(`Record reading for: ${meterId}`);
    // Add reading handler
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Today's Route Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-12" />
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
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Today's Route Schedule
          <Badge variant="secondary" className="ml-2">
            Zone 2
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {schedule.map((reading, index) => (
            <div 
              key={reading.id}
              className={`p-4 border rounded-lg transition-colors ${
                reading.status === 'completed' ? 'bg-green-50 border-green-200' :
                reading.status === 'issue' ? 'bg-red-50 border-red-200' :
                'border-gray-200 hover:bg-gray-50'
              }`}
              data-testid={`route-item-${reading.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900" data-testid={`text-customer-${reading.id}`}>
                      {reading.customerName}
                    </h4>
                    {getStatusBadge(reading.status)}
                    {getPriorityBadge(reading.priority)}
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {reading.address}
                    </p>
                    <p>Account: {reading.accountNumber} • Meter: {reading.meterNumber}</p>
                    <p>Last Reading: {reading.lastReading} m³</p>
                    {reading.status === 'completed' && reading.currentReading && (
                      <p className="text-green-600 font-medium">
                        Current Reading: {reading.currentReading} m³
                      </p>
                    )}
                    {reading.notes && (
                      <p className="text-orange-600">
                        Note: {reading.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-right text-sm">
                    <p className="font-medium text-gray-900">
                      {reading.status === 'completed' ? reading.actualTime : reading.estimatedTime}
                    </p>
                    <p className="text-gray-500">
                      {reading.status === 'completed' ? 'Completed' : 'Scheduled'}
                    </p>
                  </div>
                  
                  {reading.status === 'pending' && (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleNavigate(reading.address)}
                        className="px-2 py-1 h-auto"
                        data-testid={`button-navigate-${reading.id}`}
                      >
                        <Navigation className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleRecordReading(reading.id)}
                        className="px-2 py-1 h-auto"
                        data-testid={`button-record-${reading.id}`}
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="w-full text-sm text-blue-600 hover:text-blue-800"
            data-testid="button-view-full-route"
          >
            View Full Route Map →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}