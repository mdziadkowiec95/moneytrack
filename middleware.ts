import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// middleware is applied to all routes, use conditionals to select
export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req })

    // Redirect to /app logged in users
    if (
      !req.nextUrl.pathname.startsWith('/app') &&
      !req.nextUrl.pathname.startsWith('/api') &&
      token
    ) {
      return NextResponse.redirect(new URL('/app', req.url))
    }

    // const requestHeaders = new Headers(req.headers)
    // requestHeaders.set('x-url', req.url)

    // return NextResponse.next({
    //   request: {
    //     // Apply new request headers
    //     headers: requestHeaders,
    //   },
    // })
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith('/app') && token === null) {
          return false
        }

        return true
      },
    },
  }
)
