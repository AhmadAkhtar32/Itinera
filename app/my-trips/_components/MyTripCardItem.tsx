import { ArrowBigRightIcon, Share2 } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Trip } from '../page'
import axios from 'axios'
import Link from 'next/link'

type Props = {
    trip: Trip
}

function MyTripCardItem({ trip }: Props) {
    const [photoUrl, setPhotoUrl] = useState<string>();

    useEffect(() => {
        trip && GetGooglePlaceDetail();
    }, [trip])

    const GetGooglePlaceDetail = async () => {
        const result = await axios.post('/api/google-place-detail', {
            placeName: trip?.tripDetail?.destination
        });
        if (result?.data?.e) {
            return;
        }
        setPhotoUrl(result?.data);
    }

    /* ================= SHARE TRIP LOGIC (ADDED ONLY) ================= */
    const handleShareTrip = async (
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const shareUrl = `${window.location.origin}/view-trip/${trip?.tripId}`;

        if (navigator.share) {
            await navigator.share({
                title: 'My Trip Itinerary',
                text: 'Check out this trip itinerary!',
                url: shareUrl,
            });
        } else {
            await navigator.clipboard.writeText(shareUrl);
            alert('Shareable link copied to clipboard!');
        }
    };
    /* ================================================================ */

    return (
        <Link
            href={'/view-trip/' + trip?.tripId}
            className='p-5 shadow rounded-2xl relative'
        >
            {/* ================= SHARE BUTTON (ADDED ONLY) ================= */}
            <button
    // 👇 Assuming your variable is named tripId. Update this if it's named something else!
    onClick={() => handleShareTrip(trip.tripId)}
    className='absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow hover:bg-gray-100'
    aria-label="Share Trip"
>
    <Share2 size={18} />
</button>
            {/* ============================================================ */}

            <Image
                src={photoUrl ? photoUrl : "/placeholder.png"}
                alt={trip.tripId}
                width={400}
                height={400}
                className="rounded-xl object-cover w-full h-[270px]"
            />

            <h2 className='flex gap-2 font-semibold text-xl mt-2'>
                {trip?.tripDetail?.destination}
                <ArrowBigRightIcon />
                {trip?.tripDetail?.destination}
            </h2>

            <h2 className='mt-2 text-gray-700'>
                {trip?.tripDetail?.duration} Trip with {trip?.tripDetail?.budget} Budget
            </h2>
        </Link>
    )
}

export default MyTripCardItem
