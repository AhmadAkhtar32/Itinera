"use client"
import React, { useEffect, useState } from 'react'
import NextLink from 'next/link';
import { Button } from '@/components/ui/button';
import { Hotel } from './ChatBox';
import { Star, Wallet } from 'lucide-react';
import axios from 'axios';

type Props = {
    hotel: Hotel
}

function HotelCardItem({ hotel }: Props) {

    const [photoUrl, setPhotoUrl] = useState<string>();
    useEffect(() => {
        hotel && GetGooglePlaceDetail();
    }, [hotel])

    const GetGooglePlaceDetail = async () => {
        const result = await axios.post('/api/google-place-detail', {
            placeName: hotel?.hotel_name
        });
        if (result?.data?.e) {
            return;
        }
        setPhotoUrl(result?.data);
    }

    return (
        <div className='flex flex-col gap-1 border p-3 rounded-xl shadow-sm'>
            <div className='relative h-[180px] w-full'>
                <img
                    src={photoUrl ? photoUrl : '/assets/images/placeholder.png'}
                    alt='place-image'
                    className='rounded-xl w-full h-full object-cover'
                />
            </div>
            <div className='mt-2 flex flex-col gap-2'>
                <h2 className='font-semibold text-lg'>{hotel?.hotel_name}</h2>
                <h2 className='text-xs text-gray-500'>{hotel.hotel_address}</h2>
                <div className='flex justify-between items-center'>
                    <p className='flex gap-2 text-green-600 text-sm'> <Wallet className='w-4 h-4' /> {hotel.price_per_night} </p>
                    <p className='flex gap-2 text-yellow-500 text-sm'> <Star className='w-4 h-4' /> {hotel.rating} </p>
                </div>

                {/* FIXED BUTTON: Removed 'primary' colors, added standard bg-black */}
                <NextLink
                    href={'https://www.google.com/maps/search/?api=1&query=' + hotel?.hotel_name}
                    target='_blank'
                    className='w-full'
                >
                    <Button className="w-full bg-black text-white hover:bg-gray-700 mt-1">
                        View Hotel
                    </Button>
                </NextLink>
            </div>
        </div>
    )
}

export default HotelCardItem