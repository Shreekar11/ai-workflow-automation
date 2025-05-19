import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const protectedRoute = createRouteMatcher([
  "/workflows",
  "/workflows/create",
  "/templates",
  "/runs",
]);

export default clerkMiddleware((auth, req) => {
  if (req.nextUrl.pathname === "/api/webhook") {
    return;
  }

  if (protectedRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
