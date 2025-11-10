import { useState } from "react";
import { useQuery, useMutation} from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { 
  AlertTriangle, 
  Search, 
  Download,
  Send,
  Loader2,
  DollarSign,
  Users,
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";
import apiClient from "../lib/api";
import { useToast } from "../hooks/use-toast";

export default function TreasurerOutstandingBalances() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sendingReminder, setSendingReminder] = useState(null);
  const [disconnectionModal, setDisconnectionModal] = useState(null); // <-- for modal
  const { toast } = useToast();

  const { data: balances, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/outstanding-balances', filterStatus],
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const res = await apiClient.getOverdueBilling();
      return res.data;
    }
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (billingId) => apiClient.sendOverdueReminder(billingId),
    onSuccess: (data) => {
      toast({
        title: "SMS Reminder Sent",
        description: `Payment reminder sent successfully to ${data.data?.residentName}`,
      });
      setSendingReminder(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Send Reminder",
        description: error.message || "Unable to send SMS reminder. Please try again.",
        variant: "destructive",
      });
      setSendingReminder(null);
    }
  });

  const balanceData = balances || [];

  const filteredData = balanceData.filter(balance => {
    const matchesSearch = balance.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         balance.accountNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || balance.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalOutstanding = filteredData.reduce((sum, b) => sum + b.totalDue, 0);
  const criticalCount = filteredData.filter(b => b.status === "critical").length;
  const totalAccounts = filteredData.length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No payment yet';
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "critical":
        return {
          label: "Critical",
          className: "bg-red-100 text-red-800",
          color: "text-red-600"
        };
      case "warning":
        return {
          label: "Warning",
          className: "bg-orange-100 text-orange-800",
          color: "text-orange-600"
        };
      case "moderate":
        return { 
          label: "Moderate",
          className: "bg-yellow-100 text-yellow-800",
          color: "text-yellow-600"
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800",
          color: "text-gray-600"
        };
    }
  };

  const handleSendReminder = (balance) => {
    if (!balance.contactNo || balance.contactNo === 'N/A') {
      toast({
        title: "No Contact Number",
        description: `${balance.residentName} does not have a contact number on file.`,
        variant: "destructive",
      });
      return;
    } 

    setSendingReminder(balance.id);
    sendReminderMutation.mutate(balance.id);
  };

  const handleMarkForDisconnection = (balance) => {
    setDisconnectionModal(balance); // open modal
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <TreasurerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
        <TreasurerTopHeader />
        
        <main className="flex-1 overflow-auto p-6 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Outstanding Balances
                  </h1>
                  <p className="text-gray-600">Monitor and manage overdue accounts</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(totalOutstanding)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Critical Accounts</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {criticalCount}
                      </p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Accounts</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {totalAccounts}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        type="text"
                        placeholder="Search by name or account number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      onClick={() => setFilterStatus("all")}
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === "critical" ? "default" : "outline"}
                      onClick={() => setFilterStatus("critical")}
                    >
                      Critical
                    </Button>
                    <Button
                      variant={filterStatus === "warning" ? "default" : "outline"}
                      onClick={() => setFilterStatus("warning")}
                    >
                      Warning
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Outstanding Balances Table */}
            <Card>
              <CardHeader>
                <CardTitle>Overdue Accounts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Account
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Resident
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Amount
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Months Overdue
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Last Payment
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((balance) => {
                        const statusConfig = getStatusConfig(balance.status);
                        const isReminding = sendingReminder === balance.id;
                        const showDisconnection = balance.monthsOverdue >= 3;

                        return (
                          <tr key={balance.id}>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              {balance.accountNo || balance.meterNo}
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {balance.residentName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {balance.contactNo}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm font-bold text-red-600">
                              {formatCurrency(balance.totalDue)}
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={statusConfig.className}>
                                {balance.monthsOverdue} {balance.monthsOverdue === 1 ? 'month' : 'months'}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {formatDate(balance.lastPayment)}
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={statusConfig.className}>
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSendReminder(balance)}
                                  disabled={isReminding || !balance.contactNo || balance.contactNo === 'N/A' || balance.status !== 'critical'}
                                >
                                  {isReminding ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="h-4 w-4 mr-1" />
                                      Remind
                                    </>
                                  )}
                                </Button>

                                {showDisconnection && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleMarkForDisconnection(balance)}
                                  >
                                    Mark for Disconnection
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Modal for Mark for Disconnection */}
              <Dialog 
                open={!!disconnectionModal} 
                onOpenChange={(open) => !open && setDisconnectionModal(null)}
              >
                <DialogContent data-testid="dialog-mark-disconnection">
                  <DialogHeader>
                    <DialogTitle>Mark for Disconnection</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to mark <strong>{disconnectionModal?.residentName}</strong> for disconnection?
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-800">
                        This will mark this account as <span className="font-semibold">For Disconnection</span>.
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDisconnectionModal(null)}
                      data-testid="button-cancel-disconnection"
                    >
                      Cancel
                    </Button>
                   <Button
                      variant="destructive"
                      onClick={async () => {
                        if (!disconnectionModal) return;
                        try {
                          const response = await apiClient.markForDisconnection(disconnectionModal.connection_id); // pass connection_id
                          setDisconnectionModal(null);
                          toast({
                            title: "Marked for Disconnection",
                            description: response.msg || `${disconnectionModal.residentName} has been marked for disconnection.`,
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: error.message || "Failed to mark for disconnection",
                            variant: "destructive",
                          });
                        }
                      }}
                      disabled={
                        !disconnectionModal || 
                        disconnectionModal.monthsOverdue < 3 || 
                        disconnectionModal.connection_status === "for_disconnection"
                      }
                      data-testid="button-confirm-disconnection"
                    >
                      Confirm
                    </Button>

                  </DialogFooter>
                </DialogContent>
              </Dialog>

          </div>
        </main>
      </div>
    </div>
  );
}
