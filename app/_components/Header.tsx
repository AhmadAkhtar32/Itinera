// app/components/Header.tsx
import React from "react";
import Link from "next/link";

const menuOptions = [
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact Us", path: "/contact-us" },
];

export default function Header() {
    return (
        <header className="flex items-center justify-between px-6 py-4">
            {/* LOGO */}
            <div className="flex items-center gap-3">
                <img
                    src="/logo.svg"
                    alt="logo"
                    style={{ width: 50, height: 50 }}
                />
                <h2 className="font-bold text-2xl">Itinera</h2>
            </div>

            {/* Menu Options */}
            <nav>
                <ul className="flex gap-6 items-center">
                    {menuOptions.map((menu) => (
                        <li key={menu.path}>
                            {/* next/link handles client navigation */}
                            <Link href={menu.path} className="font-medium hover:underline">
                                {menu.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Get Started button placeholder */}
            <div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md">
                    Get Started
                </button>
            </div>
        </header>
    );
}
