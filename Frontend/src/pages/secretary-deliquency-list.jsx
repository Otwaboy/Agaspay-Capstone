import { useState } from "react";
import { useQuery} from "@tanstack/react-query";
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
import SecretarySidebar from "../components/layout/secretary-sidebar";
import SecretaryTopHeader from "../components/layout/secretary-top-header";
import apiClient from "../lib/api";


export default function SecretaryDeliquencyList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");


  const { data: balances } = useQuery({
    queryKey: ['/api/v1/treasurer/outstanding-balances', filterStatus],
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const res = await apiClient.getOverdueBilling();
      return res.data;
    }
  });

  console.log('balances', balances);
 
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




  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <SecretarySidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-20 right-20 w-64 h-64 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-200 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
        
      <SecretaryTopHeader />
        
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
                    Deliquency Records
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
                   
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Outstanding Balances Table */}
            <Card>
              <CardHeader>
                <CardTitle>Deliquency Accounts</CardTitle>
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
                            Purok
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
                       
                      </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((balance) => {
                        const statusConfig = getStatusConfig(balance.status);
                       

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
                             <td className="py-4 px-6">
                                 <p className="text-sm font-medium text-gray-900">
                                  Purok {balance.purok}  </p>
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
    </div>
  );
}
