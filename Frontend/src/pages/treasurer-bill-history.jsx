import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { 
  Receipt, 
  Search, 
  Download,
  Eye,
  Calendar,
  Filter
} from "lucide-react";
import TreasurerSidebar from "../components/layout/treasurer-sidebar";
import TreasurerTopHeader from "../components/layout/treasurer-top-header";

export default function TreasurerBillHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: billHistory, isLoading } = useQuery({
    queryKey: ['/api/v1/treasurer/bill-history', filterStatus],
    staleTime: 2 * 60 * 1000,
  });

  const mockBillHistory = [
    {
      id: "BILL-2408-001",
      residentName: "Juan Dela Cruz",
      accountNo: "ACC-12345",
      billPeriod: "August 2024",
      amount: 450.00,
      dueDate: "2024-08-31",
      status: "paid",
      paidDate: "2024-08-15",
      generatedDate: "2024-08-01"
    },
    {
      id: "BILL-2408-002",
      residentName: "Maria Santos",
      accountNo: "ACC-12346",
      billPeriod: "August 2024",
      amount: 320.00,
      dueDate: "2024-08-31",
      status: "paid",
      paidDate: "2024-08-20",
      generatedDate: "2024-08-01"
    },
    {
      id: "BILL-2408-003",
      residentName: "Pedro Reyes",
      accountNo: "ACC-12347",
      billPeriod: "August 2024",
      amount: 890.00,
      dueDate: "2024-08-31",
      status: "unpaid",
      paidDate: null,
      generatedDate: "2024-08-01"
    },
    {
      id: "BILL-2407-015",
      residentName: "Ana Garcia",
      accountNo: "ACC-12348",
      billPeriod: "July 2024",
      amount: 275.00,
      dueDate: "2024-07-31",
      status: "overdue",
      paidDate: null,
      generatedDate: "2024-07-01"
    },
    {
      id: "BILL-2408-004",
      residentName: "Roberto Luna",
      accountNo: "ACC-12349",
      billPeriod: "August 2024",
      amount: 520.00,
      dueDate: "2024-08-31",
      status: "paid",
      paidDate: "2024-08-18",
      generatedDate: "2024-08-01"
    }
  ];

  const billData = billHistory || mockBillHistory;

  const filteredData = billData.filter(bill => {
    const matchesSearch = bill.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.accountNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || bill.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalBills = filteredData.length;
  const paidBills = filteredData.filter(b => b.status === "paid").length;
  const unpaidBills = filteredData.filter(b => b.status === "unpaid").length;
  const overdueBills = filteredData.filter(b => b.status === "overdue").length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "paid":
        return {
          label: "Paid",
          className: "bg-green-100 text-green-800"
        };
      case "unpaid":
        return {
          label: "Unpaid",
          className: "bg-yellow-100 text-yellow-800"
        };
      case "overdue":
        return {
          label: "Overdue",
          className: "bg-red-100 text-red-800"
        };
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800"
        };
    }
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
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900" data-testid="text-bill-history-title">
                    Bill History
                  </h1>
                  <p className="text-gray-600">View and manage historical billing records</p>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Bills</p>
                  <p className="text-2xl font-bold text-gray-900" data-testid="text-total-bills">
                    {totalBills}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-600 mb-1">Paid Bills</p>
                  <p className="text-2xl font-bold text-green-600">
                    {paidBills}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-600 mb-1">Unpaid Bills</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {unpaidBills}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-gray-600 mb-1">Overdue Bills</p>
                  <p className="text-2xl font-bold text-red-600">
                    {overdueBills}
                  </p>
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
                        placeholder="Search by bill ID, name, or account..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-bill"
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
                      variant={filterStatus === "paid" ? "default" : "outline"}
                      onClick={() => setFilterStatus("paid")}
                      data-testid="button-filter-paid"
                    >
                      Paid
                    </Button>
                    <Button
                      variant={filterStatus === "unpaid" ? "default" : "outline"}
                      onClick={() => setFilterStatus("unpaid")}
                      data-testid="button-filter-unpaid"
                    >
                      Unpaid
                    </Button>
                    <Button
                      variant={filterStatus === "overdue" ? "default" : "outline"}
                      onClick={() => setFilterStatus("overdue")}
                      data-testid="button-filter-overdue"
                    >
                      Overdue
                    </Button>
                    <Button variant="outline" data-testid="button-export">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bill History Table */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Bill ID
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Resident
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Bill Period
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Amount
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Due Date
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Paid Date
                        </th>
                        <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredData.map((bill) => {
                        const statusConfig = getStatusConfig(bill.status);
                        return (
                          <tr key={bill.id} data-testid={`bill-row-${bill.id}`}>
                            <td className="py-4 px-6 text-sm font-medium text-gray-900">
                              {bill.id}
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {bill.residentName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {bill.accountNo}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {bill.billPeriod}
                            </td>
                            <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                              {formatCurrency(bill.amount)}
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {formatDate(bill.dueDate)}
                            </td>
                            <td className="py-4 px-6">
                              <Badge className={statusConfig.className}>
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-6 text-sm text-gray-600">
                              {formatDate(bill.paidDate)}
                            </td>
                            <td className="py-4 px-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                data-testid={`button-view-${bill.id}`}
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
    </div>
  );
}
