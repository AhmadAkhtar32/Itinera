"use client";

import { ArrowBigRightIcon, Share2, Heart, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Trip } from "../page";
import Link from "next/link";
import { getDestinationImage } from "@/lib/pexels";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";

type Props = {
  trip: Trip;
};

function MyTripCardItem({ trip }: Props) {
  const { user } = useUser();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleFavorite = useMutation(api.trips.toggleFavorite);
  const deleteTrip = useMutation(api.trips.deleteTrip);

  const publicTripId = trip?.tripId;

  useEffect(() => {
    if (trip?.tripDetail?.destination) {
      fetchTripImage();
    }
  }, [trip]);

  const fetchTripImage = async () => {
    try {
      const url = await getDestinationImage(trip.tripDetail.destination);
      setPhotoUrl(url || null);
    } catch (error) {
      console.error("Error fetching trip image:", error);
      setPhotoUrl(null);
    }
  };

  const handleShareTrip = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!publicTripId) {
      alert("Trip link is not available.");
      return;
    }

    const shareUrl = `${window.location.origin}/view-trip/${publicTripId}`;

    if (navigator.share) {
      await navigator.share({
        title: "My Trip Itinerary",
        text: `Check out my trip to ${trip?.tripDetail?.destination}!`,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Shareable link copied to clipboard!");
    }
  };

  const handleFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !publicTripId) return;

    try {
      await toggleFavorite({
        tripId: publicTripId,
        isFavorite: !trip.isFavorite,
      });
    } catch (error) {
      console.error("Failed to update favorite status", error);
      alert("Could not update favorite status.");
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !publicTripId) return;

    if (window.confirm("Are you sure you want to delete this trip permanently?")) {
      try {
        await deleteTrip({
          tripId: publicTripId,
        });
      } catch (error) {
        console.error("Failed to delete trip", error);
        alert("Could not delete trip.");
      }
    }
  };

  return (
    <Link
      href={`/view-trip/${publicTripId}`}
      className="p-5 shadow rounded-2xl relative bg-white hover:scale-[1.02] transition-transform duration-200 block group"
    >
      {pathname === "/dashboard" && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleFavorite}
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
            aria-label={
              trip.isFavorite ? "Remove from Favorites" : "Add to Favorites"
            }
          >
            <Heart
              size={18}
              className={
                trip.isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-700"
              }
            />
          </button>

          <button
            onClick={handleShareTrip}
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
            aria-label="Share Trip"
          >
            <Share2 size={18} className="text-gray-700" />
          </button>

          <button
            onClick={handleDelete}
            className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Delete Trip"
          >
            <Trash2 size={18} className="text-red-500 hover:text-red-700" />
          </button>
        </div>
      )}

      <div className="relative w-full h-[270px] overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={
            photoUrl && photoUrl !== ""
              ? photoUrl
              : "/assets/images/placeholder.png"
          }
          alt={trip?.tripDetail?.destination || "Trip Card"}
          width={400}
          height={400}
          className="object-cover w-full h-full"
          priority={false}
        />
      </div>

      <h2 className="flex gap-2 font-bold text-xl mt-3 items-center text-gray-900">
        {trip?.tripDetail?.origin}
        <ArrowBigRightIcon size={20} className="text-blue-600" />
        {trip?.tripDetail?.destination}
      </h2>

      <h2 className="mt-1 text-sm text-gray-500 font-medium">
        {trip?.tripDetail?.duration} • {trip?.tripDetail?.budget} Budget
      </h2>
    </Link>
  );
}

export default MyTripCardItem;