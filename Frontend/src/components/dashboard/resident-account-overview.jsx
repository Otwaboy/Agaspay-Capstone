import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Droplets, MapPin, Calendar, CreditCard, CheckCircle, AlertTriangle } from "lucide-react";
import {apiClient} from "../../lib/api"


export default function ResidentAccountOverview() {


   // use query lets you fetch, cache, and update data in your frontend app.
 const { data: accountData, isLoading } = useQuery({
    queryKey: ["/api/v1/user"],
    queryFn: async () => {
      const res = await apiClient.getUserAccount(); 
      const user = res.user; // backend returns { success, user }
       
      return {
        accountName: user.fullname,
        serviceAddress: `Purok ${user.purok}, Biking ${user.zone} Dauis, Bohol`,
        connectionType: user.type.charAt(0)?.toUpperCase()+ user.type.slice(1),
        meterNumber: user.meter_no,
        serviceStatus: user.status.charAt(0)?.toUpperCase()+ user.status.slice(1),

        // Mock/placeholder values (since backend doesn't give them yet)
        connectionDate: "2023-01-15",
        nextBillDate: "2024-09-01",
      };
    },
    
  });


  // getting billing datail
  const {data: billingData, isBillLoading} = useQuery({
    queryKey: ["billing-summary"],
    queryFn: async () => {
      const res = await apiClient.getCurrentBill(); 

      const bill = res.data; 
      if (!bill || bill.length === 0) {
        return null; // no bills
      }
      const latestBill = bill[bill.length - 2];
      const currentBill = bill[bill.length - 1];

      return {
      lastReading: latestBill.present_reading,
      presentReading: latestBill.present_reading,
      consumption: latestBill.calculated,
      totalAmount: currentBill.total_amount,
      readAt: latestBill.created_at
      };
    },
   
  })


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

  if (isBillLoading) {
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
                <p className="text-sm font-medium text-gray-900">Account Name</p>
                <p className="text-sm text-gray-600">{accountData.accountName}</p>
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
                <p className="text-sm font-medium text-gray-900">Connection Status</p>
                <p className="text-sm text-gray-600">
                  {accountData.serviceStatus}
                </p>
              </div>
            </div>
          </div>




          {/* Meter Information ug previous reading info */}
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
                    {isBillLoading 
                      ? "Loading..." 
                      : billingData?.lastReading 
                        ? billingData.lastReading 
                        : "No record found"} cubic meters
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Reading Date:</span>
                  <span className="text-sm font-medium text-blue-900">
                    {isBillLoading
                    ? "Loading..."
                    : (billingData?.readAt && new Date(billingData.readAt).toLocaleDateString()) || "No record found"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Monthly Usage:</span>
                  <span className="text-sm font-medium text-blue-900">
                   {isBillLoading
                    ? "Loading..."
                    : billingData?.consumption ?? "No record found"}
                  cubic meters
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
                <span className="text-lg font-bold text-gray-900">
                  ₱{billingData?.totalAmount != null
                  ? billingData.totalAmount.toFixed(2)
                  : "0.00"}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Next Bill Date</span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {accountData?.nextBillDate 
                  ? new Date(accountData.nextBillDate).toLocaleDateString() 
                  : "Loading..."}
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