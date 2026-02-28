"use client"
import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Check, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

// 🛠️ The single destination account for your business
const ADMIN_ACCOUNT = {
    bank: "Meezan Bank",
    title: "Itinera AI Solutions",
    accountNumber: "PK58 MEZN 0000 3001 0952 3026", // 16-digit Meezan Account
}

// User's payment options
const PAYMENT_ORIGINS = [
    { id: 'meezan', name: 'Meezan Bank' },
    { id: 'nayapay', name: 'NayaPay' },
    { id: 'easypaisa', name: 'EasyPaisa' },
    { id: 'jazzcash', name: 'JazzCash' }
];

type PlanType = 'monthly' | 'yearly' | null;

export default function PricingPage() {
    const { user } = useUser();
    const router = useRouter();
    
    // UI State
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanType>(null);
    const [paymentOrigin, setPaymentOrigin] = useState(PAYMENT_ORIGINS[0].id);
    const [tid, setTid] = useState("");
    const [loading, setLoading] = useState(false);

    // Backend Mutation
    const upgradeUser = useMutation(api.user.verifyLocalPayment); 

    const handleSelectPlan = (plan: PlanType) => {
        setSelectedPlan(plan);
        setShowModal(true);
    };

    const handleUpgrade = async () => {
        if (!tid || tid.length < 10) {
            alert("Please enter a valid Transaction ID (TID).");
            return;
        }

        setLoading(true);
        try {
            await upgradeUser({
                email: user?.primaryEmailAddress?.emailAddress ?? "",
                tid: tid,
                method: paymentOrigin
            });
            alert("Payment Verified! Welcome to Itinera Pro.");
            setShowModal(false);
            router.push('/create-new-trip'); 
        } catch (error: any) {
            alert(error.message || "Verification failed. Please check your TID.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-20 px-5">
            <div className="container mx-auto max-w-5xl text-center">
                <h1 className="text-4xl font-bold mb-4 text-gray-900">Upgrade to Itinera Pro</h1>
                <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
                    Unlock unlimited AI trip generations and premium features. Choose the plan that works best for you.
                </p>

                {/* --- PRICING CARDS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    
                    {/* Monthly Plan */}
                    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 text-left hover:shadow-md transition-shadow">
                        <h2 className="text-2xl font-bold text-gray-900">Monthly Pro</h2>
                        <div className="mt-4 flex items-baseline text-5xl font-extrabold text-blue-600">
                            Rs. 1,500
                            <span className="ml-1 text-xl font-medium text-gray-500">/mo</span>
                        </div>
                        <p className="mt-4 text-gray-500">Perfect for short-term travel planning.</p>
                        
                        <ul className="mt-8 space-y-4">
                            <li className="flex gap-3 items-center text-gray-700"><Check className="text-blue-500" size={20} /> Unlimited AI Trip Generations</li>
                            <li className="flex gap-3 items-center text-gray-700"><Check className="text-blue-500" size={20} /> Access to Global Destinations</li>
                            <li className="flex gap-3 items-center text-gray-700"><Check className="text-blue-500" size={20} /> Standard Support</li>
                        </ul>

                        <button 
                            onClick={() => handleSelectPlan('monthly')}
                            className="mt-8 w-full bg-blue-50 text-blue-700 font-bold py-3.5 rounded-xl hover:bg-blue-100 transition-colors"
                        >
                            Subscribe Monthly
                        </button>
                    </div>

                    {/* Yearly Plan (Highlighted) */}
                    <div className="bg-gray-900 rounded-3xl shadow-xl p-8 text-left relative transform md:-translate-y-2">
                        <div className="absolute top-0 right-8 transform -translate-y-1/2">
                            <span className="bg-blue-500 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                                Best Value (Save 44%)
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Yearly Pro</h2>
                        <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                            Rs. 10,000
                            <span className="ml-1 text-xl font-medium text-gray-400">/yr</span>
                        </div>
                        <p className="mt-4 text-gray-400">For frequent travelers and digital nomads.</p>
                        
                        <ul className="mt-8 space-y-4">
                            <li className="flex gap-3 items-center text-gray-300"><Check className="text-blue-400" size={20} /> Everything in Monthly</li>
                            <li className="flex gap-3 items-center text-gray-300"><Check className="text-blue-400" size={20} /> Priority AI Processing</li>
                            <li className="flex gap-3 items-center text-gray-300"><Check className="text-blue-400" size={20} /> 24/7 Priority Support</li>
                        </ul>

                        <button 
                            onClick={() => handleSelectPlan('yearly')}
                            className="mt-8 w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition-colors"
                        >
                            Subscribe Yearly
                        </button>
                    </div>
                </div>
            </div>

            {/* --- LOCAL PAYMENT MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    {/* Added max-h and overflow-y-auto to fix scrolling issues on smaller laptops */}
                    <div className="bg-white p-8 rounded-3xl max-w-md w-full text-left shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Manual Checkout</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">✕</button>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100 flex justify-between items-center">
                            <span className="font-medium text-gray-600">Total Amount:</span>
                            <span className="text-2xl font-bold text-blue-600">
                                {selectedPlan === 'monthly' ? 'Rs. 1,500' : 'Rs. 10,000'}
                            </span>
                        </div>

                        {/* Static Receiving Account Details */}
                        <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl mb-6">
                            <div className="flex items-center gap-2 text-blue-800 font-bold mb-3 border-b border-blue-200 pb-2">
                                <Building2 size={18} />
                                Send exactly {selectedPlan === 'monthly' ? 'Rs. 1,500' : 'Rs. 10,000'} to:
                            </div>
                            <div className="space-y-1 text-sm text-blue-900">
                                <p><span className="font-medium">Bank Name:</span> {ADMIN_ACCOUNT.bank}</p>
                                <p><span className="font-medium">Account Title:</span> {ADMIN_ACCOUNT.title}</p>
                                <p className="text-xl font-mono font-bold mt-2 bg-white p-2 rounded inline-block border border-blue-200 tracking-widest text-center w-full">
                                    {ADMIN_ACCOUNT.accountNumber}
                                </p>
                            </div>
                        </div>

                        {/* Payment Method Selector (Origin) */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Step 1: Paying from which App?
                            </label>
                            <select 
                                value={paymentOrigin}
                                onChange={(e) => setPaymentOrigin(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                            >
                                {PAYMENT_ORIGINS.map(method => (
                                    <option key={method.id} value={method.id}>
                                        {method.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* TID Input */}
                        <div className="mb-8">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Step 2: Enter Transaction ID (TID)
                            </label>
                            <input 
                                type="text" 
                                placeholder="Enter TID from SMS/Receipt" 
                                className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                                value={tid}
                                onChange={(e) => setTid(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                We will verify this ID against our bank statement.
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <button 
                            onClick={handleUpgrade}
                            disabled={loading || !tid}
                            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Verifying...
                                </span>
                            ) : "Confirm Payment & Upgrade"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}