import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// middleware is applied to all routes, use conditionals to select
export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req });

    // Redirect to /app logged in users
    if (!req.nextUrl.pathname.startsWith("/app") && token) {
      return NextResponse.redirect(new URL("/app", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.nextUrl.pathname.startsWith("/app") && token === null) {
          return false;
        }

        return true;
      },
    },
  }
);
