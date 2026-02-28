"use client"
import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

export default function PricingPage() {
    const { user } = useUser();
    const [showModal, setShowModal] = useState(false);
    const [tid, setTid] = useState("");
    const [loading, setLoading] = useState(false);

    // Initialize our new upgrade mutation
    const upgradeUser = useMutation(api.users.verifyLocalPayment); // Adjust path if your mutation is in a different file

    const handleUpgrade = async () => {
        if (!tid || tid.length < 10) {
            alert("Please enter a valid 11-digit EasyPaisa/JazzCash TID.");
            return;
        }

        setLoading(true);
        try {
            await upgradeUser({
                email: user?.primaryEmailAddress?.emailAddress ?? "",
                tid: tid,
                method: "easypaisa"
            });
            alert("Payment Verified! You are now a Pro User.");
            setShowModal(false);
            // Optional: Redirect them back to create-trip page here
        } catch (error: any) {
            alert(error.message || "Verification failed. Please check your TID.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-5 py-20 text-center max-w-3xl">
            <h1 className="text-4xl font-bold mb-4">Upgrade to Itinera Pro</h1>
            <p className="text-gray-500 mb-10">Generate unlimited AI itineraries for a one-time localized payment.</p>

            <div className="bg-white border rounded-2xl shadow-lg p-10 max-w-md mx-auto">
                <h2 className="text-2xl font-bold">Pro Plan</h2>
                <h3 className="text-4xl font-extrabold text-blue-600 mt-4 mb-2">Rs. 500</h3>
                <p className="text-gray-500 mb-6">One-time payment for lifetime access</p>
                
                <ul className="text-left mb-8 space-y-3">
                    <li>✅ Unlimited AI Trip Generations</li>
                    <li>✅ Premium Destinations</li>
                    <li>✅ Priority Support</li>
                </ul>

                <button 
                    onClick={() => setShowModal(true)}
                    className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-all font-bold"
                >
                    Pay via EasyPaisa / JazzCash
                </button>
            </div>

            {/* --- LOCAL PAYMENT MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl max-w-md w-full text-left">
                        <h3 className="text-xl font-bold mb-4">Manual Payment Verification</h3>
                        
                        <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 text-sm">
                            <p className="font-bold">Step 1: Send Rs. 500 to this account:</p>
                            <p>EasyPaisa / JazzCash: <strong>0300-1234567</strong></p>
                            <p>Account Title: <strong>Itinera AI</strong></p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Step 2: Enter your Transaction ID (TID)
                            </label>
                            <input 
                                type="text" 
                                placeholder="e.g. 01234567890" 
                                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={tid}
                                onChange={(e) => setTid(e.target.value)}
                            />
                            <p className="text-xs text-gray-400 mt-2">Find this in the SMS received from 3737 or 8558.</p>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpgrade}
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex justify-center items-center"
                            >
                                {loading ? "Verifying..." : "Verify Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}