import { PricingTable } from '@clerk/nextjs'
import React from 'react'

function Pricing() {
    return (
        // Added standard Tailwind margins and centering
        <div className='mt-20 mb-10 px-4'>
            <h2 className='font-extrabold text-3xl mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                AI-Powered Trip Planning - Pick Your Plan
            </h2>
            <div className="max-w-md mx-auto shadow-xl rounded-3xl overflow-hidden border border-neutral-100 dark:border-neutral-800">
                <PricingTable />
            </div>
        </div>
    )
}

export default Pricing