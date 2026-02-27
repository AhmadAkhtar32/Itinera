"use client"
import React, { useEffect, useState } from 'react'
import NextLink from 'next/link';
import { Button } from '@/components/ui/button';
import { Hotel } from './ChatBox';
import { Star, Wallet, MapPin } from 'lucide-react';
// 🛠️ Updated import to use your Pexels utility
import { getDestinationImage } from '@/lib/pexels';

type Props = {
    hotel: Hotel
}

function HotelCardItem({ hotel }: Props) {
    // 🛠️ Initialize with null to avoid Next.js strict src errors
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (hotel?.hotel_name) {
            fetchHotelImage();
        }
    }, [hotel])

    const fetchHotelImage = async () => {
        setIsLoading(true);
        try {
            // 🛠️ Fetching from Pexels for free live images
            const url = await getDestinationImage(hotel.hotel_name + " hotel");
            setPhotoUrl(url || null);
        } catch (error) {
            console.error("Error loading hotel image:", error);
            setPhotoUrl(null);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className='flex flex-col gap-1 border p-3 rounded-xl shadow-sm bg-white hover:shadow-md transition-all h-full'>
            <div className='relative h-[180px] w-full overflow-hidden rounded-xl bg-gray-100'>
                {/* 🛠️ Image with strict null/empty check */}
                <img
                    src={photoUrl && photoUrl !== "" ? photoUrl : '/assets/images/placeholder.png'}
                    alt={hotel?.hotel_name || 'hotel-image'}
                    className={`rounded-xl w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                />
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 animate-pulse">
                        <span className="text-[10px] text-neutral-400 font-medium">Finding Hotel Photo...</span>
                    </div>
                )}
            </div>
            
            <div className='mt-2 flex flex-col gap-2 flex-grow'>
                <h2 className='font-bold text-base line-clamp-1'>{hotel?.hotel_name}</h2>
                <h2 className='text-[11px] text-gray-500 flex items-start gap-1 min-h-[32px]'>
                    <MapPin className='w-3 h-3 mt-0.5 shrink-0' /> {hotel.hotel_address}
                </h2>
                
                <div className='flex justify-between items-center mt-auto pt-2 border-t'>
                    <p className='flex gap-1.5 text-green-700 font-semibold text-xs items-center'> 
                        <Wallet className='w-3.5 h-3.5' /> {hotel.price_per_night} 
                    </p>
                    <p className='flex gap-1.5 text-orange-500 font-semibold text-xs items-center'> 
                        <Star className='w-3.5 h-3.5 fill-orange-500' /> {hotel.rating} 
                    </p>
                </div>

                <NextLink
                    href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(hotel?.hotel_name + " " + hotel?.hotel_address)}
                    target='_blank'
                    className='w-full mt-2'
                >
                    <Button className="w-full bg-neutral-900 text-white hover:bg-neutral-700 transition-colors text-xs py-5">
                        View on Map
                    </Button>
                </NextLink>
            </div>
        </div>
    )
}

export default HotelCardItem