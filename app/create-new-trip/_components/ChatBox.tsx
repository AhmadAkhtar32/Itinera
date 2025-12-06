"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { Loader, Send } from 'lucide-react'
import React, { useEffect, useState, useRef } from 'react'
import EmptyBoxState from './EmptyBoxState'
import GroupSizeUi from './GroupSizeUi'
import BudgetUi from './BudgetUi'
import SelectDays from './SelectDaysUi'
import FinalUi from './FinalUi'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { userTripDetail, useUserDetail } from '@/app/provider'
import { v4 as uuidv4 } from 'uuid'


type Message = {
    role: string,
    content: string
    ui?: string,
}

export type TripInfo = {
    budget: string,
    destination: string,
    duration: string,
    group_size: string,
    origin: string,
    hotels: Hotel[],
    itinerary: Itinerary
}

export type Hotel = {
    hotel_name: string;
    hotel_address: string;
    price_per_night: string;
    hotel_image_url: string;
    geo_coordinates: {
        latitude: number;
        longitude: number;
    };
    rating: number;
    description: string;
};

export type Activity = {
    place_name: string;
    place_details: string;
    place_image_url: string;
    geo_coordinates: {
        latitude: number;
        longitude: number;
    };
    place_address: string;
    ticket_pricing: string;
    time_travel_each_location: string;
    best_time_to_visit: string;
};

type Itinerary = {
    day: number;
    day_plan: string;
    best_time_to_visit_day: string;
    activities: Activity[];
};


function ChatBox() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [isFinal, setIsFinal] = useState(false);
    const [tripDetail, setTripDetail] = useState<TripInfo>();
    const SaveTripDetail = useMutation(api.tripDetail.CreateTripDetail)
    const { userDetail, setUserDetail } = useUserDetail();

    // Auto-scroll ref
    const scrollRef = useRef<HTMLDivElement>(null);

    //@ts-ignore
    const { tripDetailInfo, setTripDetailInfo } = userTripDetail();

    // Auto-scroll effect
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // UPDATED: Now accepts an optional 'manualInput'
    const onSend = async (manualInput?: string) => {

        // Use manualInput if provided (from buttons), otherwise use state (from text box)
        const msgContent = manualInput || userInput;

        if (!msgContent?.trim()) return;

        setLoading(true);
        setUserInput(''); // Clear input

        const newMsg: Message = {
            role: 'user',
            content: msgContent // Use the resolved content
        }

        setMessages((prev: Message[]) => [...prev, newMsg]);

        try {
            const result = await axios.post('/api/aimodel', {
                messages: [...messages, newMsg],
                isFinal: isFinal
            });

            console.log("AI RESPONSE FULL DATA:", result.data); // DEBUG LOG

            !isFinal && setMessages((prev: Message[]) => [...prev, {
                role: 'assistant',
                content: result?.data?.resp,
                ui: result?.data?.ui
            }]);

            if (isFinal) {
                // --- FIX STARTS HERE ---
                // We extract the plan first to check if it exists
                const tripPlanData = result?.data?.trip_plan;

                if (tripPlanData) {
                    setTripDetail(tripPlanData);
                    setTripDetailInfo(tripPlanData);

                    const tripId = uuidv4();

                    // Only save if we have the data
                    await SaveTripDetail({
                        tripDetail: tripPlanData,
                        tripId: tripId,
                        uid: userDetail?._id
                    });
                } else {
                    console.error("ERROR: 'trip_plan' is missing in the API response. Cannot save to Convex.");
                    console.log("Received Data Structure:", result.data);
                    // You might want to show an error toast here
                }
                // --- FIX ENDS HERE ---
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setLoading(false);
        }
    }

    // UPDATED: Passes 'v' directly to onSend(v)
    const RenderGenerativeUi = (ui: string) => {
        if (ui == 'budget') {
            // Budget Ui Component - NOW HANDLES NUMERIC INPUT
            // Ensure BudgetUi passes the string value (e.g., "$500") to onSelectedOption
            return <BudgetUi onSelectedOption={(v: string) => {
                // We do NOT set userInput here to avoid double-state issues
                // We just fire onSend directly with the value
                onSend(v);
            }} />
        } else if (ui == 'groupSize') {
            // Group Size Ui Component
            return <GroupSizeUi onSelectedOption={(v: string) => {
                onSend(v);
            }} />
        } else if (ui == 'tripDuration') {
            // Duration Ui Component
            return <SelectDays onSelectedOption={(v: string) => {
                onSend(v);
            }} />
        } else if (ui == 'final') {
            // Final Ui Component
            return <FinalUi viewTrip={() => console.log()}
                disable={!tripDetail}
            />
        }
        return null
    }

    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.ui == 'final') {
            setIsFinal(true);
            // We set the input to "Ok, Great!" to trigger the final fetch automatically
            setUserInput('Ok, Great !');
        }
    }, [messages])

    useEffect(() => {
        // Trigger the final call only when isFinal is true AND the "Ok, Great!" text is staged
        if (isFinal && userInput == 'Ok, Great !') {
            onSend();
        }
    }, [isFinal, userInput]);


    return (
        <div className='h-[80vh] flex flex-col border shadow rounded-2xl p-5'>
            {messages?.length == 0 &&
                <EmptyBoxState onSelectOption={(v: string) => { setUserInput(v); onSend(v) }} />
            }
            {/* Display Messages */}
            <section className='flex-1 overflow-y-auto p-4'>
                {messages.map((msg: Message, index) => (
                    <div key={index}>
                        {msg.role == 'user' ? (
                            <div className='flex justify-end mt-2'>
                                <div className='max-w-lg bg-primary text-white px-4 py-2 rounded-lg'>
                                    {msg.content}
                                </div>
                            </div>
                        ) : (
                            <div className='flex justify-start mt-2'>
                                <div className='max-w-lg bg-gray-200 text-black px-4 py-2 rounded-lg'>
                                    {msg.content}
                                    {/* Generative UI renders INSIDE the assistant bubble */}
                                    <div className="mt-2">
                                        {RenderGenerativeUi(msg.ui ?? '')}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className='flex justify-start mt-2' >
                        <div className='max-w-lg bg-gray-200 text-black px-4 py-2 rounded-lg flex items-center gap-2'>
                            <Loader className='animate-spin h-4 w-4' />
                            <span className='text-sm text-gray-500'>Itinera is thinking...</span>
                        </div>
                    </div>
                )}
                {/* Scroll Anchor */}
                <div ref={scrollRef} />
            </section>

            {/* User Input */}
            <section>
                <div className='border rounded-2xl p-4 shadow relative'>
                    <Textarea
                        placeholder="Let's Plan A Trip Together With Itinera 😊"
                        className='w-180 h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none'
                        onChange={(event) => setUserInput(event.target.value)}
                        value={userInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                onSend();
                            }
                        }}
                    />
                    <Button
                        size={'icon'}
                        className='absolute bottom-6 right-6'
                        onClick={() => onSend()}
                        disabled={loading || !userInput?.trim()}
                    >
                        <Send className='h-4 w-4' />
                    </Button>
                </div>
            </section>
        </div>
    )
}

export default ChatBox