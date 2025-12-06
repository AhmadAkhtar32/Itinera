// app/components/Header.tsx
"use client"
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

const menuOptions = [
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact Us", path: "/contact-us" },
];

export default function Header() {

    const { user } = useUser();
    const path = usePathname();
    console.log(path)

    return (
        <header className="flex items-center justify-between px-6 py-4">
            {/* LOGO */}
            <div className="flex items-center gap-6">
                <img
                    src="/logo.svg"
                    alt="logo"
                    className="w-10 h-10 object-contain"
                />
                <h2 className="font-bold text-lg hover:scale-105 transition-all">Itinera</h2>
            </div>

            {/* Menu Options */}
            <nav>
                <ul className="flex gap-6 items-center">
                    {menuOptions.map((menu) => (
                        <li key={menu.path}>
                            <Link href={menu.path} className="font-medium transition-all hover:underline hover:text-primary hover: scale-105">
                                {menu.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Get Started button placeholder */}
            <div className="flex gap-5 items-center">
                {!user ?
                    <SignInButton mode="modal">
                        <Button>
                            Get Started
                        </Button>
                    </SignInButton> :
                    path == '/create-new-trip' ?
                        <Link href={'/my-trips'}>
                            <Button>
                                My Trips
                            </Button>
                        </Link>
                        : <Link href={'/create-new-trip'}>
                            <Button>
                                Create New Trip
                            </Button>
                        </Link>
                }
                <UserButton />
            </div>
        </header>
    );
}
