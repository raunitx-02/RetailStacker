import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PLAN_ACCESS: Record<string, string[]> = {
  Free: [
    "/dashboard",
    "/profile",
  ],
  Lite: [
    "/dashboard",
    "/profile",
    "/tools/meesho-optimizer",
    "/tools/gst-calculator",
    "/keywords/frankenstein",
    "/listing/scribbles",
    "/tools/logistics-estimator",
    "/tools/url-builder",
    "/tools/qr-generator",
  ],
  Starter: [
    "/dashboard",
    "/profile",
    "/tools/meesho-optimizer",
    "/tools/gst-calculator",
    "/keywords/frankenstein",
    "/listing/scribbles",
    "/tools/logistics-estimator",
    "/tools/url-builder",
    "/tools/qr-generator",
    "/product-research/black-box",
    "/keywords/magnet",
    "/listing/builder",
    "/tools/bulk-analyzer",
    "/publish",
  ],
  Growth: [
    "/dashboard",
    "/profile",
    "/tools/meesho-optimizer",
    "/tools/gst-calculator",
    "/keywords/frankenstein",
    "/listing/scribbles",
    "/tools/logistics-estimator",
    "/tools/url-builder",
    "/tools/qr-generator",
    "/product-research/black-box",
    "/product-research/xray",
    "/keywords/magnet",
    "/keywords/cerebro",
    "/listing/builder",
    "/tools/bulk-analyzer",
    "/publish",
    "/tools/scanner",
    "/tools/copilot",
    "/tools/shopify-manager",
  ],
  Diamond: []
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";
  const isAdminSubdomain = host.startsWith("admin.retailstacker.com") || host.startsWith("admin.localhost");

  if (isAdminSubdomain) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.rewrite(url);
    }
  } else {
    // If accessing main domain /admin path, redirect to subdomain
    if (pathname.startsWith("/admin")) {
      const isProd = process.env.NODE_ENV === "production";
      const redirectUrl = isProd 
        ? "https://admin.retailstacker.com" 
        : `http://admin.localhost:${req.nextUrl.port || "3000"}`;
      return NextResponse.redirect(new URL(redirectUrl));
    }
  }

  // Protect all dashboard, product-research, keywords, listing, tools, analytics, operations routes
  const isProtectedRoute = 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/product-research") ||
    pathname.startsWith("/keywords") ||
    pathname.startsWith("/listing") ||
    pathname.startsWith("/tools") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/operations");

  if (isProtectedRoute) {
    const planCookie = req.cookies.get("retailstacker_plan")?.value;

    if (!planCookie) {
      // Not logged in -> redirect to login
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    // Check plan access
    const allowedPaths = PLAN_ACCESS[planCookie];
    
    // Allow partial matches, e.g., if allowed path is /product-research/black-box, and we are at /product-research/black-box
    const hasAccess = allowedPaths && allowedPaths.some(path => pathname.startsWith(path));

    if (!hasAccess && planCookie !== "Diamond") {
      // Redirect to upgrade page or dashboard with error
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      url.searchParams.set("error", "upgrade_required");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/dashboard/:path*",
    "/product-research/:path*",
    "/keywords/:path*",
    "/listing/:path*",
    "/tools/:path*",
    "/analytics/:path*",
    "/operations/:path*",
  ],
};
