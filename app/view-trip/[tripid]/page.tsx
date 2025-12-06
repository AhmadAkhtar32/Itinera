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

    const { tripid } = useParams();
    const { userDetail, setUserDetail } = useUserDetail();
    const convex = useConvex();
    const [tripData, setTripData] = useState<Trip>();

    // We add a state to hold the coordinates for the map
    const [mapCoordinates, setMapCoordinates] = useState<number[]>([]);

    //@ts-ignore
    const { tripDetailInfo, setTripDetailInfo } = userTripDetail();

    useEffect(() => {
        userDetail && GetTrip()
    }, [userDetail])

    const GetTrip = async () => {
        const result = await convex.query(api.tripDetail.GetTripById, {
            uid: userDetail?._id,
            tripid: tripid + ''
        });

        console.log(result);
        setTripData(result);
        setTripDetailInfo(result?.tripDetail);

        // --- NEW LOGIC ---
        // Extract coordinates from the first hotel in the trip details
        if (result?.tripDetail?.hotels && result.tripDetail.hotels.length > 0) {
            const firstHotel = result.tripDetail.hotels[0];
            setMapCoordinates([
                firstHotel.geo_coordinates.longitude,
                firstHotel.geo_coordinates.latitude
            ]);
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

export default ViewTrip