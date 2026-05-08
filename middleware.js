import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const adminRoutes = ["/admin"];
const userRoutes = ["/dashboard", "/report", "/issues"];
const authRoutes = ["/login", "/signup"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const user = token ? await verifyToken(token) : null;

  const isAuthRoute = authRoutes.some((r) => pathname === r);
  const isAdminRoute = adminRoutes.some((r) => pathname.startsWith(r));
  const isUserRoute = userRoutes.some((r) => pathname.startsWith(r));

  if (isAuthRoute && user) {
    return NextResponse.redirect(
      new URL(user.role === "admin" ? "/admin" : "/dashboard", request.url)
    );
  }

  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/login?redirect=/admin", request.url));
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard?error=forbidden", request.url));
    }
  }

  if (isUserRoute && !user) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.svg).*)",
  ],
};
