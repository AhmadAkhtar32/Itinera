"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Button } from '@/components/ui/button';

type ChatMessage = {
    role: 'user' | 'model';
    text: string;
};

export default function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: "Hi! I'm your Itinera travel assistant. Where are you dreaming of going?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom whenever messages update
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        try {
            // Format history for the API
            const history = messages.map(msg => ({
                role: msg.role,
                text: msg.text
            }));

            const response = await axios.post('/api/chat', {
                message: userMsg,
                history: history
            });

            setMessages(prev => [...prev, { role: 'model', text: response.data.reply }]);
        } catch (error: any) {
            console.error("Chatbot Error:", error);

            // 🛠️ Quota Guard: Check for Rate Limit (429) or Server Error (500) related to quota
            const isQuotaError = 
                error.response?.status === 429 || 
                error.response?.data?.details?.toLowerCase().includes("quota") ||
                error.response?.data?.details?.toLowerCase().includes("exhausted");

            if (isQuotaError) {
                setMessages(prev => [...prev, { 
                    role: 'model', 
                    text: "Itinera is very popular right now! ✈️ I've reached my free-tier limit for the moment. Please try again in a few minutes or tomorrow!" 
                }]);
            } else {
                setMessages(prev => [...prev, { 
                    role: 'model', 
                    text: "Oops! My brain is on vacation. Please check your connection and try again!" 
                }]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="bg-white dark:bg-neutral-900 w-80 sm:w-96 h-[450px] rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5">
                    
                    {/* Header */}
                    <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                        <div className="font-bold flex items-center gap-2">
                            <span>✈️ Itinera Assistant</span>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsOpen(false)} 
                            className="text-white hover:bg-blue-700 rounded-full transition"
                        >
                            <X size={18} />
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-neutral-900">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-blue-600 text-white rounded-br-none' 
                                    : 'bg-gray-200 dark:bg-neutral-800 text-black dark:text-white rounded-bl-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start mb-3">
                                <div className="bg-gray-200 dark:bg-neutral-800 px-4 py-2 rounded-2xl rounded-bl-none">
                                    <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-neutral-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about your next trip..."
                            className="flex-1 bg-gray-100 dark:bg-neutral-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black dark:text-white"
                        />
                        <Button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            size="icon"
                            className="bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 transition shrink-0"
                        >
                            <Send size={16} />
                        </Button>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            {!isOpen && (
                <Button 
                    onClick={() => setIsOpen(true)}
                    size="icon"
                    className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
                >
                    <MessageCircle size={28} />
                </Button>
            )}
        </div>
    );
}