import { suggestions } from '@/app/_components/Hero'
import React from 'react'

function EmptyBoxState({ onSelectOption }: any) {
    return (
        <div className='mt-4'>
            <h2 className='font-bold text-3xl text-center'>Start Planning Your <strong className='text-primary'>Trip</strong> With Itinera</h2>
            <p className='text-center text-gray-600 mt-2'>Discover personalised itineraries crafted just for you — smarter, faster, and perfectly aligned with your travel vibes.</p>
            <div className='flex flex-col gap-5 mt-3'>
                {suggestions.map((suggestions, index) => (
                    <div key={index}
                        onClick={() => onSelectOption(suggestions.title)}
                        className='flex items-center gap-2 border rounded-xl p-2 cursor-pointer hover:border-primary hover:text-primary'>
                        {suggestions.icon}
                        <h2>{suggestions.title}</h2>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default EmptyBoxState