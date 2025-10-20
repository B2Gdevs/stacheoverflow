import { NextRequest, NextResponse } from 'next/server';
import { Logger, getClientIP, generateEventId } from '@/lib/logging';
import { getUser } from '@/lib/db/queries';

export async function withLogging(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const eventId = generateEventId();
  const method = request.method;
  const url = request.url;
  const endpoint = new URL(url).pathname;
  const ipAddress = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  let requestPayload: any = null;
  let userId: number | undefined;

  // Get user if authenticated
  try {
    const user = await getUser();
    userId = user?.id;
  } catch (error) {
    // User might not be authenticated, that's okay
  }

  // Get request payload for POST/PUT requests
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    try {
      const contentType = request.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const clonedRequest = request.clone();
        requestPayload = await clonedRequest.json();
      } else if (contentType?.includes('application/x-www-form-urlencoded')) {
        const clonedRequest = request.clone();
        const formData = await clonedRequest.formData();
        requestPayload = Object.fromEntries(formData.entries());
      }
    } catch (error) {
      // Failed to parse request body, that's okay
      requestPayload = { error: 'Failed to parse request body' };
    }
  }

  // Execute the handler
  let response: NextResponse;
  let responsePayload: any = null;
  let responseStatus: number;

  try {
    response = await handler(request);
    responseStatus = response.status;

    // Try to get response payload
    try {
      const clonedResponse = response.clone();
      const contentType = clonedResponse.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        responsePayload = await clonedResponse.json();
      }
    } catch (error) {
      // Failed to parse response body, that's okay
    }
  } catch (error) {
    // Handler threw an error
    responseStatus = 500;
    responsePayload = { error: error instanceof Error ? error.message : 'Unknown error' };
    response = NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }

  const duration = Date.now() - startTime;

  // Log the API request
  const apiLogId = await Logger.logApiRequest({
    eventId,
    method,
    url,
    endpoint,
    userId,
    ipAddress,
    userAgent,
    requestPayload,
    responseStatus,
    responsePayload,
    duration,
  });

  // Add the event ID and API log ID to response headers for debugging
  response.headers.set('x-event-id', eventId);
  response.headers.set('x-api-log-id', apiLogId.toString());

  return response;
}
