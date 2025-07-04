// Simple middleware - can be enhanced with Clerk when authentication is configured
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For now, just pass through all requests
  // When Clerk is configured, this can be enhanced with authentication
  console.log('Middleware processing request:', request.url);
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};