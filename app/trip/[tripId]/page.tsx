"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api"; // Adjust this path to your convex folder


export default function SharedTripView({ params }: { params: { tripId: string } }) {
    // Call our new public query using the ID from the URL
    const tripData = useQuery(api.tripDetails.GetPublicTripById, { tripid: params.tripId });

    if (tripData === undefined) {
        return <div className="p-10 text-center">Loading Itinera trip...</div>;
    }

    if (tripData === null) {
        return <div className="p-10 text-center text-red-500">Trip not found. The link might be broken!</div>;
    }

    // Success! The trip loaded. Now you can render it.
    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Shared Trip Itinerary</h1>
            
            {/* Temporary dump of the data just so you can see it works */}
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
                <pre>{JSON.stringify(tripData.tripDetail, null, 2)}</pre>
            </div>
            
            {/* Once you confirm the data is here, you can copy over your beautiful UI components from the create-new-trip page! */}
        </div>
    );
}