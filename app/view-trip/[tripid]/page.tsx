"use client"
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
        setTripDetailInfo(result?.tripDetail)
    }

    return (
        <div className='grid grid-cols-5'>
            <div>
                <Itinerary />
            </div>
        </div>
    )
}

export default ViewTrip