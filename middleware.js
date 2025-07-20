import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

//This are routes are protected by clerkMiddleware-function
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/expenses(.*)",
  "/contacts(.*)",
  "/groups(.*)",
  "/person(.*)",
  "/settlements(.*)",
]);

//This is clerkMiddleware-function
export default clerkMiddleware(async (auth, req) => {
  //This will give the userId of current loggedIn user
  const { userId } = await auth();
  // console.log("auth() result:", userId);
  //If user is not logged-in and trying to access the above routes then redirect them to sign-in page
  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    // Redirect to sign-in page 
    return redirectToSignIn();
  }

  // If logged-in(userId found) then moveOn
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
