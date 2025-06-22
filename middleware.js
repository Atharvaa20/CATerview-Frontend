import { NextResponse } from 'next/server';

export function middleware(request) {
  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  }

  // Handle dynamic experience routes
  if (request.nextUrl.pathname.startsWith('/experience/')) {
    const url = request.nextUrl.clone();
    // Ensure we don't redirect API routes
    if (!url.pathname.startsWith('/experience/api/')) {
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/experience/:path*',
  ],
};
