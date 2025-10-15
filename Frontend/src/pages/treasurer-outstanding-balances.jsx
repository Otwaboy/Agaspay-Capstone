import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { 
  AlertTriangle, 
  Search, 
  Download,
  Send,
  Eye,
  Calendar,
  DollarSign,
  Users
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";
import apiClient from "../lib/api";

export default function TreasurerOutstandingBalances() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: balances, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/outstanding-balances', filterStatus],
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
        const res = await apiClient.getOverdueBilling()
        const overdueBilling = res.data
        console.log('overdue data', overdueBilling);
        

        return overdueBilling.map((ob) => ({
          
            id: ob.id,
            residentName: ob.residentName,
            meterNo: ob.meterNo,
            totalDue: ob.totalDue,
            monthsOverDue: ob.monthsOverdue,
            lastPayment: ob.lastPayment,
            dueDate: ob.dueDate,
            status: ob.status,
            contactNo: ob.contactNo
        }))
            
        
        
    }
  });

  
  //   {
  //     id: "BAL-001",
  //     residentName: "Juan Dela Cruz",
  //     accountNo: "ACC-12345",
  //     totalDue: 1350.00,
  //     monthsOverdue: 3,
  //     lastPayment: "2024-05-15",
  //     dueDate: "2024-08-15",
  //     status: "critical",
  //     contactNo: "+63 912 345 6789"
  //   },
  //   {
  //     id: "BAL-002",
  //     residentName: "Maria Santos",
  //     accountNo: "ACC-12346",
  //     totalDue: 640.00,
  //     monthsOverdue: 2,
  //     lastPayment: "2024-06-20",
  //     dueDate: "2024-08-20",
  //     status: "warning",
  //     contactNo: "+63 923 456 7890"
  //   },
  //   {
  //     id: "BAL-003",
  //     residentName: "Pedro Reyes",
  //     accountNo: "ACC-12347",
  //     totalDue: 2890.00,
  //     monthsOverdue: 5,
  //     lastPayment: "2024-03-10",
  //     dueDate: "2024-08-10",
  //     status: "critical",
  //     contactNo: "+63 934 567 8901"
  //   },
  //   {
  //     id: "BAL-004",
  //     residentName: "Ana Garcia",
  //     accountNo: "ACC-12348",
  //     totalDue: 450.00,
  //     monthsOverdue: 1,
  //     lastPayment: "2024-07-15",
  //     dueDate: "2024-08-15",
  //     status: "moderate",
  //     contactNo: "+63 945 678 9012"
  //   },
  //   {
  //     id: "BAL-005",
  //     residentName: "Roberto Luna",
  //     accountNo: "ACC-12349",
  //     totalDue: 1820.00,
  //     monthsOverdue: 4,
  //     lastPayment: "2024-04-25",
  //     dueDate: "2024-08-25",
  //     status: "critical",
  //     contactNo: "+63 956 789 0123"
  //   }
  // ];

  const balanceData = balances || [];

  console.log('mga blances data',balanceData);
  

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

  const handleSendReminder = (accountId) => {
    console.log(`Sending reminder to ${accountId}`);
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
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="text-outstanding-balances-title">
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
                      <p className="text-2xl font-bold text-red-600" data-testid="text-total-outstanding">
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
                      <p className="text-2xl font-bold text-orange-600" data-testid="text-critical-count">
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
                      <p className="text-2xl font-bold text-blue-600" data-testid="text-total-accounts">
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
                        data-testid="input-search-balance"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === "all" ? "default" : "outline"}
                      onClick={() => setFilterStatus("all")}
                      data-testid="button-filter-all"
                    >
                      All
                    </Button>
                    <Button
                      variant={filterStatus === "critical" ? "default" : "outline"}
                      onClick={() => setFilterStatus("critical")}
                      data-testid="button-filter-critical"
                    >
                      Critical
                    </Button>
                    <Button
                      variant={filterStatus === "warning" ? "default" : "outline"}
                      onClick={() => setFilterStatus("warning")}
                      data-testid="button-filter-warning"
                    >
                      Warning
                    </Button>
                    <Button variant="outline" data-testid="button-export">
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
                          Meter No
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Resident
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Due
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
                        return (
                          <tr key={balance.id} data-testid={`balance-row-${balance.id}`}>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              {balance.meterNo}
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
                                  variant="ghost"
                                  size="sm"
                                  data-testid={`button-view-${balance.id}`}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSendReminder(balance.id)}
                                  data-testid={`button-remind-${balance.id}`}
                                >
                                  <Send className="h-4 w-4 mr-1" />
                                  Remind
                                </Button>
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
          </div>
        </main>
      </div>
    </div>
  );
}
