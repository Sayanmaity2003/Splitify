"use client";
import { useStoreUser } from "@/hooks/use-store-user";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
// Here the "Signed-in" and "Signed-out" are replaced by "Authenticated" and "Unauthenticated" by convex
import { Authenticated, Unauthenticated } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { BarLoader } from "react-spinners";
import { Button } from "./ui/button";
import { LayoutDashboard } from "lucide-react";
const Header = () => {
  const { isLoading } = useStoreUser();
  const path = usePathname();
  return (
    <header className="fixed top-0 w-full border-b bg-white/95 backdrop-blur z-50 supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/*When the icon is clicked, it will redirect to main page */}
        <Link href="/" className="flex items-center gap-2">
          {" "}
          {/*Icon on header */}
          <Image
            src={"/logos/logo-s.png"}
            alt="splitify Logo"
            width={200}
            height={60}
            className="h-11 w-auto object-contain"
          />
        </Link>

        {path === "/" && (
          <div className="hidden md:flex items-center gap-6">
            {/* Link to Features */}
            <Link
              href="#features"
              className="text-sm font-medium hover:text-violet-600 transition"
            >
              Features
            </Link>

            {/* Link to How It Works */}
            <Link
              href="#how-it-works"
              className="text-sm font-medium hover:text-violet-600 transition"
            >
              How It Works
            </Link>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* When the user is signed-in(authenticated), Display the dashboard button */}
          <Authenticated>
            {/* Link is used to redirect to dashboard route on clicking the "dashboard"-botton */}
            <Link href="/dashboard">
              {/* Dashboard button on larger screen */}
              <Button
                variant="outline"
                className="hidden md:inline-flex items-center gap-2 hover:text-violet-600 hover:border-violet-600 transition"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
              {/* Dashboard button on smaller screen */}
              <Button variant="ghost" className="md:hidden w-10 h-10 p-0">
                <LayoutDashboard className="h-4 w-4" />
              </Button>
            </Link>

            {/* This is UserProfile Button of Clerk */}
            <UserButton />
          </Authenticated>

          {/* When the user is not signed-in(unauthenticated), Display "Sign-in" and "Sign-Up" buttons */}
          <Unauthenticated>
            {/* Sign-in Button */}
            <SignInButton>
              <Button variant={"ghost"}>Sign In</Button>
            </SignInButton>

            {/* Sign-up Button */}
            <SignUpButton>
              <Button className="bg-violet-600 hover:bg-violet-700 border-none">
                Get Started
              </Button>
            </SignUpButton>
          </Unauthenticated>
        </div>
      </nav>
      {isLoading && <BarLoader width={"100%"} color="#CC70FF" />}
      {/* <BarLoader width={"100%"} color="#36d7b7" /> */}
    </header>
  );
};

export default Header;
