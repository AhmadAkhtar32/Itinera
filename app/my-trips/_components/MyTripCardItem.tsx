"use client"
import { ArrowBigRightIcon, Share2 } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Trip } from '../page'
import Link from 'next/link'
// 🛠️ Updated import to use the Pexels utility
import { getDestinationImage } from '@/lib/pexels'

type Props = {
    trip: Trip
}

function MyTripCardItem({ trip }: Props) {
    // 🛠️ Initialize as null to prevent Next.js empty string errors
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        if (trip?.tripDetail?.destination) {
            fetchTripImage();
        }
    }, [trip])

    const fetchTripImage = async () => {
        try {
            // 🛠️ Using the Pexels utility instead of the internal Google API route
            const url = await getDestinationImage(trip.tripDetail.destination);
            setPhotoUrl(url || null);
        } catch (error) {
            console.error("Error fetching trip image:", error);
            setPhotoUrl(null);
        }
    }

    /* ================= SHARE TRIP LOGIC ================= */
    const handleShareTrip = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const shareUrl = `${window.location.origin}/view-trip/${trip?._id}`; 

        if (navigator.share) {
            await navigator.share({
                title: 'My Trip Itinerary',
                text: `Check out my trip to ${trip?.tripDetail?.destination}!`,
                url: shareUrl,
            });
        } else {
            await navigator.clipboard.writeText(shareUrl);
            alert('Shareable link copied to clipboard!');
        }
    };

    return (
        <Link
            href={'/view-trip/' + trip?._id}
            className='p-5 shadow rounded-2xl relative bg-white hover:scale-[1.02] transition-transform duration-200 block'
        >
            <button
                onClick={handleShareTrip}
                className='absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors'
                aria-label="Share Trip"
            >
                <Share2 size={18} className="text-gray-700" />
            </button>

            <div className="relative w-full h-[270px] overflow-hidden rounded-xl bg-gray-100">
                <Image
                    // 🛠️ Strict check to ensure Next.js never receives an empty string
                    src={photoUrl && photoUrl !== "" ? photoUrl : "/assets/images/placeholder.png"}
                    alt={trip?.tripDetail?.destination || "Trip Card"}
                    width={400}
                    height={400}
                    className="object-cover w-full h-full"
                    priority={false}
                />
            </div>

            <h2 className='flex gap-2 font-bold text-xl mt-3 items-center text-gray-900'>
                {trip?.tripDetail?.origin}
                <ArrowBigRightIcon size={20} className="text-blue-600" />
                {trip?.tripDetail?.destination}
            </h2>

            <h2 className='mt-1 text-sm text-gray-500 font-medium'>
                {trip?.tripDetail?.duration} • {trip?.tripDetail?.budget} Budget
            </h2>
        </Link>
    )
}

export default MyTripCardItem