import React from 'react'
import ChatBox from './_components/ChatBox'
import Itinerary from './_components/itinerary'

function CreateNewTrip() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-5 p-10'>
      <div>
        <ChatBox />
      </div>
      <div>
        <Itinerary />
      </div>
    </div>
  )
}

export default CreateNewTrip