import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminSessionFromRequest } from '@/lib/admin-auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for non-admin routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // Allow access to login, auth API routes, and password reset pages
  if (
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password' ||
    pathname.startsWith('/api/admin/auth/')
  ) {
    return NextResponse.next()
  }

  // Create response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Verify admin session using custom authentication
  const adminUser = verifyAdminSessionFromRequest(request)

  try {
    // Debug logging for admin API routes
    if (pathname.startsWith('/api/admin')) {
      console.log('Middleware auth check for API route:', {
        pathname,
        hasUser: !!adminUser,
        userEmail: adminUser?.email,
        username: adminUser?.username,
        userRole: adminUser?.role
      })
    }

    if (!adminUser) {
      // Redirect to login for admin pages
      if (pathname.startsWith('/admin')) {
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }

      // For API routes, let them handle their own authentication
      // This allows the API routes to implement their own auth logic
      if (pathname.startsWith('/api/admin')) {
        console.log('Middleware allowing API route to handle its own auth:', pathname)
        return NextResponse.next()
      }
    }

    // Check if user has admin role (should always be true for admin_users table users)
    const isAdmin = adminUser?.role === 'admin'

    if (!isAdmin) {
      // Redirect to login for admin pages
      if (pathname.startsWith('/admin')) {
        const loginUrl = new URL('/admin/login', request.url)
        loginUrl.searchParams.set('error', 'unauthorized')
        return NextResponse.redirect(loginUrl)
      }

      // For API routes, let them handle their own authorization
      if (pathname.startsWith('/api/admin')) {
        console.log('Middleware allowing API route to handle its own authorization:', pathname)
        return NextResponse.next()
      }
    }

    return response
  } catch (error) {
    console.error('Middleware auth error:', error)

    // Redirect to login for admin pages
    if (pathname.startsWith('/admin')) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('error', 'auth_error')
      return NextResponse.redirect(loginUrl)
    }

    // For API routes, let them handle their own errors
    if (pathname.startsWith('/api/admin')) {
      console.log('Middleware allowing API route to handle its own errors:', pathname)
      return NextResponse.next()
    }

    return response
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
}
