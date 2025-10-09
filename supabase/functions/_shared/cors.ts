/**
 * CORS Utility Module
 * Handles CORS headers with support for multiple allowed origins
 */

const ALLOWED_ORIGINS = [
  'https://viralslides.ai',
  'https://www.viralslides.ai',
  'http://localhost:5173',
  'http://localhost:3000',
];

/**
 * Get allowed origin based on request origin
 * Returns the matching origin or falls back to primary domain
 */
export function getAllowedOrigin(requestOrigin: string | null): string {
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }
  return 'https://viralslides.ai';
}

/**
 * Get CORS headers for a request
 * Automatically determines the correct Access-Control-Allow-Origin
 */
export function getCorsHeaders(request: Request): { [key: string]: string } {
  const origin = request.headers.get('Origin');

  return {
    'Access-Control-Allow-Origin': getAllowedOrigin(origin),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Handle OPTIONS preflight request
 */
export function handleCorsPreflightRequest(request: Request): Response {
  const corsHeaders = getCorsHeaders(request);
  return new Response('ok', {
    headers: corsHeaders,
    status: 204, // No Content
  });
}
