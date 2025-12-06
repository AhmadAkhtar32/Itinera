"use client";  // ← add this as the first line
import React, { useState } from 'react'
import ChatBox from './_components/ChatBox'
import Itinerary from './_components/Itinerary'
import GlobalMap from './_components/GlobalMap';
import { Button } from '@/components/ui/button';
import { Globe2, Plane } from 'lucide-react';

function CreateNewTrip() {

  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-5 p-10'>
      <div>
        <ChatBox />
      </div>
      <div className='col-span-2 relative'>
        {activeIndex == 0 ? < Itinerary /> :
          <GlobalMap />}

        <Button size={'lg'}
          onClick={() => setActiveIndex(activeIndex == 0 ? 1 : 0)}
          className='absolute bg-black bottom-5 left-[50%]'>{activeIndex == 0 ? <Plane /> : <Globe2 />}</Button>

      </div>
    </div>
  )
}

export default CreateNewTrip