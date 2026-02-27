"use client"
import GlobalMap from '@/app/create-new-trip/_components/GlobalMap';
import Itinerary from '@/app/create-new-trip/_components/Itinerary';
import { Trip } from '@/app/my-trips/page';
import { userTripDetail, useUserDetail } from '@/app/provider';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

function ViewTrip() {
    const params = useParams();
    // Safely catch the ID whether the folder is named [tripid] or [tripId]
    const tripid = params.tripid || params.tripId; 
    
    const { userDetail } = useUserDetail();
    const convex = useConvex();
    const [tripData, setTripData] = useState<Trip>();

    // We add a state to hold the coordinates for the map
    const [mapCoordinates, setMapCoordinates] = useState<number[]>([]);

    //@ts-ignore
    const { tripDetailInfo, setTripDetailInfo } = userTripDetail();

    // 1. CHANGED: Trigger the fetch as soon as we have the trip ID from the URL, 
    // without waiting to see if a user is logged in.
    useEffect(() => {
        if (tripid) {
            GetTrip();
        }
    }, [tripid])

    const GetTrip = async () => {
        try {
            // 2. CHANGED: Call the public query and remove the 'uid' argument
            const result = await convex.query(api.tripDetail.GetPublicTripById, {
                tripid: tripid + ''
            });

            console.log("Shared Trip Result:", result);
            
            if (result) {
                setTripData(result);
                setTripDetailInfo(result?.tripDetail);

                // Extract coordinates from the first hotel in the trip details
                if (result?.tripDetail?.hotels && result.tripDetail.hotels.length > 0) {
                    const firstHotel = result.tripDetail.hotels[0];
                    setMapCoordinates([
                        firstHotel.geo_coordinates.longitude,
                        firstHotel.geo_coordinates.latitude
                    ]);
                }
            } else {
                console.warn("No trip found in the database for this ID.");
            }
        } catch (error) {
            console.error("Error fetching the shared trip:", error);
        }
    }

    return (
        <div className='grid grid-cols-5'>
            <div className='col-span-3'>
                <Itinerary />
            </div>
            <div className='col-span-2'>
                {/* Pass the coordinates here to stop rotation */}
                <GlobalMap coordinates={mapCoordinates} />
            </div>
        </div>
    )
}

export default ViewTrip;