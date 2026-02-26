import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  ClipboardList,
  Search,
  Calendar,
  Gauge,
  User,
  TrendingUp,
} from "lucide-react";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import { apiClient } from "../lib/api";
import { format } from "date-fns";

export default function MeterReaderHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  const { data: readingsData, isLoading } = useQuery({
    queryKey: ["meter-readings-history"],
    queryFn: async () => {
      const response = await apiClient.getLatestReadings();
      return response;
    },
  });

  console.log("readings", readingsData);

  const readings = readingsData?. connection_details || [];

  const filteredReadings = readings.filter((reading) => {
    const matchesSearch = searchQuery
      ? reading.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reading.purok_no?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesDate = dateFilter
      ? format(new Date(reading.last_read_date), "yyyy-MM-dd") === dateFilter
      : true;

    return matchesSearch && matchesDate;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredReadings.length / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const paginatedReadings = filteredReadings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  const totalReadings = filteredReadings.length;
  const totalConsumption = filteredReadings.reduce(
    (sum, r) => sum + (r.calculated || 0),
    0
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <MeterReaderSidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <MeterReaderTopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Reading History
              </h1>
              <p className="text-gray-600 mt-2">
                All submitted meter readings
              </p>
            </div>

            {/* --- Stats Section --- */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Total Readings</p>
                        <p className="text-3xl font-bold mt-1">
                          {totalReadings}
                        </p>
                      </div>
                      <ClipboardList className="h-10 w-10 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Total Consumption</p>
                        <p className="text-3xl font-bold mt-1">
                          {totalConsumption.toFixed(1)} m³
                        </p>
                      </div>
                      <TrendingUp className="h-10 w-10 opacity-80" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Avg Consumption</p>
                        <p className="text-3xl font-bold mt-1">
                          {totalReadings > 0
                            ? (totalConsumption / totalReadings).toFixed(1)
                            : 0}{" "}
                          m³
                        </p>
                      </div>
                      <Gauge className="h-10 w-10 opacity-80" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* --- Search & Filter --- */}
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Search & Filter</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by name or purok..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* --- Data Table --- */}
              <Card>
                <CardHeader>
                  <CardTitle>Readings ({filteredReadings.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="p-8 text-center text-gray-500">
                      Loading readings...
                    </div>
                  ) : filteredReadings.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <ClipboardList className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p>No readings found</p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead>Resident Name</TableHead>
                              <TableHead>Meter Number</TableHead>
                              <TableHead>Purok</TableHead>
                              <TableHead>Previous Reading</TableHead>
                              <TableHead>Present Reading</TableHead>
                              <TableHead>Consumption</TableHead>
                              <TableHead>Reading Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedReadings.map((reading) => (
                              <TableRow
                                key={reading.reading_id}
                                data-testid={`row-reading-${reading.reading_id}`}
                              >
                                <TableCell className="font-medium">
                                  <div>
                                    <p>{reading.full_name}</p>
                                    <p className="text-sm text-gray-500">{reading.meter_number || 'N/A'}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="font-mono text-sm">{reading.meter_number || 'N/A'}</span>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    Purok {reading.purok_no}
                                  </Badge>
                                </TableCell>
                                <TableCell>{reading.previous_reading} m³</TableCell>
                                <TableCell className="font-semibold text-blue-600">
                                  {reading.present_reading} m³
                                </TableCell>
                                <TableCell className="font-semibold text-green-600">
                                  {reading.calculated} m³
                                </TableCell>
                                <TableCell>
                                  {format(
                                    new Date(reading.last_read_date),
                                    "MMM dd, yyyy"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination Controls */}
                      {filteredReadings.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                          <div className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredReadings.length)} of {filteredReadings.length} readings
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>

                            <div className="flex items-center gap-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button
                                  key={page}
                                  variant={currentPage === page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className="w-10 h-10 p-0"
                                >
                                  {page}
                                </Button>
                              ))}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
