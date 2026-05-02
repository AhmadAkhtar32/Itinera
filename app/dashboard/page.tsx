"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import MyTripCardItem from "../my-trips/_components/MyTripCardItem";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

  const trips = useQuery(api.trips.getUserTrips, isSignedIn ? {} : "skip");

  if (!isLoaded || trips === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="container mx-auto px-5 py-10 max-w-7xl">
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Please sign in to view your dashboard.
          </h3>
          <Link href="/">
            <Button className="mt-4">Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const favoriteTrips = trips.filter((trip: any) => trip.isFavorite === true);
  const displayedTrips = activeTab === "favorites" ? favoriteTrips : trips;

  return (
    <div className="container mx-auto px-5 py-10 max-w-7xl">
      <h1 className="font-bold text-4xl mb-8 text-gray-900">My Dashboard</h1>

      <div className="flex gap-6 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 text-lg font-medium transition-colors relative ${
            activeTab === "all"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Trips ({trips.length})
          {activeTab === "all" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("favorites")}
          className={`pb-3 text-lg font-medium transition-colors relative ${
            activeTab === "favorites"
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Favorites ({favoriteTrips.length})
          {activeTab === "favorites" && (
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
          )}
        </button>
      </div>

      {displayedTrips.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {activeTab === "favorites" ? "No favorite trips yet." : "No trips found."}
          </h3>
          <p className="text-gray-500">
            {activeTab === "favorites"
              ? "Click the heart icon on a trip to add it to your favorites!"
              : "Create your first AI trip itinerary to get started."}
          </p>

          {activeTab === "all" && (
            <Link href="/create-new-trip">
              <Button className="mt-5">Create New Trip</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTrips.map((trip: any) => (
            <MyTripCardItem key={trip._id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}