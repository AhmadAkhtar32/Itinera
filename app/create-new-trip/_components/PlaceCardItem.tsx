"use client"
import { Button } from '@/components/ui/button'
import { Clock, ExternalLink, Ticket } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import NextLink from 'next/link';
import { Activity } from './ChatBox';

// 🛠️ FIX: Corrected import path based on your sidebar structure
// Ensure lib/pexels.ts exists and exports getDestinationImage
import { getDestinationImage } from '@/lib/pexels';

type Props = {
    activity: Activity
}

function PlaceCardItem({ activity }: Props) {
    // 🛠️ Initialize with null instead of undefined to avoid 'empty string' errors in Next.js
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (activity?.place_name) {
            fetchPexelsImage();
        }
    }, [activity]);

    const fetchPexelsImage = async () => {
        setIsLoading(true);
        try {
            // 🛠️ Fetching from Pexels using the utility function
            const url = await getDestinationImage(activity.place_name);
            // Ensure we don't set an empty string
            setPhotoUrl(url || null);
        } catch (error) {
            console.error("Error loading activity image:", error);
            setPhotoUrl(null);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='p-3 border rounded-xl shadow-sm bg-white hover:shadow-md transition-shadow'>
            <div className='relative h-[150px] w-full overflow-hidden rounded-xl bg-gray-100'>
                {/* 🛠️ Improved fallback check for the src attribute */}
                <img
                    src={photoUrl && photoUrl !== "" ? photoUrl : '/assets/images/placeholder.png'}
                    alt={activity.place_name || "Activity Image"}
                    className={`object-cover w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                />
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 animate-pulse">
                        <span className="text-[10px] text-neutral-400">Loading Image...</span>
                    </div>
                )}
            </div>
            
            <div className='mt-2'>
                <h2 className='font-bold text-lg leading-tight'>{activity?.place_name}</h2>
                <p className='text-gray-500 text-sm line-clamp-2 mt-1'>{activity?.place_details}</p>
                
                <div className='flex flex-wrap gap-3 mt-3 mb-4'>
                    <h2 className='flex gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-[11px] font-semibold items-center'>
                        <Ticket className='w-3 h-3' /> {activity?.ticket_pricing}
                    </h2>
                    <p className='flex gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md text-[11px] font-semibold items-center'>
                        <Clock className='w-3 h-3' /> {activity?.best_time_to_visit}
                    </p>
                </div>

                <NextLink
                    href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(activity?.place_name + " " + (activity?.place_address || ""))}
                    target='_blank'
                    className='block w-full'
                >
                    <Button className="w-full bg-neutral-900 text-white hover:bg-neutral-700 transition-colors text-xs py-5">
                        View on Map <ExternalLink className='w-3.5 h-3.5 ml-2' />
                    </Button>
                </NextLink>
            </div>
        </div>
    )
}

export default PlaceCardItem;