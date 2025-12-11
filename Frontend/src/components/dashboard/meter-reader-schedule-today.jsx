import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, AlertCircle, MapPin, Zap, Clock, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { apiClient } from "../../lib/api";
import { format } from "date-fns";

// Helper function to check if connection is scheduled for today
const isScheduledToday = (connection) => {
  const dateSource = connection?.next_period_dates || connection?.inclusive_date;
  if (!dateSource?.start || !dateSource?.end) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(dateSource.start);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(dateSource.end);
  endDate.setHours(0, 0, 0, 0);

  return today >= startDate && today <= endDate;
};

// Helper function to format date range
const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "N/A";
  try {
    return `${format(new Date(startDate), "MMM d")} - ${format(new Date(endDate), "MMM d")}`;
  } catch {
    return "N/A";
  }
};

// Helper function to get status badge
const getStatusBadge = (connection) => {
  if (connection.can_read_status === "cannot_read") {
    return (
      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 cursor-default">
        Can't Read
      </Badge>
    );
  }

  // Check if reading status exists (inprogress, submitted, or approved = it's been recorded)
  if (connection.reading_status) {
    return (
      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 cursor-default">
        Read
      </Badge>
    );
  }

  // If no reading_status (null/undefined) = not read yet
  return (
    <Badge variant="outline" className="text-gray-600 border-gray-300 cursor-default">
      Not Read
    </Badge>
  );
};

export default function MeterReaderScheduleToday() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["meter-reader-latest-readings"],
    queryFn: () => apiClient.getLatestReadings(),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const connections = data?.connection_details || [];

  // Filter connections scheduled for today and sort by priority
  const todayConnections = connections
    .filter((conn) => isScheduledToday(conn))
    .sort((a, b) => {
      // Priority 1: Not read yet (reading_status is null/undefined)
      const aIsNotRead = !a.reading_status;
      const bIsNotRead = !b.reading_status;

      if (aIsNotRead && !bIsNotRead) return -1;
      if (!aIsNotRead && bIsNotRead) return 1;

      // Priority 2: Alphabetical by name
      return (a.full_name || "").localeCompare(b.full_name || "");
    });

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Schedule Today
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="border-none shadow-md border-red-200 bg-red-50">
        <CardContent className="py-12 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-4">
            Failed to load schedule
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => queryClient.invalidateQueries()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (todayConnections.length === 0) {
    return (
      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Schedule Today
            <Badge variant="secondary">0</Badge>
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Connections with reading period including today
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Connections Scheduled Today
            </h3>
            <p className="text-sm text-gray-500">
              There are no meter readings scheduled for today's date.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop table view
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Schedule Today
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 cursor-default">
              {todayConnections.length}
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Connections with reading period including today
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() => setLocation("/meter-reader-dashboard/readings")}
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Resident Name
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Address
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Meter #
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">
                  Zone
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  Reading Period
                </th>
                <th className="px-4 py-3 text-center font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {todayConnections.map((conn) => (
                <tr
                  key={conn.connection_id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">
                    {conn.full_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {conn.specific_address}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4 text-gray-400" />
                      {conn.meter_number}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    <Badge variant="outline" className="cursor-default">
                      {conn.zone || conn.purok_no || "N/A"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-center text-xs">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formatDateRange(
                        conn.next_period_dates?.start || conn.inclusive_date?.start,
                        conn.next_period_dates?.end || conn.inclusive_date?.end
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(conn)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-3">
          {todayConnections.map((conn) => (
            <div
              key={conn.connection_id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {conn.full_name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" />
                    {conn.specific_address}
                  </p>
                </div>
                <div>{getStatusBadge(conn)}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600">Meter #</p>
                  <p className="font-mono font-semibold text-gray-900 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {conn.meter_number}
                  </p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-gray-600">Zone</p>
                  <p className="font-semibold text-gray-900">
                    {conn.zone || conn.purok_no || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Period:{" "}
                  {formatDateRange(
                    conn.next_period_dates?.start || conn.inclusive_date?.start,
                    conn.next_period_dates?.end || conn.inclusive_date?.end
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
