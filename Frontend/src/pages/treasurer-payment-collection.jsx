import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Calendar,
  DollarSign,
  Edit
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";
import apiClient from "../lib/api";
import { useToast } from "../hooks/use-toast";


export default function TreasurerPaymentCollection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editingPayment, setEditingPayment] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const { toast } = useToast();

  const { data: collections, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/collections', filterStatus],
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const res = await apiClient.getRecentPayment();
      console.log("Raw API response:", res.data);
      const payments = res.data;
      console.log("Payments array:", payments);

      return payments.map((p) => ({
        id: p.payment_id,
        residentName: p.residentFullName,
        purok: p.purok,
        amount: p.amount_paid,
        method: p.payment_method,
        status: p.payment_status,
        referenceNo: p.payment_reference,
        date: p.payment_date,
        billPeriod: "August 2024"
      }));
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ paymentId, status }) => {
      const response = await apiClient.updatePaymentStatus(paymentId, status);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/v1/treasurer/collections'] });
      toast({
        title: "Status Updated",
        description: "Payment status has been successfully updated.",
      });
      setEditingPayment(null);
      setNewStatus("");
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update payment status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const paymentData = collections || [];
  console.log('this is the data', paymentData);

  const filteredData = paymentData.filter(payment => {
    const matchesSearch = payment.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.purok.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.referenceNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalCollected = filteredData
    .filter(p => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = filteredData
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "confirmed":
        return {
          label: "Confirmed",
          className: "bg-green-100 text-green-800",
          icon: CheckCircle
        };
      case "pending":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800",
          icon: Clock
        };
      case "failed":
        return {
          label: "Failed",
          className: "bg-red-100 text-red-800",
          icon: XCircle
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800",
          icon: Clock
        };
    }
  };

  const handleEditStatus = (payment) => {
    setEditingPayment(payment);
    setNewStatus(payment.status);
  };

  const handleUpdateStatus = () => {
    if (!editingPayment || !newStatus) return;
    
    updateStatusMutation.mutate({
      paymentId: editingPayment.id,
      status: newStatus
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <TreasurerSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TreasurerTopHeader />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="text-payment-collection-title">
                    Payment Collection
                  </h1>
                  <p className="text-gray-600">Track and manage payment collections</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Collected</p>
                      <p className="text-2xl font-bold text-green-600" data-testid="text-total-collected">
                        {formatCurrency(totalCollected)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Verification</p>
                      <p className="text-2xl font-bold text-yellow-600" data-testid="text-pending-amount">
                        {formatCurrency(pendingAmount)}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                      <p className="text-2xl font-bold text-blue-600" data-testid="text-total-transactions">
                        {filteredData.length}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-blue-600" />
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
                        placeholder="Search by name, account number, or reference..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-payment"
                      />
                    </div>
                  </div>
                  <div className=" flex gap-2">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      onClick={() => setFilterStatus("all")}
                      data-testid="button-filter-all"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === "confirmed" ? "default" : "outline"}
                      onClick={() => setFilterStatus("confirmed")}
                      data-testid="button-filter-confirmed"
                    >
                      Confirmed
                    </Button>
                    <Button
                      variant={filterStatus === "pending" ? "default" : "outline"}
                      onClick={() => setFilterStatus("pending")}
                      data-testid="button-filter-pending"
                    >
                      Pending
                    </Button>
                    <Button variant="outline" data-testid="button-export">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Collection Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Collections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Payment ID
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Resident
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Method
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Reference No
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((payment) => {
                        const statusConfig = getStatusConfig(payment.status);
                        const StatusIcon = statusConfig.icon;
                        return (
                          <tr key={payment.id} data-testid={`payment-row-${payment.id}`}>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              {payment.id}
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {payment.residentName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {`Purok ${payment.purok}`}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                              {formatCurrency(payment.amount)}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {payment.method}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {payment.referenceNo}
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Badge className={`${statusConfig.className} flex items-center w-fit`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditStatus(payment)}
                                  data-testid={`button-edit-status-${payment.id}`}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {formatDate(payment.date)}
                            </td>
                            <td className="py-4 px-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-view-${payment.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Edit Status Dialog */}
      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent data-testid="dialog-edit-status">
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>
              Change the status of payment {editingPayment?.id} from {editingPayment?.residentName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select New Status
            </label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger data-testid="select-new-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-yellow-600" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="confirmed">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Confirmed
                  </div>
                </SelectItem>
                <SelectItem value="failed">
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 mr-2 text-red-600" />
                    Failed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingPayment(null)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending || !newStatus}
              data-testid="button-confirm-update"
            >
              {updateStatusMutation.isPending ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}