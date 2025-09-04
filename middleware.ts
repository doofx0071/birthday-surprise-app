import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for non-admin routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next()
  }

  // Allow access to login and password reset pages
  if (pathname === '/admin/login' || pathname === '/admin/forgot-password' || pathname === '/admin/reset-password') {
    return NextResponse.next()
  }

  // Create response object for cookie handling
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    // Get user session
    const { data: { user }, error } = await supabase.auth.getUser()

    // Debug logging for admin API routes
    if (pathname.startsWith('/api/admin')) {
      console.log('Middleware auth check for API route:', {
        pathname,
        hasUser: !!user,
        userEmail: user?.email,
        authError: error?.message,
        userRole: user?.user_metadata?.role || user?.app_metadata?.role
      })
    }

    if (error || !user) {
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

    // Check if user has admin role
    const isAdmin = user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin'

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
