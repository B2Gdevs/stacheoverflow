'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Music, 
  CreditCard, 
  TrendingUp, 
  Shield,
  Upload,
  DollarSign,
  Activity
} from 'lucide-react';

// Mock data for admin dashboard
const mockStats = {
  totalUsers: 1247,
  totalBeats: 89,
  totalRevenue: 12450,
  activeSubscriptions: 234,
  newUsersThisMonth: 45,
  beatsUploadedThisMonth: 12,
  revenueThisMonth: 2340,
  adminUsers: 3
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(mockStats);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-300 mt-1">Manage your beats marketplace</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          <span className="text-green-500 font-medium">Admin Access</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-green-500">+{stats.newUsersThisMonth} this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Beats</CardTitle>
            <Music className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalBeats}</div>
            <p className="text-xs text-green-500">+{stats.beatsUploadedThisMonth} this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-500">+${stats.revenueThisMonth} this month</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeSubscriptions}</div>
            <p className="text-xs text-gray-400">Monthly recurring</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-500" />
              Beat Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-300 text-sm">Upload and manage beats in your marketplace</p>
            <Button className="w-full bg-green-500 hover:bg-green-600">
              Upload New Beat
            </Button>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
              Manage Beats
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-300 text-sm">Manage users, roles, and permissions</p>
            <Button className="w-full bg-green-500 hover:bg-green-600">
              View All Users
            </Button>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
              Promote to Admin
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-500" />
              Payment Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-300 text-sm">Monitor payments and subscriptions</p>
            <Button className="w-full bg-green-500 hover:bg-green-600">
              View Payments
            </Button>
            <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
              Subscription Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-white text-sm">New user registered</p>
                  <p className="text-gray-400 text-xs">john@example.com - 2 minutes ago</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                View
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-white text-sm">Beat uploaded</p>
                  <p className="text-gray-400 text-xs">"Midnight Vibes" by StachO - 15 minutes ago</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                View
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-white text-sm">Payment received</p>
                  <p className="text-gray-400 text-xs">$29.99 from user@example.com - 1 hour ago</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="border-gray-600 text-gray-300">
                View
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
