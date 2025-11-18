import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import ResidentSidebar from "../components/layout/resident-sidebar";
import ResidentTopHeader from "../components/layout/resident-top-header";
import { History, Search, Droplets, Calendar, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";
import apiClient from "../lib/api";

export default function ResidentReadingHistory() {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch resident's water connection
  const { data: connectionData } = useQuery({
    queryKey: ["/api/v1/water-connection"],
    queryFn: async () => {
      const res = await apiClient.getAllWaterConnections();
      return res.data?.[0] || null;
    },
  });

  // Fetch reading history - using billing data which contains reading information
  const { data: readingsData, isLoading } = useQuery({
    queryKey: ["/api/v1/billing/history", connectionData?.connection_id],
    queryFn: async () => {
      if (!connectionData?.connection_id) return [];
      // Get billing history which includes reading data
      const res = await apiClient.getCurrentBill();
      // Filter bills for this connection and extract reading info
      return res.data?.filter(bill =>
        bill.connection_id === connectionData.connection_id ||
        bill.connection_id?._id === connectionData.connection_id
      ).map(bill => ({
        _id: bill.bill_id || bill._id,
        reading_date: bill.reading_date || bill.created_at,
        inclusive_date: {
          start: bill.billing_period_start || bill.inclusive_date?.start,
          end: bill.billing_period_end || bill.inclusive_date?.end
        },
        previous_reading: bill.previous_reading || 0,
        present_reading: bill.present_reading || bill.current_reading || 0,
        consumption: bill.calculated || bill.consumption || 0,
        status: bill.status === 'paid' ? 'approved' : bill.payment_status === 'pending' ? 'pending' : 'approved',
        remarks: bill.remarks || 'Normal Reading',
        createdAt: bill.created_at
      })) || [];
    },
    enabled: !!connectionData?.connection_id,
  });

  const readings = readingsData || [];

  // Filter readings based on search
  const filteredReadings = readings.filter(reading => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const month = new Date(reading.reading_date || reading.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' });
    return (
      month.toLowerCase().includes(searchLower) ||
      reading.status?.toLowerCase().includes(searchLower) ||
      reading.present_reading?.toString().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: {
        label: "Approved",
        className: "bg-green-100 text-green-800",
        icon: CheckCircle
      },
      pending: {
        label: "Pending",
        className: "bg-yellow-100 text-yellow-800",
        icon: Clock
      },
      rejected: {
        label: "Rejected",
        className: "bg-red-100 text-red-800",
        icon: XCircle
      },
    };

    const config = statusConfig[status?.toLowerCase()] || {
      label: status || "Unknown",
      className: "bg-gray-100 text-gray-800",
      icon: Clock
    };

    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // const formatPeriod = (startDate, endDate) => {
  //   if (!startDate || !endDate) return "N/A";
  //   const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  //   const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  //   return `${start} - ${end}`;
  // };

  const calculateConsumption = (present, previous) => {
    if (!present || !previous) return 0;
    return Math.max(0, present - previous);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <ResidentSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <ResidentTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <History className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Reading History
                  </h1>
                  <p className="text-gray-600">View your meter reading history and consumption</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Readings</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {readings.length}
                      </p>
                    </div>
                    <Droplets className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Latest Reading</p>
                      <p className="text-2xl font-bold text-green-600">
                        {readings[0]?.present_reading || 0} m³
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Last Period</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {calculateConsumption(readings[0]?.present_reading, readings[0]?.previous_reading)} m³
                      </p>
                    </div>
                    <Droplets className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by month, status, or reading..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Reading History Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Reading History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredReadings.length === 0 ? (
                  <div className="text-center py-12">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {searchQuery ? "No readings found matching your search" : "No reading history available"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reading Date</TableHead>
                          <TableHead>Previous Reading</TableHead>
                          <TableHead>Present Reading</TableHead>
                          <TableHead>Consumption</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReadings.map((reading, index) => {
                          const consumption = calculateConsumption(reading.present_reading, reading.previous_reading);

                          return (
                            <TableRow key={reading._id || index}>
                              <TableCell className="font-medium">
                                {formatDate(reading.reading_date || reading.createdAt)}
                              </TableCell>
                              <TableCell>{reading.previous_reading || 0} m³</TableCell>
                              <TableCell className="font-semibold text-blue-600">
                                {reading.present_reading || 0} m³
                              </TableCell>
                              <TableCell>
                                <span className={`font-semibold ${
                                  consumption > 20 ? 'text-red-600' :
                                  consumption > 10 ? 'text-orange-600' :
                                  'text-green-600'
                                }`}>
                                  {consumption} m³
                                </span>
                              </TableCell>
                              <TableCell>{getStatusBadge(reading.status)}</TableCell>
                              <TableCell className="text-sm text-gray-600">
                                {reading.remarks || "Normal Reading"}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Note */}
            <Card className="mt-6 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Droplets className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">About Your Readings</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Your water meter is read monthly. Consumption is calculated by subtracting the previous reading from the current reading.
                      High consumption (above 20 m³) is highlighted in red, moderate (10-20 m³) in orange, and low (below 10 m³) in green.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
