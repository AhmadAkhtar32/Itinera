"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Button } from '@/components/ui/button';

type ChatMessage = {
    role: 'user' | 'model';
    text: string;
};

export default function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: "Hi! I'm Itinera's AI Architect. Ready to plan your next escape?" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

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
            const history = messages.map(msg => ({ role: msg.role, text: msg.text }));
            const response = await axios.post('/api/chat', { message: userMsg, history });
            setMessages(prev => [...prev, { role: 'model', text: response.data.reply }]);
        } catch (error: any) {
            const isQuota = error.response?.status === 429 || error.message.includes("quota");
            setMessages(prev => [...prev, { 
                role: 'model', 
                text: isQuota ? "I'm a bit overwhelmed! ✈️ Free tier limits reached. Try in 1 min." : "Oops! Brain fog. Try again!" 
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-neutral-900 w-[320px] sm:w-[350px] h-[480px] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col mb-4 overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} className="text-yellow-200" />
                                <h3 className="font-bold text-xs tracking-tight">Itinera AI</h3>
                            </div>
                            <div className="flex gap-0.5">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setMessages([{ role: 'model', text: "Ready to start fresh!" }])} 
                                    className="text-white h-7 w-7 p-0 hover:bg-white/10"
                                >
                                    <Trash2 size={14} />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setIsOpen(false)} 
                                    className="text-white h-7 w-7 p-0 hover:bg-white/10"
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-neutral-950/50 scrollbar-hide">
                            {messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`px-3 py-2 rounded-xl max-w-[85%] text-[13px] leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 rounded-bl-none border border-neutral-100 dark:border-neutral-700'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-neutral-800 px-3 py-2 rounded-xl rounded-bl-none shadow-sm flex gap-1">
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask me anything..."
                                    className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-xl pl-3 pr-10 py-2.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none transition-all dark:text-white"
                                />
                                <motion.button 
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-1.5 p-1.5 bg-blue-600 text-white rounded-lg disabled:bg-neutral-300 transition-colors shadow-md"
                                >
                                    <Send size={14} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Toggle Button */}
            <motion.button 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white w-14 h-14 rounded-2xl shadow-[0_10px_30px_rgba(37,99,235,0.4)] flex items-center justify-center relative group overflow-hidden"
            >
                <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
                </motion.div>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </motion.button>
        </div>
    );
}