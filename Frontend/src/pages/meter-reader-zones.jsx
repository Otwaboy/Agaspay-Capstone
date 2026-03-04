import { useState, useEffect } from "react";
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
import { MapPin, Search, Users, Droplets, TrendingUp, Phone, Mail } from "lucide-react";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import { apiClient } from "../lib/api";

export default function MeterReaderZones() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  const { data: authUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const response = await apiClient.getUserAccount();
      return response.user;
    } 
  });

  

  const { data: connectionsResponse, isLoading } = useQuery({
    queryKey: ["zone-connections"],
    queryFn: async () => {
      return await apiClient.getLatestReadings();
    }
  });

  const meterReaderZone = authUser?.assigned_zone;
  console.log('assignex zone', meterReaderZone);
  
  const allConnections = connectionsResponse?.connection_details || [];


  const zoneConnections = allConnections.filter((conn) => conn.zone === meterReaderZone);

  const filteredConnections = zoneConnections.filter((conn) =>
    searchQuery
      ? conn.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.purok_no?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  // Pagination logic
  const totalConnections = filteredConnections.length;
  const totalPages = Math.ceil(totalConnections / ROWS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
  const endIndex = startIndex + ROWS_PER_PAGE;
  const paginatedConnections = filteredConnections.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const activeConnections = zoneConnections.filter((c) => c.status === "active").length;
  const totalConsumption = zoneConnections.reduce((sum, c) => sum + (c.present_reading || 0), 0);

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
              <h1 className="text-3xl font-bold text-gray-900">Zone Management</h1>
              <p className="text-gray-600 mt-2">Zone {meterReaderZone} Coverage Area</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Residents</p>
                      <p className="text-3xl font-bold mt-1">{zoneConnections.length}</p>
                    </div>
                    <Users className="h-10 w-10 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Active Connections</p>
                      <p className="text-3xl font-bold mt-1">{activeConnections}</p>
                    </div>
                    <Droplets className="h-10 w-10 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Reading</p>
                      <p className="text-3xl font-bold mt-1">{totalConsumption.toFixed(1)} m³</p>
                    </div>
                    <TrendingUp className="h-10 w-10 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Search Residents in Zone {meterReaderZone}</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            <Card className="overflow-visible h-full flex flex-col">
              <CardHeader>
                <CardTitle>Zone Residents</CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-gray-500">Loading residents...</p>
                  </div>
                ) : filteredConnections.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">No residents found</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col mx-6 mb-6 border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto flex-1" style={{ overflowY: 'auto' }}>
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 sticky top-0 z-10">
                            <TableHead>Name</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Meter No.</TableHead>
                            <TableHead>Purok</TableHead>
                            <TableHead>Zone</TableHead>
                            <TableHead>Current Reading</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedConnections.length > 0 ? (
                            paginatedConnections.map((connection) => (
                              <TableRow key={connection.connection_id}>
                                <TableCell className="font-medium">{connection.full_name}</TableCell>
                                <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                                  {connection.address || connection.location || connection.specific_address || "—"}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {connection.meter_no || connection.meter_number || "—"}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">Purok {connection.purok_no}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">Zone {connection.zone}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-blue-600">
                                  {connection.present_reading || 0} m³
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                No residents on this page
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 0 && (
                      <div className="flex items-center justify-end gap-2 px-6 py-4 border-t bg-gray-50">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={currentPage === pageNum ? "bg-blue-600 hover:bg-blue-700" : ""}
                            >
                              {pageNum}
                            </Button>
                          ))}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
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
