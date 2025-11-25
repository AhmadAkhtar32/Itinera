import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Icon, Send } from 'lucide-react'
import React from 'react'

function Hero() {
    return (
        <div className="mt-24 flex flex-col items-center justify-center gap-10">
            {/* Content  */}
            <div className='max-w-3xl w-full text-center space-y-6'>
                <h1 className='text-xl md:text-5xl font-bold'>Hey! <span className='text-primary'>Itinera</span> at your service  plan smarter-travel better<span className='text-4xl'>✈️</span></h1>
                <p className='text-lg'>Tell me what you need — I’ll plan the flights, hotels, and everything else in seconds.</p>
            </div>

            {/* Input Box  */}
            <div>
                <div className='border rounded-2xl p-4 shadow relative'>
                    <Textarea placeholder="Let's Plan A Trip Together 😊" className='w-180 h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none' />
                    <Button size={'icon'} className='absolute bottom-6 right-6'>
                        <Send className='h-4 w-4' />
                    </Button>
                </div>
            </div>

            {/* Suggestion List  */}
            <div>

            </div>

            {/* Video section  */}
        </div>
    )
}

export default Hero