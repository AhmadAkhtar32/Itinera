"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Code, Zap } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative w-full py-4 border-t border-neutral-200 dark:border-neutral-800 overflow-hidden">
            
            {/* 🛠️ NEW: Animated Colourful Background */}
            <motion.div 
                animate={{ 
                    background: [
                        "linear-gradient(to right, rgba(59, 130, 246, 0.08), rgba(168, 85, 247, 0.08), rgba(99, 102, 241, 0.08))",
                        "linear-gradient(to right, rgba(99, 102, 241, 0.08), rgba(59, 130, 246, 0.08), rgba(168, 85, 247, 0.08))",
                        "linear-gradient(to right, rgba(168, 85, 247, 0.08), rgba(99, 102, 241, 0.08), rgba(59, 130, 246, 0.08))"
                    ] 
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 -z-10 backdrop-blur-sm"
            />

            <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-2">
                
                {/* Developer Info Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-1"
                >
                    <div className="flex items-center gap-1.5 font-medium text-xs sm:text-sm">
                        {/* Animated Icons with Brand Colors */}
                        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                            <Code size={14} className="text-cyan-500" />
                        </motion.div>

                        <span className="text-neutral-700 dark:text-neutral-300">Coded with</span>
                        
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            <Heart size={15} className="text-red-500 fill-red-500" />
                        </motion.div>
                        
                        <span className="text-neutral-700 dark:text-neutral-300">and</span>

                        <motion.div animate={{ y: [0, -2, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                            <Zap size={14} className="text-amber-500 fill-amber-500" />
                        </motion.div>

                        <span className="text-neutral-700 dark:text-neutral-300">by</span>
                    </div>

                    {/* Developer Names */}
                    <motion.div whileHover={{ scale: 1.05 }} className="relative group cursor-default">
                        <h2 className="text-lg sm:text-xl font-black bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
                            Ahmad & Ahsan
                        </h2>
                        {/* Shimmering Underline */}
                        <motion.div 
                            className="absolute -bottom-0.5 left-0 h-0.5 bg-gradient-to-r from-blue-600 via-purple-500 to-indigo-600 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        />
                    </motion.div>
                </motion.div>

                {/* Footer Copyright */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.5 }}
                    className="text-[9px] sm:text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.3em] font-semibold"
                >
                    © 2026 Itinera • AI Architecture
                </motion.p>
            </div>
        </footer>
    );
}