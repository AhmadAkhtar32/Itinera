"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { Loader, Send } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import EmptyBoxState from './EmptyBoxState'
import GroupSizeUi from './GroupSizeUi'
import BudgetUi from './BudgetUi'
import SelectDays from './SelectDaysUi'
import FinalUi from './FinalUi'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useUserDetail } from '@/app/provider'
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
    hotels: any,
    itinerary: any
}


function ChatBox() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState<string>();
    const [loading, setLoading] = useState(false);
    const [isFinal, setIsFinal] = useState(false);
    const [tripDetail, setTripDetail] = useState<TripInfo>();
    const SaveTripDetail = useMutation(api.tripDetail.CreateTripDetail)
    const { userDetail, setUserDetail } = useUserDetail();

    const onSend = async () => {
        // if (!userInput?.trim()) return;

        setLoading(true);
        setUserInput('');
        const newMsg: Message = {
            role: 'user',
            content: userInput ?? ''
        }

        setMessages((prev: Message[]) => [...prev, newMsg]);

        const result = await axios.post('/api/aimodel', {
            messages: [...messages, newMsg],
            isFinal: isFinal
        });

        console.log("TRIP", result.data);

        !isFinal && setMessages((prev: Message[]) => [...prev, {
            role: 'assistant',
            content: result?.data?.resp,
            ui: result?.data?.ui
        }]);
        if (isFinal) {
            setTripDetail(result?.data?.trip_plan);
            const tripId = uuidv4();
            await SaveTripDetail({
                tripDetail: result?.data?.trip_plan,
                tripId: tripId,
                uid: userDetail?._id

            })
        }
        setLoading(false);
    }

    const RenderGenerativeUi = (ui: string) => {
        if (ui == 'budget') {
            //Budget Ui Component
            return <BudgetUi onSelectedOption={(v: string) => { setUserInput(v); onSend() }} />
        } else if (ui == 'groupSize') {
            // Group Size Ui Component
            return <GroupSizeUi onSelectedOption={(v: string) => { setUserInput(v); onSend() }} />
        } else if (ui == 'tripDuration') {
            // Group Size Ui Component
            return <SelectDays onSelectedOption={(v: string) => { setUserInput(v); onSend() }} />
        } else if (ui == 'final') {
            // Group Size Ui Component
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
            setUserInput('Ok, Great !');
            // onSend();
        }
    }, [messages])

    useEffect(() => {
        if (isFinal && userInput) {
            onSend();
        }
    }, [isFinal]);


    return (
        <div className='h-[80vh] flex flex-col'>
            {messages?.length == 0 &&
                <EmptyBoxState onSelectOption={(v: string) => { setUserInput(v); onSend() }} />
            }
            {/* Display Messages */}
            <section className='flex-1 overflow-y-auto p-4'>
                {messages.map((msg: Message, index) => (
                    msg.role == 'user' ?
                        <div className='flex justify-end mt-2' key={index}>
                            <div className='max-w-lg bg-primary text-white px-4 py-2 rounded-lg'>
                                {msg.content}
                            </div>
                        </div> :
                        <div className='flex justify-start mt-2' key={index}>
                            <div className='max-w-lg bg-gray-200 text-black px-4 py-2 rounded-lg'>
                                {msg.content}
                                {RenderGenerativeUi(msg.ui ?? '')}
                            </div>
                        </div>
                )
                )}
                {loading && <div className='flex justify-start mt-2' >
                    <div className='max-w-lg bg-gray-200 text-black px-4 py-2 rounded-lg'>
                        <Loader className='animate-spin' />
                    </div>
                </div>}

            </section>
            {/* User Input */}
            <section>
                <div className='border rounded-2xl p-4 shadow relative'>
                    <Textarea placeholder="Let's Plan A Trip Together With Itinera 😊" className='w-180 h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none'
                        onChange={(event) => setUserInput(event.target.value)}
                        value={userInput}
                    />
                    <Button size={'icon'} className='absolute bottom-6 right-6' onClick={() => onSend()}>
                        <Send className='h-4 w-4' />
                    </Button>
                </div>

            </section>
        </div>
    )
}

export default ChatBox