import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Droplets, MapPin, Loader2 } from "lucide-react";
import { apiClient } from "../../lib/api";
import ResidentBillPaymentCard from "./resident-bill-payment-card";
import ResidentUsageChart from "./resident-usage-chart";
import ResidentRecentTransactions from "./resident-recent-transactions";

export default function ResidentMultiMeterCards({ selectedMeter, onMeterChange }) {
  // Fetch all meters for the logged-in resident
  const { data: metersData, isLoading } = useQuery({
    queryKey: ["resident-meters"],
    queryFn: async () => {
      const res = await apiClient.getResidentMeters();
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!metersData || metersData.length === 0) {
    return (
      <Card className="bg-white/70 backdrop-blur-md border border-white/30 shadow-sm">
        <CardContent className="p-6 text-center">
          <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No water connections found</p>
          <p className="text-sm text-gray-500 mt-1">Please contact the barangay office to set up your water connection.</p>
        </CardContent>
      </Card>
    );
  }

  // Auto-select first meter if none selected
  const currentMeter = selectedMeter || metersData[0];

  const getStatusColor = (status) => {
    const statusMap = {
      'active': 'bg-green-100 text-green-700 border-green-200',
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'disconnected': 'bg-red-100 text-red-700 border-red-200',
      'for_disconnection': 'bg-orange-100 text-orange-700 border-orange-200',
      'scheduled_for_disconnection': 'bg-orange-100 text-orange-700 border-orange-200',
      'for_reconnection': 'bg-blue-100 text-blue-700 border-blue-200',
      'scheduled_for_reconnection': 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return statusMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatStatus = (status) => {
    const statusFormatMap = {
      'active': 'Active',
      'pending': 'Pending',
      'disconnected': 'Disconnected',
      'for_disconnection': 'For Disconnection',
      'scheduled_for_disconnection': 'Scheduled for Disconnection',
      'for_reconnection': 'For Reconnection',
      'scheduled_for_reconnection': 'Scheduled for Reconnection',
    };
    return statusFormatMap[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Meter Selector Card */}
      <Card className="bg-white/70 backdrop-blur-md border border-white/30 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Droplets className="h-5 w-5 text-blue-600" />
            My Water Connections ({metersData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {metersData.map((meter) => (
              <Button
                key={meter.connection_id}
                variant={currentMeter?.connection_id === meter.connection_id ? "default" : "outline"}
                className={`h-auto py-4 px-4 flex flex-col items-start text-left space-y-2 ${
                  currentMeter?.connection_id === meter.connection_id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onMeterChange(meter)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-base">
                    Meter No: {meter.meter_no}
                  </span>
                  <Badge
                    className={`text-xs ${
                      currentMeter?.connection_id === meter.connection_id
                        ? 'bg-white/20 text-white border-white/30'
                        : getStatusColor(meter.connection_status)
                    }`}
                  >
                    {formatStatus(meter.connection_status)}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Zone {meter.zone}, Purok {meter.purok}</span>
                </div>
                <div className="text-xs opacity-90">
                 Connection Type: {meter.type.charAt(0).toUpperCase() + meter.type.slice(1)} 
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bill Payment Card for Selected Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <ResidentBillPaymentCard connectionId={currentMeter.connection_id} />
        </div>
        <div className="lg:col-span-2">
          <ResidentUsageChart connectionId={currentMeter.connection_id} />
        </div>
      </div>

      {/* Recent Transactions for Selected Meter */}
      <ResidentRecentTransactions connectionId={currentMeter.connection_id} />
    </div>
  );
}
