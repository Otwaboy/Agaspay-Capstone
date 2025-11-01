import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { MapPin, Search, Users, Droplets, TrendingUp, Phone, Mail } from "lucide-react";
import MeterReaderSidebar from "../components/layout/meter-reader-sidebar";
import MeterReaderTopHeader from "../components/layout/meter-reader-top-header";
import { apiClient } from "../lib/api";

export default function MeterReaderZones() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: authUser } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const response = await apiClient.get("/auth/me");
      return response.data;
    }
  });

  const { data: connectionsResponse, isLoading } = useQuery({
    queryKey: ["zone-connections"],
    queryFn: async () => {
      return await apiClient.getLatestReadings();
    }
  });

  const meterReaderZone = authUser?.user?.assigned_zone;
  const allConnections = connectionsResponse?.connection_details || [];

  const zoneConnections = allConnections.filter((conn) => conn.zone === meterReaderZone);

  const filteredConnections = zoneConnections.filter((conn) =>
    searchQuery
      ? conn.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.purok_no?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const activeConnections = zoneConnections.filter((c) => c.status === "active").length;
  const totalConsumption = zoneConnections.reduce((sum, c) => sum + (c.present_reading || 0), 0);

  return (
    <div className="flex h-screen bg-gray-100">
      <MeterReaderSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MeterReaderTopHeader />

        <main className="flex-1 overflow-auto p-6">
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

            {isLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-500">Loading residents...</p>
                </CardContent>
              </Card>
            ) : filteredConnections.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No residents found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConnections.map((connection) => (
                  <Card key={connection.connection_id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg">{connection.full_name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">Purok {connection.purok_no}</Badge>
                            <Badge variant="secondary">Zone {connection.zone}</Badge>
                            <Badge className={connection.status === "active" ? "bg-green-500" : "bg-gray-400"}>
                              {connection.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Current Reading</p>
                          <p className="font-semibold text-blue-600">{connection.present_reading} m³</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Connection Type</p>
                          <p className="font-semibold capitalize">{connection.connection_type || "Standard"}</p>
                        </div>
                      </div>

                      {connection.contact_no && (
                        <div className="flex items-center text-sm text-gray-600 mt-2">
                          <Phone className="h-4 w-4 mr-2" />
                          <span>{connection.contact_no}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
          </div>
        </main>
      </div>
    </div>
  );
}
