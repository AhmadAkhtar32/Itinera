import { Textarea } from '@/components/ui/textarea'
import React from 'react'

function Hero() {
    return (
        <div className="mt-24 flex flex-col items-center justify-center gap-10">
            {/* Content  */}
            <div className='max-w-3xl w-full text-center space-y-6'>
                <h1 className='text-xl md:text-5xl font-bold'>Hey! <span className='text-primary'>Itinera</span> at your service — plan smarter-travel better✈️</h1>
                <p className='text-lg'>Tell me what you need — I’ll plan the flights, hotels, and everything else in seconds.</p>
            </div>

            {/* Input Box  */}
            <div>
                <div className='border rounded-2xl p-4 shadow'>
                    <Textarea placeholder="Let's Plan A Trip Together 😊" className='w-180 h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none' />
                </div>
            </div>

            {/* Suggestion List  */}

            {/* Video section  */}
        </div>
    )
}

export default Hero