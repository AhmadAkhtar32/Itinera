"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import axios from 'axios';

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

    // Auto-scroll to bottom
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
            // Format history for Gemini
            const history = messages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));

            const response = await axios.post('/api/chat', {
                message: userMsg,
                history: history
            });

            setMessages(prev => [...prev, { role: 'model', text: response.data.reply }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "Oops! My brain is on vacation. Try again!" }]);
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
                        <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 p-1 rounded-full transition">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-neutral-900">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`mb-3 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
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
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-100 dark:bg-neutral-800 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-105"
                >
                    <MessageCircle size={28} />
                </button>
            )}
        </div>
    );
}