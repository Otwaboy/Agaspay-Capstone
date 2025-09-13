import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { CheckCircle, Clock, Camera, Edit } from "lucide-react";

export default function MeterReaderRecentReadings() {
  const { data: recentReadings, isLoading } = useQuery({
    queryKey: ['/api/v1/meter-reader/recent-readings'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Mock data for development
  const mockReadings = [
    {
      id: "READ-001",
      meterNumber: "MTR-20240001",
      customerName: "Juan Dela Cruz",
      reading: 92.1,
      previousReading: 89.3,
      consumption: 2.8,
      timestamp: "2024-08-25T09:12:00Z",
      status: "submitted",
      hasPhoto: true,
      validationStatus: "approved"
    },
    {
      id: "READ-002", 
      meterNumber: "MTR-20240002",
      customerName: "Maria Santos",
      reading: 156.4,
      previousReading: 152.1,
      consumption: 4.3,
      timestamp: "2024-08-25T08:45:00Z", 
      status: "submitted",
      hasPhoto: true,
      validationStatus: "pending"
    },
    {
      id: "READ-003",
      meterNumber: "MTR-20240003",
      customerName: "Pedro Rodriguez", 
      reading: 203.7,
      previousReading: 201.5,
      consumption: 2.2,
      timestamp: "2024-08-25T08:20:00Z",
      status: "submitted",
      hasPhoto: false,
      validationStatus: "flagged",
      note: "Photo upload failed"
    },
    {
      id: "READ-004",
      meterNumber: "MTR-20240004",
      customerName: "Ana Bautista",
      reading: 0,
      previousReading: 98.2,
      consumption: 0,
      timestamp: "2024-08-25T07:55:00Z",
      status: "draft",
      hasPhoto: false,
      note: "Meter inaccessible - locked gate"
    }
  ];

  const readings = recentReadings || mockReadings;

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-PH', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status, validationStatus) => {
    if (status === 'draft') {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-800">
          <Edit className="w-3 h-3 mr-1" />
          Draft
        </Badge>
      );
    }

    if (validationStatus === 'approved') {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }

    if (validationStatus === 'flagged') {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          ⚠ Flagged
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Readings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-3 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
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
          <CheckCircle className="h-5 w-5 mr-2" />
          Recent Readings
          <Badge variant="secondary" className="ml-2">
            {readings.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {readings.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No readings recorded yet</p>
              <p className="text-sm text-gray-400">Start taking meter readings to see them here</p>
            </div>
          ) : (
            readings.map((reading) => (
              <div 
                key={reading.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                data-testid={`reading-${reading.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      reading.hasPhoto ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Camera className={`h-4 w-4 ${
                        reading.hasPhoto ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm" data-testid={`text-customer-${reading.id}`}>
                        {reading.customerName}
                      </h4>
                      <p className="text-xs text-gray-500 mb-1">
                        {reading.meterNumber}
                      </p>
                      
                      {reading.status === 'submitted' ? (
                        <div className="text-xs space-y-1">
                          <p className="text-gray-700">
                            Reading: <span className="font-medium">{reading.reading} m³</span>
                          </p>
                          <p className="text-gray-600">
                            Usage: {reading.consumption} m³
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-orange-600">
                          {reading.note}
                        </p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(reading.timestamp)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    {getStatusBadge(reading.status, reading.validationStatus)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            data-testid="button-view-all-readings"
          >
            View All Readings →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}