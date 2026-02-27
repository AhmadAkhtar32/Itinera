"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full py-8 mt-20 border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 flex flex-col items-center justify-center space-y-4">
                
                {/* Main Animated Text */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex flex-col items-center gap-2"
                >
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400 font-medium tracking-wide text-sm sm:text-base">
                        <span>Developed with</span>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        >
                            <Heart size={18} className="text-red-500 fill-red-500" />
                        </motion.div>
                        <span>by</span>
                    </div>

                    {/* Names with Gradient and Hover Effect */}
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="relative group cursor-default"
                    >
                        <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Ahmad & Ahsan
                        </h2>
                        {/* Animated Underline */}
                        <motion.div 
                            className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                            initial={{ width: 0 }}
                            whileInView={{ width: "100%" }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                        />
                    </motion.div>
                </motion.div>

                {/* Secondary Info */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 0.6 }}
                    className="text-[10px] sm:text-xs text-neutral-500 dark:text-neutral-500 uppercase tracking-[0.2em]"
                >
                    © 2026 Itinera • AI Trip Architect
                </motion.p>
            </div>
        </footer>
    );
}