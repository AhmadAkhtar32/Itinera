"use client";
import React, { useState } from 'react'
import ChatBox from './_components/ChatBox'
import Itinerary from './_components/Itinerary'
import GlobalMap from './_components/GlobalMap';
import { Button } from '@/components/ui/button';
import { Globe2, Plane } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function CreateNewTrip() {

  const [activeIndex, setActiveIndex] = useState(1);

  // 1. Add state to hold the coordinates [lng, lat]
  const [coordinates, setCoordinates] = useState<number[]>([]);

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 p-10'>
      <div>
        {/* 2. Pass the setter to ChatBox so it can update the location when a user selects a place */}
        {/* You will need to update ChatBox to accept this prop */}
        <ChatBox setCoordinates={setCoordinates} />
      </div>
      <div className='col-span-2 relative'>

        {activeIndex == 0 ?
          <Itinerary /> :
          // 3. Pass the coordinates to GlobalMap so it knows when to stop spinning
          <GlobalMap coordinates={coordinates} />
        }

        <Tooltip>
          <TooltipTrigger asChild>
            {/* Added 'asChild' to TooltipTrigger to avoid hydration errors with Button */}
            <div className='absolute bg-black bottom-5 left-[50%] rounded-2xl z-10 translate-x-[-50%]'>
              {/* Added z-10 and translate-x for better centering and visibility over map */}
              <Button size={'lg'}
                className='bg-black hover:bg-gray-800' // Added hover effect
                onClick={() => setActiveIndex(activeIndex == 0 ? 1 : 0)}
              >
                {activeIndex == 0 ? <Plane /> : <Globe2 />}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            Switch Between Map and Trip
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

export default CreateNewTrip