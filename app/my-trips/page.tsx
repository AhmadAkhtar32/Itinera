"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TripInfo } from "../create-new-trip/_components/ChatBox";
import MyTripCardItem from "./_components/MyTripCardItem";
import { useUser } from "@clerk/nextjs";

export type Trip = {
  _id: string;
  tripId: string;
  tripDetail: TripInfo;
  uid?: string;
  userEmail?: string;
  ownerId?: string;
  isFavorite?: boolean;
  source?: "ai_generated" | "reoptimized" | "purchased_package" | "purchased_plan";
  visibility?: "private" | "public";
  createdAt?: number;
  updatedAt?: number;
};

function MyTrips() {
  const { isLoaded, isSignedIn } = useUser();

  const myTrips = useQuery(
    api.tripDetail.GetUserTrips,
    isSignedIn ? {} : "skip"
  );

  if (!isLoaded || myTrips === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="px-10 p-10 md:px-24 lg:px-48">
        <div className="p-7 border rounded-2xl flex flex-col items-center justify-center gap-5 mt-6">
          <h2>Please sign in to view your trips.</h2>
          <Link href="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-10 p-10 md:px-24 lg:px-48">
      <h2 className="font-bold text-3xl">My Trips</h2>

      {myTrips?.length === 0 && (
        <div className="p-7 border rounded-2xl flex flex-col items-center justify-center gap-5 mt-6">
          <h2>You don't have any trip created yet!</h2>
          <Link href="/create-new-trip">
            <Button>Create New Trip</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {myTrips?.map((trip: any) => (
          <MyTripCardItem trip={trip} key={trip._id} />
        ))}
      </div>
    </div>
  );
}

export default MyTrips;