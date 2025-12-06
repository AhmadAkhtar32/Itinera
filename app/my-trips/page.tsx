"use client"
import { Button } from '@/components/ui/button';
import { useConvex } from 'convex/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useUserDetail } from '../provider';
import { api } from '@/convex/_generated/api';
import { TripInfo } from '../create-new-trip/_components/ChatBox';
import { ArrowBigRightIcon } from 'lucide-react';
import Image from "next/image";


type Trip = {
    tripId: any,
    tripDetail: TripInfo,
    _id: string
}

function MyTrips() {

    const [myTrips, setMyTrips] = useState<Trip[]>([]);
    const { userDetail, setUserDetail } = useUserDetail();
    const convex = useConvex();
    useEffect(() => {
        userDetail && GetUserTrip();
    }, [userDetail])
    const GetUserTrip = async () => {
        const result = await convex.query(
            api.tripDetail.GetUserTrips,
            { uid: userDetail?._id }
        );
        setMyTrips(result);
        console.log(result);
    };

    return (
        <div className='px-10 p-10 md:px-24 lg:px-48'>
            <h2 className='font-bold text-3xl'>My Trips</h2>

            {myTrips?.length == 0 &&
                <div className='p-7 border rounded-2xl flex flex-col items-center justify-center gap-5 mt-6'>
                    <h2>
                        You Don't have any trip created yet !
                    </h2>
                    <Link href={'/create-new-trip'}>
                        <Button>
                            Create New Trip
                        </Button>
                    </Link>
                </div>
            }

            <div>
                {myTrips?.map((trip, index) => (
                    <div key={index}>
                        <Image
                            src="/placeholder.png"
                            alt={trip.tripId}
                            width={400}
                            height={400}
                            className="rounded-xl object-cover"
                        />
                        <h2 className='flex gap-2 font-semibold text-xl'>{trip?.tripDetail?.destination} <ArrowBigRightIcon />{trip?.tripDetail?.destination}</h2>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MyTrips