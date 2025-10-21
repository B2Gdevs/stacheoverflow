import { db } from '@/lib/db/drizzle';
import { apiLogs, stripeLogs, NewApiLog, NewStripeLog } from '@/lib/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface LogApiRequestParams {
  eventId?: string;
  method: string;
  url: string;
  endpoint: string;
  userId?: number;
  ipAddress?: string;
  userAgent?: string;
  requestPayload?: any;
  responseStatus?: number;
  responsePayload?: any;
  duration?: number;
}

export interface LogStripeRequestParams {
  eventId?: string;
  apiLogId?: number;
  stripeRequestId?: string;
  stripeEventType?: string;
  stripeObjectType?: string;
  stripeObjectId?: string;
  requestType: string;
  requestPayload?: any;
  responsePayload?: any;
  success?: boolean;
  errorMessage?: string;
}

// Utility function to generate event IDs
export function generateEventId(): string {
  return randomUUID();
}

export class Logger {
  static async logApiRequest(params: LogApiRequestParams): Promise<number> {
    try {
      const logData: NewApiLog = {
        eventId: params.eventId || null,
        method: params.method,
        url: params.url,
        endpoint: params.endpoint,
        userId: params.userId || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        requestPayload: params.requestPayload ? JSON.stringify(params.requestPayload) : null,
        responseStatus: params.responseStatus || null,
        responsePayload: params.responsePayload ? JSON.stringify(params.responsePayload) : null,
        duration: params.duration || null,
      };

      const [log] = await db.insert(apiLogs).values(logData).returning();
      return log.id;
    } catch (error) {
      console.error('Failed to log API request:', error);
      return 0;
    }
  }

  static async logStripeRequest(params: LogStripeRequestParams): Promise<number> {
    try {
      const logData: NewStripeLog = {
        eventId: params.eventId || null,
        apiLogId: params.apiLogId || null,
        stripeRequestId: params.stripeRequestId || null,
        stripeEventType: params.stripeEventType || null,
        stripeObjectType: params.stripeObjectType || null,
        stripeObjectId: params.stripeObjectId || null,
        requestType: params.requestType,
        requestPayload: params.requestPayload ? JSON.stringify(params.requestPayload) : null,
        responsePayload: params.responsePayload ? JSON.stringify(params.responsePayload) : null,
        success: params.success !== false ? 1 : 0,
        errorMessage: params.errorMessage || null,
      };

      const [log] = await db.insert(stripeLogs).values(logData).returning();
      return log.id;
    } catch (error) {
      console.error('Failed to log Stripe request:', error);
      return 0;
    }
  }

  static async getApiLogs(limit: number = 100, offset: number = 0) {
    try {
      return await db
        .select()
        .from(apiLogs)
        .orderBy(apiLogs.timestamp)
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error('Failed to fetch API logs:', error);
      return [];
    }
  }

  static async getStripeLogs(limit: number = 100, offset: number = 0) {
    try {
      return await db
        .select()
        .from(stripeLogs)
        .orderBy(stripeLogs.timestamp)
        .limit(limit)
        .offset(offset);
    } catch (error) {
      console.error('Failed to fetch Stripe logs:', error);
      return [];
    }
  }

  static async getLogsWithStripe(limit: number = 100, offset: number = 0) {
    try {
      console.log('🔍 Starting getLogsWithStripe with limit:', limit, 'offset:', offset);
      
      // Get API logs first
      const apiLogsStart = Date.now();
      const apiLogsResult = await db
        .select()
        .from(apiLogs)
        .orderBy(desc(apiLogs.timestamp))
        .limit(limit)
        .offset(offset);
      const apiLogsEnd = Date.now();
      console.log('📊 API logs query took:', apiLogsEnd - apiLogsStart, 'ms, found:', apiLogsResult.length);

      // Get Stripe logs for these API logs
      const stripeLogsStart = Date.now();
      const apiLogIds = apiLogsResult.map(log => log.id);
      const stripeLogsResult = apiLogIds.length > 0 ? await db
        .select()
        .from(stripeLogs)
        .where(inArray(stripeLogs.apiLogId, apiLogIds)) : [];
      const stripeLogsEnd = Date.now();
      console.log('📊 Stripe logs query took:', stripeLogsEnd - stripeLogsStart, 'ms, found:', stripeLogsResult.length);

      // Combine the results
      const combineStart = Date.now();
      const result = apiLogsResult.map(apiLog => {
        const stripeLog = stripeLogsResult.find(sl => sl.apiLogId === apiLog.id) || null;
        return {
          apiLog,
          stripeLog
        };
      });
      const combineEnd = Date.now();
      console.log('📊 Combining results took:', combineEnd - combineStart, 'ms');
      
      return result;
    } catch (error) {
      console.error('❌ Failed to fetch logs:', error);
      return [];
    }
  }
}

// Helper function to extract IP address from request
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

// Helper function to safely parse JSON
export function safeJsonParse(jsonString: string | null): any {
  if (!jsonString) return null;
  try {
    return JSON.parse(jsonString);
  } catch {
    return jsonString;
  }
}
