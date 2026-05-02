"use client";

import GlobalMap from "@/app/create-new-trip/_components/GlobalMap";
import Itinerary from "@/app/create-new-trip/_components/Itinerary";
import { Trip } from "@/app/my-trips/page";
import { userTripDetail } from "@/app/provider";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

function ViewTrip() {
  const params = useParams();

  const tripid = useMemo(() => {
    const rawTripId = params.tripid || params.tripId;

    if (Array.isArray(rawTripId)) {
      return rawTripId[0];
    }

    return rawTripId ? String(rawTripId) : "";
  }, [params]);

  const tripData = useQuery(
    api.tripDetail.GetPublicTripById,
    tripid ? { tripid } : "skip"
  ) as Trip | null | undefined;

  const [mapCoordinates, setMapCoordinates] = useState<number[]>([]);

  // @ts-ignore
  const { setTripDetailInfo } = userTripDetail();

  useEffect(() => {
    if (!tripData?.tripDetail) return;

    setTripDetailInfo(tripData.tripDetail);

    const firstHotel = tripData.tripDetail.hotels?.[0];

    if (
      firstHotel?.geo_coordinates?.longitude &&
      firstHotel?.geo_coordinates?.latitude
    ) {
      setMapCoordinates([
        firstHotel.geo_coordinates.longitude,
        firstHotel.geo_coordinates.latitude,
      ]);
    }
  }, [tripData, setTripDetailInfo]);

  if (tripData === undefined) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tripData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5">
        <div className="max-w-md text-center border rounded-2xl p-8 bg-white shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Trip not available
          </h1>
          <p className="text-gray-500 mt-3">
            This trip either does not exist, is private, or you do not have
            permission to view it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <Itinerary />
      </div>

      <div className="lg:col-span-2">
        <GlobalMap coordinates={mapCoordinates} />
      </div>
    </div>
  );
}

export default ViewTrip;