import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "./ConvexClientProvider";
import FloatingChatbot from "@/app/_components/FloatingChatbot";
import Footer from "./_components/Footer";

export const metadata: Metadata = {
  title: "Itinera ✈️",
  description: "AI Trip Architect",
};

const outfit = Outfit({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <ClerkProvider>
      {/* 👇 Added suppressHydrationWarning to html and body */}
      <html lang="en" suppressHydrationWarning>
        <body
          className={outfit.className}
          suppressHydrationWarning
        >
          <ConvexClientProvider>
            {children}
            <Footer />
            <FloatingChatbot />
          </ConvexClientProvider>

        </body>
      </html>
    </ClerkProvider>
  );
}