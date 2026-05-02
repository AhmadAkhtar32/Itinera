"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SignInButton,
  UserButton,
  useUser,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  ShieldAlert,
  Building2,
  ShoppingBag,
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const menuOptions = [
  { name: "Home", path: "/" },
  { name: "Marketplace", path: "/marketplace" },
  { name: "Partner Program", path: "/partner" },
  { name: "Pricing", path: "/pricing" },
  { name: "Contact Us", path: "/contact-us" },
];

export default function Header() {
  const { isSignedIn } = useUser();
  const path = usePathname();

  const currentUser = useQuery(
    api.user.GetCurrentUser,
    isSignedIn ? {} : "skip"
  );

  const isAdmin = currentUser?.role === "admin";
  const isPartner =
    currentUser?.role === "agency" || currentUser?.role === "collaborator";

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <img
          src="/logo.svg"
          alt="Itinera logo"
          className="w-10 h-10 object-contain"
        />
        <h2 className="font-bold text-lg hover:scale-105 transition-all cursor-pointer">
          Itinera
        </h2>
      </Link>

      {/* Menu Options */}
      <nav>
        <ul className="flex gap-6 items-center">
          {menuOptions.map((menu) => (
            <li key={menu.path}>
              <Link
                href={menu.path}
                className="font-medium transition-all hover:underline hover:text-primary"
              >
                {menu.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Action Buttons */}
      <div className="flex gap-4 items-center">
        <SignedOut>
          <SignInButton mode="modal">
            <Button>Get Started</Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          {isPartner && (
            <Link href="/partner/dashboard">
              <Button
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 flex gap-2"
              >
                <Building2 size={16} />
                Partner Portal
              </Button>
            </Link>
          )}

          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 flex gap-2"
              >
                <ShieldAlert size={16} />
                Admin Panel
              </Button>
            </Link>
          )}

          <Link
            href={
              path === "/create-new-trip" ? "/my-trips" : "/create-new-trip"
            }
          >
            <Button>
              {path === "/create-new-trip" ? "My Trips" : "Create New Trip"}
            </Button>
          </Link>

          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Dashboard"
                labelIcon={<LayoutDashboard size={15} />}
                href="/dashboard"
              />

              <UserButton.Link
                label="My Trips"
                labelIcon={<Map size={15} />}
                href="/my-trips"
              />

              <UserButton.Link
                label="My Bookings"
                labelIcon={<ShoppingBag size={15} />}
                href="/my-bookings"
              />

              {isPartner && (
                <UserButton.Link
                  label="Partner Portal"
                  labelIcon={<Building2 size={15} className="text-blue-500" />}
                  href="/partner/dashboard"
                />
              )}

              {isAdmin && (
                <UserButton.Link
                  label="Admin Portal"
                  labelIcon={
                    <ShieldAlert size={15} className="text-red-500" />
                  }
                  href="/admin"
                />
              )}
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>
      </div>
    </header>
  );
}