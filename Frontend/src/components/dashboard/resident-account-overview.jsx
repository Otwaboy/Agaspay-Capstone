import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Droplets, MapPin, Calendar, CreditCard, CheckCircle, AlertTriangle } from "lucide-react";

export default function ResidentAccountOverview() {
  const { data: accountData, isLoading } = useQuery({
    queryKey: ['/api/resident/account'],
    initialData: {
      accountNumber: "WS-2024-001247",
      serviceAddress: "Block 5 Lot 12, Biking Zone 2, Dauis, Bohol",
      connectionType: "Residential",
      meterNumber: "MTR-789456",
      serviceStatus: "Active",
      connectionDate: "2023-01-15",
      lastMeterReading: {
        date: "2024-08-15",
        reading: 1245,
        consumption: 15
      },
      currentBalance: 450.00,
      nextBillDate: "2024-09-01"
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Skeleton className="h-5 w-5 mr-2" />
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "suspended": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Droplets className="h-5 w-5 mr-2 text-blue-600" />
              Account Overview
            </CardTitle>
            <CardDescription>Your water service account information</CardDescription>
          </div>
          <Badge className={getStatusColor(accountData.serviceStatus)}>
            {accountData.serviceStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Details */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Account Number</p>
                <p className="text-sm text-gray-600">{accountData.accountNumber}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Service Address</p>
                <p className="text-sm text-gray-600">{accountData.serviceAddress}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Droplets className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Connection Type</p>
                <p className="text-sm text-gray-600">{accountData.connectionType}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Connected Since</p>
                <p className="text-sm text-gray-600">
                  {new Date(accountData.connectionDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Meter Information */}
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-3">Meter Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Meter Number:</span>
                  <span className="text-sm font-medium text-blue-900">{accountData.meterNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Last Reading:</span>
                  <span className="text-sm font-medium text-blue-900">
                    {accountData.lastMeterReading.reading} cubic meters
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Reading Date:</span>
                  <span className="text-sm font-medium text-blue-900">
                    {new Date(accountData.lastMeterReading.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Monthly Usage:</span>
                  <span className="text-sm font-medium text-blue-900">
                    {accountData.lastMeterReading.consumption} cubic meters
                  </span>
                </div>
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Current Balance</span>
                </div>
                <span className="text-lg font-bold text-gray-900">₱{accountData.currentBalance.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Next Bill Date</span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {new Date(accountData.nextBillDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <Button 
              className="flex items-center space-x-2"
              onClick={() => window.dispatchEvent(new Event("openPayBillModal"))}
              data-testid="button-pay-bill"
            >
              <CreditCard className="h-4 w-4" />
              <span>Pay Bill</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Droplets className="h-4 w-4" />
              <span>View Usage History</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Report Issue</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}