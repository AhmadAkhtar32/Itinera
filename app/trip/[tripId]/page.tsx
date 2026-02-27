"use client";

import { use } from "react"; // 1. MUST IMPORT THIS
import { useQuery } from "convex/react";
// Change it to this:
import { api } from "@/convex/_generated/api"; // Fixed path!

export default function SharedTripView({ params }: { params: Promise<{ tripId: string }> }) {
    
    // 2. UNWRAP THE PARAMS HERE
    const resolvedParams = use(params);
    
    // 3. USE THE UNWRAPPED ID
    const tripData = useQuery(api.tripDetail.GetPublicTripById, { tripid: resolvedParams.tripId });

    if (tripData === undefined) {
        return <div className="p-10 text-center">Loading Itinera trip...</div>;
    }

    if (tripData === null) {
        return <div className="p-10 text-center text-red-500">Trip not found. The link might be broken!</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Shared Trip Itinerary</h1>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
                <pre>{JSON.stringify(tripData.tripDetail, null, 2)}</pre>
            </div>
        </div>
    );
}