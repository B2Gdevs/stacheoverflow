'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Download, 
  Clock, 
  User, 
  Globe, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ApiLog {
  id: number;
  eventId: string | null;
  method: string;
  url: string;
  endpoint: string;
  userId: number | null;
  ipAddress: string | null;
  userAgent: string | null;
  requestPayload: string | null;
  responseStatus: number | null;
  responsePayload: string | null;
  duration: number | null;
  timestamp: string;
}

interface StripeLog {
  id: number;
  eventId: string | null;
  apiLogId: number | null;
  stripeRequestId: string | null;
  stripeEventType: string | null;
  stripeObjectType: string | null;
  stripeObjectId: string | null;
  requestType: string;
  requestPayload: string | null;
  responsePayload: string | null;
  success: number;
  errorMessage: string | null;
  timestamp: string;
}

interface CombinedLog {
  apiLog: ApiLog;
  stripeLog: StripeLog | null;
}

export default function AdminLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showStripeOnly, setShowStripeOnly] = useState(false);
  const [page, setPage] = useState(0);
  const limit = 50;

  const { data: logs, error, mutate, isLoading } = useSWR<CombinedLog[]>(
    `/api/admin/logs?limit=${limit}&offset=${page * limit}`,
    fetcher,
    {
      onSuccess: (data) => {
        console.log('✅ Logs fetched successfully:', data?.length || 0, 'logs');
      },
      onError: (err) => {
        console.error('❌ Error fetching logs:', err);
      },
      onLoadingSlow: () => {
        console.log('⏳ Logs request is taking a while...');
      }
    }
  );

  // Debug logging
  console.log('🔍 SWR Debug:', {
    isLoading,
    error: error?.message,
    data: logs?.length || 0,
    logs: logs,
    url: `/api/admin/logs?limit=${limit}&offset=${page * limit}`
  });


  const filteredLogs = logs?.filter(log => {
    const apiLog = log.apiLog;
    const stripeLog = log.stripeLog;

    // Search filter - Event ID exact match or fuzzy text search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      
      // First check for exact Event ID match
      if (apiLog.eventId && apiLog.eventId.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      // Then check for fuzzy text matching in various fields
      const matchesSearch = 
        apiLog.endpoint.toLowerCase().includes(searchLower) ||
        apiLog.method.toLowerCase().includes(searchLower) ||
        apiLog.url.toLowerCase().includes(searchLower) ||
        (apiLog.requestPayload && apiLog.requestPayload.toLowerCase().includes(searchLower)) ||
        (apiLog.responsePayload && apiLog.responsePayload.toLowerCase().includes(searchLower)) ||
        (stripeLog && stripeLog.requestType.toLowerCase().includes(searchLower)) ||
        (stripeLog && stripeLog.stripeRequestId && stripeLog.stripeRequestId.toLowerCase().includes(searchLower)) ||
        (stripeLog && stripeLog.stripeObjectId && stripeLog.stripeObjectId.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Method filter
    if (filterMethod !== 'ALL' && apiLog.method !== filterMethod) {
      return false;
    }

    // Status filter
    if (filterStatus !== 'ALL') {
      if (filterStatus === 'SUCCESS' && (!apiLog.responseStatus || apiLog.responseStatus >= 400)) {
        return false;
      }
      if (filterStatus === 'ERROR' && (apiLog.responseStatus && apiLog.responseStatus < 400)) {
        return false;
      }
    }

    // Stripe only filter
    if (showStripeOnly && !stripeLog) {
      return false;
    }

    return true;
  });

  const getStatusIcon = (status: number | null, stripeSuccess?: number) => {
    if (stripeSuccess !== undefined) {
      return stripeSuccess === 1 ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      );
    }
    
    if (!status) return <AlertCircle className="w-4 h-4 text-gray-500" />;
    
    if (status >= 200 && status < 300) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (status >= 400) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: number | null, stripeSuccess?: number) => {
    if (stripeSuccess !== undefined) {
      return stripeSuccess === 1 ? 'text-green-400' : 'text-red-400';
    }
    
    if (!status) return 'text-gray-400';
    
    if (status >= 200 && status < 300) {
      return 'text-green-400';
    } else if (status >= 400) {
      return 'text-red-400';
    } else {
      return 'text-yellow-400';
    }
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return 'N/A';
    return `${duration}ms`;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };


  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">API Logs</h1>
          <p className="text-red-400">Error loading logs: {error.message}</p>
          <p className="text-gray-400 mt-2">Check browser console and server logs for more details.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">API Logs</h1>
          <p className="text-gray-400">Loading logs...</p>
        </div>
      </div>
    );
  }

  if (!logs && !error) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">API Logs</h1>
          <p className="text-gray-400">No logs available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API & Stripe Logs</h1>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-600 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-gray-300">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by Event ID, endpoint, method, payload..."
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="method" className="text-gray-300">Method</Label>
                <select
                  id="method"
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  <option value="ALL">All Methods</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </div>

              <div>
                <Label htmlFor="status" className="text-gray-300">Status</Label>
                <select
                  id="status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                >
                  <option value="ALL">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="ERROR">Error</option>
                </select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={showStripeOnly}
                    onChange={(e) => setShowStripeOnly(e.target.checked)}
                    className="rounded bg-gray-800 border-gray-600"
                  />
                  <span className="text-gray-300">Stripe Only</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-gray-800 border-gray-600">
          <CardHeader>
            <CardTitle className="text-white">Request Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-600 bg-gray-700">
                    <th className="text-left p-3 text-white font-semibold">Status</th>
                    <th className="text-left p-3 text-white font-semibold">Method</th>
                    <th className="text-left p-3 text-white font-semibold">Endpoint</th>
                    <th className="text-left p-3 text-white font-semibold">Event ID</th>
                    <th className="text-left p-3 text-white font-semibold">User</th>
                    <th className="text-left p-3 text-white font-semibold">Duration</th>
                    <th className="text-left p-3 text-white font-semibold">Stripe</th>
                    <th className="text-left p-3 text-white font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs?.map((log) => (
                    <tr key={log.apiLog.id} className="border-b border-gray-600 hover:bg-gray-700/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.apiLog.responseStatus, log.stripeLog?.success)}
                          <span className={`text-sm ${getStatusColor(log.apiLog.responseStatus, log.stripeLog?.success)}`}>
                            {log.apiLog.responseStatus || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.apiLog.method === 'GET' ? 'bg-green-900/30 text-green-300' :
                          log.apiLog.method === 'POST' ? 'bg-amber-900/30 text-amber-300' :
                          log.apiLog.method === 'PUT' ? 'bg-orange-900/30 text-orange-300' :
                          log.apiLog.method === 'DELETE' ? 'bg-red-900/30 text-red-300' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {log.apiLog.method}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs truncate text-white" title={log.apiLog.endpoint}>
                          {log.apiLog.endpoint}
                        </div>
                      </td>
                      <td className="p-3">
                        {log.apiLog.eventId ? (
                          <button
                            onClick={() => navigator.clipboard.writeText(log.apiLog.eventId)}
                            className="text-xs text-green-400 font-mono hover:text-green-300 hover:bg-gray-600 px-2 py-1 rounded transition-colors cursor-pointer"
                            title={`Click to copy: ${log.apiLog.eventId}`}
                          >
                            {log.apiLog.eventId}
                          </button>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {log.apiLog.userId ? (
                          <span className="text-sm text-white">User {log.apiLog.userId}</span>
                        ) : (
                          <span className="text-sm text-gray-400">Anonymous</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-white">
                          {formatDuration(log.apiLog.duration)}
                        </span>
                      </td>
                      <td className="p-3">
                        {log.stripeLog ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded">
                              {log.stripeLog.requestType}
                            </span>
                            {log.stripeLog.success === 1 ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-white">
                          {formatTimestamp(log.apiLog.timestamp)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLogs?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-300">No logs found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
