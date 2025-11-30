import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  ClipboardList,
  Search,
  TrendingUp,
  Droplet,
  MapPin,
  Gauge,
  User,
} from "lucide-react";
import Sidebar from "../components/layout/sidebar";
import TopHeader from "../components/layout/top-header";
import { apiClient } from "../lib/api";
import { format } from "date-fns";

export default function ReadingHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");

  const { data: readingsData, isLoading, error } = useQuery({
    queryKey: ["reading-history", zoneFilter, searchTerm],
    queryFn: async () => {
      const response = await apiClient.getReadingHistory();
      return response;
    },
  });

  const readings = readingsData?.meter_readings || [];

  const filteredReadings = readings.filter((reading) => {
    const zone = reading.connection_id?.zone?.toString();
    const resident = reading.connection_id?.resident_id;
    const residentName = resident
      ? `${resident.first_name || ""} ${resident.last_name || ""}`
      : "Unknown";
    const meterNo = reading.connection_id?.meter_no || "";

    const matchesZone = zoneFilter === "all" || zone === zoneFilter;

    const matchesSearch =
      searchTerm === "" ||
      residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meterNo.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesZone && matchesSearch;
  });

  const stats = {
    totalReadings: filteredReadings.length,
    totalConsumption: filteredReadings.reduce((sum, r) => sum + (r.calculated || 0), 0),
    avgConsumption:
      filteredReadings.length > 0
        ? (filteredReadings.reduce((sum, r) => sum + (r.calculated || 0), 0) / filteredReadings.length).toFixed(1)
        : 0,
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { label: "Submitted", className: "bg-blue-100 text-blue-800" },
      approved: { label: "Approved", className: "bg-green-100 text-green-800" },
      inprogress: { label: "In Progress", className: "bg-yellow-100 text-yellow-800" },
    };
    return statusConfig[status] || statusConfig.inprogress;
  };

  const getConsumptionBadge = (consumption) => {
    if (consumption > 20) return "bg-red-100 text-red-800";
    if (consumption >= 10) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  };

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-auto p-6">
            <div className="text-center text-red-600">
              Error loading reading history
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Droplet className="h-8 w-8 text-blue-600" />
                Reading History
              </h1>
              <p className="text-gray-600 mt-2">
                View meter reading history across all zones
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Readings</p>
                      <p className="text-3xl font-bold mt-1 text-gray-900">
                        {stats.totalReadings}
                      </p>
                    </div>
                    <ClipboardList className="h-10 w-10 text-blue-600 opacity-60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Consumption</p>
                      <p className="text-3xl font-bold mt-1 text-gray-900">
                        {stats.totalConsumption.toFixed(1)} m³
                      </p>
                    </div>
                    <Gauge className="h-10 w-10 text-cyan-600 opacity-60" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Consumption</p>
                      <p className="text-3xl font-bold mt-1 text-gray-900">
                        {stats.avgConsumption} m³
                      </p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-teal-600 opacity-60" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  Filter by Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => setZoneFilter("all")}
                    variant={zoneFilter === "all" ? "default" : "outline"}
                    className={
                      zoneFilter === "all"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-gray-300"
                    }
                  >
                    All Zones
                  </Button>
                  <Button
                    onClick={() => setZoneFilter("1")}
                    variant={zoneFilter === "1" ? "default" : "outline"}
                    className={
                      zoneFilter === "1"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-gray-300"
                    }
                  >
                    Zone 1
                  </Button>
                  <Button
                    onClick={() => setZoneFilter("2")}
                    variant={zoneFilter === "2" ? "default" : "outline"}
                    className={
                      zoneFilter === "2"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-gray-300"
                    }
                  >
                    Zone 2
                  </Button>
                  <Button
                    onClick={() => setZoneFilter("3")}
                    variant={zoneFilter === "3" ? "default" : "outline"}
                    className={
                      zoneFilter === "3"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-gray-300"
                    }
                  >
                    Zone 3
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 shadow-md">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Search Readings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search by resident name or meter number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="pb-4 border-b">
                <CardTitle>Reading Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-500">
                    Loading reading history...
                  </div>
                ) : filteredReadings.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No readings found for the selected filters.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Resident
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Meter No
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Zone
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Previous
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Present
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Consumption
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Meter Reader
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredReadings.map((reading) => {
                          const resident = reading.connection_id?.resident_id;
                          const residentName = resident
                            ? `${resident.first_name || ""} ${resident.last_name || ""}`
                            : "Unknown";
                          const zone = reading.connection_id?.zone || "N/A";
                          const meterNo = reading.connection_id?.meter_no || "N/A";
                          const meterReader = reading.recorded_by?.first_name
                            ? `${reading.recorded_by.first_name} ${reading.recorded_by.last_name || ""}`
                            : "Unknown";
                          const statusConfig = getStatusBadge(reading.reading_status);
                          const consumptionBadge = getConsumptionBadge(
                            reading.calculated || 0
                          );

                          return (
                            <tr
                              key={reading._id}
                              className="hover:bg-blue-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm text-gray-900 font-medium">
                                    {residentName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {meterNo}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className="bg-indigo-100 text-indigo-800">
                                  Zone {zone}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {reading.previous_reading} m³
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {reading.present_reading} m³
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={consumptionBadge}>
                                  {reading.calculated || 0} m³
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {format(
                                  new Date(reading.created_at),
                                  "MMM dd, yyyy"
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={statusConfig.className}>
                                  {statusConfig.label}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {meterReader}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
