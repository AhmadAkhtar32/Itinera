import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "./ConvexClientProvider";
import Header from "./_components/Header";
import FloatingChatbot from "@/app/_components/FloatingChatbot";
import Footer from "./_components/Footer";

const outfit = Outfit({ subsets: ["latin"] });

// 1. Comprehensive Metadata Object
export const metadata: Metadata = {
  metadataBase: new URL("https://itinera-aa.vercel.app/"),
  title: {
    default: "Itinera AI Trip Planner & Itinerary Architect",
    template: "%s | Itinera - AI Trip Planner",
  },
  description: "Plan smarter and travel better. Itinera is an AI-powered trip planner that builds your flights, hotels, and custom travel itineraries in seconds.",
  keywords: [
    "trip planner",
    "ai trip planner",
    "trip planning",
    "travel itinerary builder",
    "ai travel planner",
    "vacation planner",
    "custom travel itinerary",
    "smart trip planner",
    "trip planner by Ahmad and Ahsan", 
    "ai trip planner by Ahmad and Ahsan",
    "app by Ahmad and Ahsan",
    "Project by Ahmad and Ahsan",
    "web app by Ahmad and Ahsan",
    "Ahmad and Ahsan"
  ],
  authors: [{ name: "Ahmad" }, { name: "Ahsan" }],
  creator: "Ahmad and Ahsan",
  icons: {
    icon: "/favicon.png", // Next.js automatically injects the <link rel="icon">
    apple: "/apple-icon.png", 
  },
  openGraph: {
    title: "Itinera AI Trip Planner & Itinerary Architect",
    description: "Plan smarter and travel better. Itinera is an AI-powered trip planner that builds your flights, hotels, and custom travel itineraries in seconds.",
    url: "https://itinera-aa.vercel.app/",
    siteName: "Itinera",
    type: "website",
    images: [
      {
        url: "/og-image.png", // Ensure a 1200x630 image is in your public/ folder
        width: 1200,
        height: 630,
        alt: "Itinera - AI Trip Planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Itinera AI Trip Planner",
    description: "AI-powered trip planner that builds your custom travel itineraries in seconds.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://itinera-aa.vercel.app/", // Prevents search engines from indexing duplicate URL variations
  },
  verification: {
    google: "NmytGj1S10OlPjG1z6FseBeSVFAXHfsnIq77yPs-hFA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 2. JSON-LD Structured Data (Schema Markup for Google)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Itinera - AI Trip Planner",
    "alternateName": "Trip Planner by Ahmad and Ahsan",
    "url": "https://itinera-aa.vercel.app/",
    "description": "Plan smarter and travel better. Itinera is an AI-powered trip planner that builds your flights, hotels, and custom travel itineraries in seconds.",
    "author": [
      { "@type": "Person", "name": "Ahmad" },
      { "@type": "Person", "name": "Ahsan" }
    ]
  };

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Inject JSON-LD Schema directly into the <head> */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className={outfit.className} suppressHydrationWarning>
          <ConvexClientProvider>
            <Header />
            {children}
            <Footer />
            <FloatingChatbot />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}