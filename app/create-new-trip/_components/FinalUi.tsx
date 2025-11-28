import { Button } from '@/components/ui/button'
import { Globe2 } from 'lucide-react'
import React from 'react'

function FinalUi({ viewTrip }: any) {
    return (
        <div>
            <Globe2 className='text-primary text-4xl animate-bounce' />
            <h2 className='mt-3 text-lg font-semibold text-primary'>
                ✈️ Planning Your Dream trip ...
            </h2>
            <p className='text-gray-500 text-sm text-center mt-1'>
                Gathering best destinations, activities and travel details for you.
            </p>
            <Button disabled onClick={viewTrip} className='mt-2 w-full'>View trip</Button>
        </div>
    )
}

export default FinalUi