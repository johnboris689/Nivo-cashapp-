import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, Zap } from 'lucide-react';

interface SplashScreenProps {
  message?: string;
  subMessage?: string;
}

const statusMessages = [
  'Connecting securely to Nivo Servers...',
  'Encrypting 256-bit session data...',
  'Preparing your secure wallet...',
  'Loading your live dashboard...',
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ message, subMessage }) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % statusMessages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const currentStatus = message || statusMessages[msgIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-50 bg-[#0B0B0B] flex flex-col items-center justify-between p-6 overflow-hidden select-none"
    >
      {/* Background Radial Glow & Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Central Orange Radial Glow */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.15, 0.28, 0.15],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-96 h-96 bg-[#F27D26] rounded-full blur-[110px]"
        />

        {/* Ambient Secondary Ring */}
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.08, 0.18, 0.08],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-72 h-72 bg-[#FF9D42] rounded-full blur-[80px]"
        />

        {/* Subtle Geometric Overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Top Header Security Tag */}
      <div className="relative z-10 pt-4 flex items-center gap-1.5 text-gray-500 text-[10px] font-extrabold uppercase tracking-widest bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-full backdrop-blur-md">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Bank-Grade Encryption</span>
      </div>

      {/* Main Center Brand Logo & Loader */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto max-w-sm w-full px-4">
        {/* Floating Brand Logo Badge */}
        <motion.div
          animate={{
            y: [-3, 3, -3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative mb-6"
        >
          {/* Animated Glow Aura */}
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -inset-2 bg-gradient-to-r from-[#F27D26] to-[#E6721F] rounded-3xl blur-lg"
          />

          {/* Logo Icon Box */}
          <div className="relative w-20 h-20 bg-gradient-to-br from-[#F27D26] via-[#E86C15] to-[#C94F00] rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-950/50 border border-white/20">
            <span className="text-white font-black text-4xl tracking-tighter drop-shadow-md">N</span>
            <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white/90 animate-pulse" />
          </div>
        </motion.div>

        {/* Brand Name */}
        <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
          <span>NIVO</span>
          <span className="text-[#F27D26]">CASH</span>
        </h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em] mt-1 mb-8">
          Mobile Financial Platform
        </p>

        {/* Sleek Animated Progress Bar */}
        <div className="w-full max-w-[220px] bg-white/5 border border-white/10 rounded-full h-1.5 p-0.5 overflow-hidden mb-4 relative">
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="w-1/2 h-full bg-gradient-to-r from-transparent via-[#F27D26] to-transparent rounded-full shadow-sm shadow-orange-500"
          />
        </div>

        {/* Dynamic Status Text with Smooth Fade */}
        <div className="h-6 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStatus}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
              className="text-xs font-semibold text-gray-300 tracking-tight"
            >
              {currentStatus}
            </motion.p>
          </AnimatePresence>
        </div>

        {subMessage && (
          <p className="text-[10px] text-gray-500 mt-1 font-medium">{subMessage}</p>
        )}
      </div>

      {/* Bottom Footer Info */}
      <div className="relative z-10 pb-4 flex flex-col items-center gap-1 text-[10px] text-gray-500 font-medium">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-gray-400" />
          <span>Secured by Nivo Engine</span>
        </div>
        <p className="text-[9px] text-gray-600">Centralized Instant Settlements</p>
      </div>
    </motion.div>
  );
};
