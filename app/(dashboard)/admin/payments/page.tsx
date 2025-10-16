'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Search, 
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

// Mock payment data
const mockPayments = [
  {
    id: 1,
    customerEmail: "john@example.com",
    customerName: "John Doe",
    amount: 2999, // in cents
    currency: "usd",
    status: "succeeded",
    description: "Beat Purchase - Lonely King",
    createdAt: "2024-01-20T10:30:00Z",
    paymentMethod: "card_****4242"
  },
  {
    id: 2,
    customerEmail: "jane@example.com",
    customerName: "Jane Smith",
    amount: 3499,
    currency: "usd",
    status: "succeeded",
    description: "Beat Purchase - Said Too Much",
    createdAt: "2024-01-20T09:15:00Z",
    paymentMethod: "card_****1234"
  },
  {
    id: 3,
    customerEmail: "mike@example.com",
    customerName: "Mike Johnson",
    amount: 1200,
    currency: "usd",
    status: "pending",
    description: "Monthly Subscription - Plus Plan",
    createdAt: "2024-01-20T08:45:00Z",
    paymentMethod: "card_****5678"
  },
  {
    id: 4,
    customerEmail: "sarah@example.com",
    customerName: "Sarah Wilson",
    amount: 800,
    currency: "usd",
    status: "failed",
    description: "Monthly Subscription - Base Plan",
    createdAt: "2024-01-19T16:20:00Z",
    paymentMethod: "card_****9012"
  }
];

export default function PaymentManagement() {
  const [payments, setPayments] = useState(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-500 text-white flex items-center gap-1"><CheckCircle className="h-3 w-3" />Succeeded</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white flex items-center gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white flex items-center gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
      default:
        return <Badge variant="outline" className="border-gray-600 text-gray-300">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalRevenue = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Payment Management</h1>
          <p className="text-gray-300 mt-1">Monitor payments and subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-green-500 hover:bg-green-600">
            <TrendingUp className="h-4 w-4 mr-2" />
            Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatAmount(totalRevenue, 'usd')}</div>
            <p className="text-xs text-green-500">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{formatAmount(pendingAmount, 'usd')}</div>
            <p className="text-xs text-gray-400">{payments.filter(p => p.status === 'pending').length} transactions</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">94.2%</div>
            <p className="text-xs text-green-500">+2.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('all')}
            className={selectedStatus === 'all' ? 'bg-green-500 hover:bg-green-600' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
          >
            All
          </Button>
          <Button
            variant={selectedStatus === 'succeeded' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('succeeded')}
            className={selectedStatus === 'succeeded' ? 'bg-green-500 hover:bg-green-600' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
          >
            Succeeded
          </Button>
          <Button
            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('pending')}
            className={selectedStatus === 'pending' ? 'bg-green-500 hover:bg-green-600' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
          >
            Pending
          </Button>
          <Button
            variant={selectedStatus === 'failed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStatus('failed')}
            className={selectedStatus === 'failed' ? 'bg-green-500 hover:bg-green-600' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
          >
            Failed
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-green-500" />
            Recent Payments ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-amber-600/20 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{payment.customerName}</h3>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {payment.customerEmail}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(payment.createdAt)}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {payment.paymentMethod}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mt-1">{payment.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">{formatAmount(payment.amount, payment.currency)}</div>
                    <div className="text-xs text-gray-400 uppercase">{payment.currency}</div>
                  </div>
                  <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
