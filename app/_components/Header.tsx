// app/components/Header.tsx
"use client"
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// 🛠️ 1. Imported SignedIn and SignedOut
import { SignInButton, UserButton, useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, ShieldAlert } from "lucide-react";

// 🛠️ Define authorized admin emails
const ADMIN_EMAILS = [
    "ahmadrao3226@gmail.com",     // First admin email
  "ahsanabdullah2876@gmail.com" // Second admin email
];

const menuOptions = [
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact Us", path: "/contact-us" },
];

export default function Header() {
    const { user } = useUser();
    const path = usePathname();
    
    // Logic to check if the current user is an admin
    const userEmail = user?.primaryEmailAddress?.emailAddress ?? "";
    const isAdmin = ADMIN_EMAILS.includes(userEmail);

    return (
        <header className="flex items-center justify-between px-6 py-4 border-b">
            {/* LOGO */}
            <div className="flex items-center gap-6">
                <img
                    src="/logo.svg"
                    alt="logo"
                    className="w-10 h-10 object-contain"
                />
                <h2 className="font-bold text-lg hover:scale-105 transition-all cursor-pointer">Itinera</h2>
            </div>

            {/* Menu Options */}
            <nav>
                <ul className="flex gap-6 items-center">
                    {menuOptions.map((menu) => (
                        <li key={menu.path}>
                            <Link href={menu.path} className="font-medium transition-all hover:underline hover:text-primary">
                                {menu.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Action Buttons */}
            <div className="flex gap-5 items-center">
                
                {/* 🛠️ 2. Safe wrap for logged-out users */}
                <SignedOut>
                    <SignInButton mode="modal">
                        <Button>Get Started</Button>
                    </SignInButton>
                </SignedOut>

                {/* 🛠️ 3. Safe wrap for logged-in users */}
                <SignedIn>
                    {isAdmin && (
                        <Link href="/admin">
                            <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 flex gap-2">
                                <ShieldAlert size={16} />
                                Admin Panel
                            </Button>
                        </Link>
                    )}

                    <Link href={path === '/create-new-trip' ? '/my-trips' : '/create-new-trip'}>
                        <Button>
                            {path === '/create-new-trip' ? 'My Trips' : 'Create New Trip'}
                        </Button>
                    </Link>
                    
                    {/* Notice how UserButton is now safely inside the SignedIn block! */}
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
                            {isAdmin && (
                                <UserButton.Link
                                    label="Admin Portal"
                                    labelIcon={<ShieldAlert size={15} className="text-red-500" />}
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