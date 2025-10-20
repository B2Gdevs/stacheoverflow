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
  Eye, 
  Clock, 
  User, 
  Globe, 
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import useSWR from 'swr';

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
  const [selectedLog, setSelectedLog] = useState<CombinedLog | null>(null);
  const [page, setPage] = useState(0);
  const limit = 50;

  const { data: logs, error, mutate, isLoading } = useSWR<CombinedLog[]>(
    `/api/admin/logs?limit=${limit}&offset=${page * limit}`,
    {
      onSuccess: (data) => {
        console.log('Logs fetched successfully:', data?.length || 0, 'logs');
      },
      onError: (err) => {
        console.error('Error fetching logs:', err);
      },
      onLoadingSlow: () => {
        console.log('Logs request is taking a while...');
      }
    }
  );


  const filteredLogs = logs?.filter(log => {
    const apiLog = log.apiLog;
    const stripeLog = log.stripeLog;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        apiLog.endpoint.toLowerCase().includes(searchLower) ||
        apiLog.method.toLowerCase().includes(searchLower) ||
        (apiLog.requestPayload && apiLog.requestPayload.toLowerCase().includes(searchLower)) ||
        (stripeLog && stripeLog.requestType.toLowerCase().includes(searchLower));
      
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

  const safeJsonParse = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return jsonString;
    }
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
        <Card className="bg-gray-900 border-gray-700 mb-6">
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
                    placeholder="Search endpoints, methods..."
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
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
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Request Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-3 text-gray-300">Status</th>
                    <th className="text-left p-3 text-gray-300">Method</th>
                    <th className="text-left p-3 text-gray-300">Endpoint</th>
                    <th className="text-left p-3 text-gray-300">Event ID</th>
                    <th className="text-left p-3 text-gray-300">User</th>
                    <th className="text-left p-3 text-gray-300">Duration</th>
                    <th className="text-left p-3 text-gray-300">Stripe</th>
                    <th className="text-left p-3 text-gray-300">Time</th>
                    <th className="text-left p-3 text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs?.map((log) => (
                    <tr key={log.apiLog.id} className="border-b border-gray-800 hover:bg-gray-800/50">
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
                          log.apiLog.method === 'GET' ? 'bg-blue-900/20 text-blue-400' :
                          log.apiLog.method === 'POST' ? 'bg-green-900/20 text-green-400' :
                          log.apiLog.method === 'PUT' ? 'bg-yellow-900/20 text-yellow-400' :
                          log.apiLog.method === 'DELETE' ? 'bg-red-900/20 text-red-400' :
                          'bg-gray-900/20 text-gray-400'
                        }`}>
                          {log.apiLog.method}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs truncate" title={log.apiLog.endpoint}>
                          {log.apiLog.endpoint}
                        </div>
                      </td>
                      <td className="p-3">
                        {log.apiLog.eventId ? (
                          <span className="text-xs text-blue-400 font-mono" title={log.apiLog.eventId}>
                            {log.apiLog.eventId.substring(0, 8)}...
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {log.apiLog.userId ? (
                          <span className="text-sm text-gray-300">User {log.apiLog.userId}</span>
                        ) : (
                          <span className="text-sm text-gray-500">Anonymous</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-gray-300">
                          {formatDuration(log.apiLog.duration)}
                        </span>
                      </td>
                      <td className="p-3">
                        {log.stripeLog ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-purple-900/20 text-purple-400 px-2 py-1 rounded">
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
                        <span className="text-sm text-gray-300">
                          {formatTimestamp(log.apiLog.timestamp)}
                        </span>
                      </td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedLog(log)}
                          className="border-gray-600 text-gray-300 hover:bg-gray-800"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLogs?.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No logs found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-gray-900 border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">Log Details</CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedLog(null)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Log Details */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">API Request</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Method:</span>
                      <span className="ml-2 text-white">{selectedLog.apiLog.method}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className="ml-2 text-white">{selectedLog.apiLog.responseStatus || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <span className="ml-2 text-white">{formatDuration(selectedLog.apiLog.duration)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">User ID:</span>
                      <span className="ml-2 text-white">{selectedLog.apiLog.userId || 'Anonymous'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">Event ID:</span>
                      <span className="ml-2 text-white font-mono text-xs">{selectedLog.apiLog.eventId || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">URL:</span>
                      <span className="ml-2 text-white break-all">{selectedLog.apiLog.url}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400">User Agent:</span>
                      <span className="ml-2 text-white text-xs break-all">{selectedLog.apiLog.userAgent || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Request Payload */}
                {selectedLog.apiLog.requestPayload && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Request Payload</h3>
                    <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                      {JSON.stringify(safeJsonParse(selectedLog.apiLog.requestPayload), null, 2)}
                    </pre>
                  </div>
                )}

                {/* Response Payload */}
                {selectedLog.apiLog.responsePayload && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Response Payload</h3>
                    <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                      {JSON.stringify(safeJsonParse(selectedLog.apiLog.responsePayload), null, 2)}
                    </pre>
                  </div>
                )}

                {/* Stripe Log Details */}
                {selectedLog.stripeLog && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Stripe Request</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-400">Type:</span>
                        <span className="ml-2 text-white">{selectedLog.stripeLog.requestType}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Success:</span>
                        <span className="ml-2 text-white">{selectedLog.stripeLog.success === 1 ? 'Yes' : 'No'}</span>
                      </div>
                      {selectedLog.stripeLog.stripeRequestId && (
                        <div>
                          <span className="text-gray-400">Request ID:</span>
                          <span className="ml-2 text-white">{selectedLog.stripeLog.stripeRequestId}</span>
                        </div>
                      )}
                      {selectedLog.stripeLog.stripeObjectId && (
                        <div>
                          <span className="text-gray-400">Object ID:</span>
                          <span className="ml-2 text-white">{selectedLog.stripeLog.stripeObjectId}</span>
                        </div>
                      )}
                    </div>

                    {selectedLog.stripeLog.requestPayload && (
                      <div className="mb-4">
                        <h4 className="text-md font-semibold text-white mb-2">Stripe Request Payload</h4>
                        <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                          {JSON.stringify(safeJsonParse(selectedLog.stripeLog.requestPayload), null, 2)}
                        </pre>
                      </div>
                    )}

                    {selectedLog.stripeLog.responsePayload && (
                      <div>
                        <h4 className="text-md font-semibold text-white mb-2">Stripe Response Payload</h4>
                        <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                          {JSON.stringify(safeJsonParse(selectedLog.stripeLog.responsePayload), null, 2)}
                        </pre>
                      </div>
                    )}

                    {selectedLog.stripeLog.errorMessage && (
                      <div>
                        <h4 className="text-md font-semibold text-red-400 mb-2">Error Message</h4>
                        <p className="text-red-400">{selectedLog.stripeLog.errorMessage}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
