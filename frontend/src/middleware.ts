import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROTECTED_ROUTES, PUBLIC_ROUTES } from "@/app/config";

const protectedRoutes = PROTECTED_ROUTES;
const publicRoutes = PUBLIC_ROUTES;

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get("token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const { pathname } = request.nextUrl;

  // Skip middleware on api routes and static files
  if (
    pathname.includes("/_next") ||
    pathname.includes("/api") ||
    pathname.includes("/static") ||
    pathname.includes("/images") ||
    pathname.includes("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/my-projects", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next (Next.js internals)
     * - static (static files)
     * - favicon.ico (favicon file)
     * - images (image files)
     * - public folder
     * - api routes
     */
    "/((?!_next|static|favicon.ico|images|public|api).*)",
  ],
};
