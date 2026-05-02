"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { FileDown, Sparkles } from "lucide-react";

import GlobalMap from "@/app/create-new-trip/_components/GlobalMap";
import Itinerary from "@/app/create-new-trip/_components/Itinerary";
import WeatherPackingPanel from "@/app/view-trip/_components/WeatherPackingPanel";

import { Trip } from "@/app/my-trips/page";
import { userTripDetail } from "@/app/provider";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";

function ViewTrip() {
  const params = useParams();
  const router = useRouter();

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

  const tripContext = userTripDetail();

  useEffect(() => {
    if (!tripData?.tripDetail) return;

    tripContext?.setTripDetailInfo(tripData.tripDetail);

    const firstHotel = tripData.tripDetail.hotels?.[0];

    const longitude = firstHotel?.geo_coordinates?.longitude;
    const latitude = firstHotel?.geo_coordinates?.latitude;

    if (typeof longitude === "number" && typeof latitude === "number") {
      setMapCoordinates([longitude, latitude]);
    }
  }, [tripData, tripContext]);

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
    <div>
      <div className="px-5 py-4 border-b bg-white flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/reoptimize-trip/${tripid}`)}
          className="border-purple-200 text-purple-700 hover:bg-purple-50"
        >
          <Sparkles className="mr-2" size={16} />
          AI Re-Optimize Trip
        </Button>

        <Button
          type="button"
          onClick={() => router.push(`/travel-report/${tripid}`)}
        >
          <FileDown className="mr-2" size={16} />
          Export Travel Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Itinerary />

          <div className="px-5 pb-8">
            <WeatherPackingPanel tripDetail={tripData.tripDetail} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <GlobalMap coordinates={mapCoordinates} />
        </div>
      </div>
    </div>
  );
}

export default ViewTrip;