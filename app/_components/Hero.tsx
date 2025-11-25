import { Button } from '@/components/ui/button'
import { HeroVideoDialog } from '@/components/ui/hero-video-dialog'
import { Textarea } from '@/components/ui/textarea'
import { ArrowDown, Globe2, Icon, Landmark, Plane, Send } from 'lucide-react'
import React from 'react'

const suggestions = [
    {
        title: 'Create New Trip',
        icon: <Globe2 className='text-blue-400 h-5 w-5' />
    },
    {
        title: 'Inspire Me Where To Go',
        icon: <Plane className='text-green-400 h-5 w-5' />
    },
    {
        title: 'Discover Hidden Gems',
        icon: <Landmark className='text-orange-400 h-5 w-5' />
    },
    {
        title: 'Adventure Destination',
        icon: <Globe2 className='text-yellow-400 h-5 w-5' />
    }
]

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
            <div className='flex gap-5'>
                {suggestions.map((suggestions, index) => (
                    <div key={index} className='flex items-center gap-2 border rounded-full p-2 cursor-pointer hover:bg-primary hover:text-white'>
                        {suggestions.icon}
                        <h2>{suggestions.title}</h2>
                    </div>
                ))}
            </div>

            <h2 className='my-2 mt-5 flex gap-2'>Not Sure Where To Start? <strong>See how It Works</strong> ⬇️</h2>

            {/* Video section  */}
            <div className='w-full max-w-5xl mx-auto'>
                <HeroVideoDialog
                    className="block dark:hidden "
                    animationStyle="from-center"
                    videoSrc="https://www.example.com/dummy-video"
                    thumbnailSrc="https://images.pexels.com/photos/346885/pexels-photo-346885.jpeg"
                    thumbnailAlt="Dummy Video Thumbnail"
                />
            </div>

        </div>
    )
}

export default Hero