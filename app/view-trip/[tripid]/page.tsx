"use client"
import { useUserDetail } from '@/app/provider';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import { useParams } from 'next/navigation';
import React, { useEffect } from 'react'

function ViewTrip() {

    const { tripId } = useParams();
    const { userDetail, setUserDetail } = useUserDetail();
    const convex = useConvex();

    useEffect(() => {
        userDetail && GetTrip()
    }, [userDetail])

    const GetTrip = async () => {
        const result = await convex.query(api.tripDetail.GetTripById, {
            uid: userDetail?._id,
            tripid: tripid + ''
        });
        console.log(result);
    }

    return (
        <div>ViewTrip</div>
    )
}

export default ViewTrip