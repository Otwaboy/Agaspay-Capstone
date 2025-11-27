import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from "../components/ui/button";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import {
  TrendingUp,
  Search,
  Filter,
  Download,
  MoreVertical,
  Eye,
  History,
  AlertCircle,
} from "lucide-react";
import { apiClient } from "../lib/api";

export default function ReadingHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");

  const { data: readingData, isLoading } = useQuery({
    queryKey: ["reading-history"],
    queryFn: () => apiClient.getReadingHistory(),
  });

  const readings = readingData?.data || [];

  // Filter readings by zone and search term
  const filteredReadings = useMemo(() => {
    return readings.filter((reading) => {
      const matchesZone =
        zoneFilter === "all" || reading.zone === parseInt(zoneFilter);
      const residentName = reading.full_name || "";
      const matchesSearch =
        residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reading.meter_number?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesZone && matchesSearch;
    });
  }, [readings, zoneFilter, searchTerm]);

  // Calculate statistics for each zone
  const zoneStats = useMemo(() => {
    const stats = {};
    readings.forEach((reading) => {
      const zone = reading.zone || "Unknown";
      if (!stats[zone]) {
        stats[zone] = {
          totalReadings: 0,
          totalConsumption: 0,
          count: 0,
        };
      }
      stats[zone].totalReadings += 1;
      stats[zone].totalConsumption += reading.calculated || 0;
      stats[zone].count += 1;
    });
    return stats;
  }, [readings]);

  const getZoneBadge = (zone) => {
    const config = {
      1: { label: "Zone 1", className: "bg-blue-100 text-blue-800" },
      2: { label: "Zone 2", className: "bg-purple-100 text-purple-800" },
      3: { label: "Zone 3", className: "bg-pink-100 text-pink-800" },
    };
    return config[zone] || { label: `Zone ${zone}`, className: "bg-gray-100 text-gray-800" };
  };

  const getReadStatusBadge = (canReadStatus) => {
    const config = {
      can_read: { label: "Read", className: "bg-green-100 text-green-800", icon: Eye },
      cannot_read: { label: "Unable to Read", className: "bg-red-100 text-red-800", icon: AlertCircle }
    };
    return config[canReadStatus] || { label: "Unknown", className: "bg-gray-100 text-gray-800", icon: AlertCircle };
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          <TopHeader />
          <main className="flex-1 overflow-auto p-6 relative z-10">
            <div className="max-w-7xl mx-auto">
              <Skeleton className="h-8 w-64 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
              <Skeleton className="h-96" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>

        <TopHeader />

        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <History className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      Reading History
                    </h1>
                    <p className="text-gray-600">
                      View meter readings by zone
                    </p>
                  </div>
                </div>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Zone Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((zone) => {
                const stats = zoneStats[zone] || {
                  totalReadings: 0,
                  totalConsumption: 0,
                };
                return (
                  <Card key={zone}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            Zone {zone}
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            {stats.totalReadings}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {stats.totalConsumption.toFixed(2)} m³ total
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by resident name or meter number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={zoneFilter} onValueChange={setZoneFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Zones</SelectItem>
                      <SelectItem value="1">Zone 1</SelectItem>
                      <SelectItem value="2">Zone 2</SelectItem>
                      <SelectItem value="3">Zone 3</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reading History Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Reading Records ({filteredReadings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Meter Number
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Resident Name
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Zone
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Previous Reading
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Present Reading
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Consumption (m³)
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Reading Date
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredReadings.map((reading) => {
                        const zoneBadge = getZoneBadge(reading.zone);
                        const readStatusBadge = getReadStatusBadge(reading.can_read_status);
                        const readingDate = reading.inclusive_date?.end
                          ? new Date(reading.inclusive_date.end).toLocaleDateString()
                          : reading.created_at
                          ? new Date(reading.created_at).toLocaleDateString()
                          : "N/A";

                        return (
                          <tr key={reading.reading_id}>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              {reading.meter_number || "N/A"}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">
                              {reading.full_name || "Unknown"}
                            </td>
                            <td className="py-4 px-6">
                              <Badge
                                className={`${zoneBadge.className} flex items-center w-fit`}
                              >
                                {zoneBadge.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <Badge
                                className={`${readStatusBadge.className} flex items-center w-fit gap-1`}
                              >
                                <readStatusBadge.icon className="h-3 w-3" />
                                {readStatusBadge.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">
                              {reading.can_read_status === 'cannot_read' ? 'N/A' : (reading.previous_reading ?? 0).toFixed(2)}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-900">
                              {reading.can_read_status === 'cannot_read' ? 'N/A' : (reading.present_reading ?? 0).toFixed(2)}
                            </td>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              {reading.can_read_status === 'cannot_read' ? 'N/A' : (reading.calculated ?? 0).toFixed(2)}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-500">
                              {readingDate}
                            </td>
                            <td className="py-4 px-6">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="h-4 w-4 mr-2" />
                                    {reading.can_read_status === 'cannot_read' ? 'View Remarks' : 'View Details'}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredReadings.length === 0 && (
                        <tr>
                          <td
                            colSpan="9"
                            className="p-8 text-center text-gray-500"
                          >
                            No reading records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
