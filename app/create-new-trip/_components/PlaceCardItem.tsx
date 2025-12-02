"use client"
import { Button } from '@/components/ui/button'
import { Clock, ExternalLink, Ticket } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import NextLink from 'next/link';
import { Activity } from './ChatBox';
import axios from 'axios';
type Props = {
    activity: Activity
}
function PlaceCardItem({ activity }: Props) {

    const [photoUrl, setPhotoUrl] = useState<string>();
    useEffect(() => {
        activity && GetGooglePlaceDetail();
    }, [activity])

    const GetGooglePlaceDetail = async () => {
        const result = await axios.post('/api/google-place-detail', {
            placeName: activity?.place_name + ":" + activity?.place_address
        });
        if (result?.data?.e) {
            return;
        }
        setPhotoUrl(result?.data);
    }

    return (
        <div className='p-3 border rounded-xl shadow-sm bg-white'>
            <div className='relative h-[150px] w-full'>
                <img
                    src={photoUrl ? photoUrl : '/assets/images/placeholder.png'}
                    width={400}
                    height={200}
                    alt={activity.place_name}
                    className='object-cover rounded-xl w-full h-full'
                />
            </div>
            <div className='mt-2'>
                <h2 className='font-bold text-lg'>{activity?.place_name}</h2>
                <p className='text-gray-500 text-sm line-clamp-2'>{activity?.place_details}</p>
                <div className='flex gap-4 mt-2 mb-3'>
                    <h2 className='flex gap-1 text-blue-500 text-xs items-center'>
                        <Ticket className='w-3 h-3' /> {activity?.ticket_pricing}
                    </h2>
                    <p className='flex gap-1 text-orange-400 text-xs items-center'>
                        <Clock className='w-3 h-3' /> {activity?.best_time_to_visit}
                    </p>
                </div>

                {/* FIXED BUTTON: Standard colors to ensure visibility */}
                <NextLink
                    href={'https://www.google.com/maps/search/?api=1&query=' + activity?.place_name}
                    target='_blank'
                    className='block w-full'
                >
                    <Button className="w-full bg-black text-white hover:bg-gray-700">
                        View on Map <ExternalLink className='w-4 h-4 ml-2' />
                    </Button>
                </NextLink>
            </div>
        </div>
    )
}

export default PlaceCardItem