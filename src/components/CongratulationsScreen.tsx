import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, ArrowRight, ArrowUpRight, Smartphone, Wifi, Zap, ShieldCheck, Gift, Fingerprint, CheckCircle2 } from 'lucide-react';
import { registerDeviceBiometric } from '../lib/webauthn';
import { getCachedSettings } from '../services/settingsService';

interface CongratulationsScreenProps {
  userEmail: string;
  onContinue: () => void;
}

export default function CongratulationsScreen({ userEmail, onContinue }: CongratulationsScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBioLoading, setIsBioLoading] = useState(false);
  const [bioRegistered, setBioRegistered] = useState(false);
  const [bioError, setBioError] = useState('');
  const [sparkles, setSparkles] = useState<{ id: number; left: string; top: string; scale: number; delay: number }[]>([]);

  const handleRegisterBiometric = async () => {
    setIsBioLoading(true);
    setBioError('');
    const token = localStorage.getItem('nevo_auth_token');
    if (!token) {
      setBioError('Session invalid. Please continue to login.');
      setIsBioLoading(false);
      return;
    }

    try {
      const res = await registerDeviceBiometric(token);
      if (res.success) {
        setBioRegistered(true);
      } else {
        setBioError(res.message || 'Biometric registration failed.');
      }
    } catch (err: any) {
      setBioError(err.message || 'Biometric registration error.');
    } finally {
      setIsBioLoading(false);
    }
  };
  const [confetti, setConfetti] = useState<{ id: number; left: string; delay: number; color: string; duration: number }[]>([]);
  const [particles, setParticles] = useState<{ id: number; left: string; top: string; delay: number; size: number }[]>([]);

  useEffect(() => {
    // Generate sparkle coordinates
    const sparkleList = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 85 + 5}%`,
      scale: Math.random() * 0.7 + 0.3,
      delay: Math.random() * 3,
    }));
    setSparkles(sparkleList);

    // Generate elegant, slow falling confetti in fintech brand colors
    const colors = ['#2dd4bf', '#818cf8', '#38bdf8', '#34d399', '#fbbf24', '#c084fc'];
    const confettiList = Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 98 + 1}%`,
      delay: Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 5 + 6, // Slower, more elegant drop
    }));
    setConfetti(confettiList);

    // Generate floating glowing ambient particles
    const particleList = Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 90 + 5}%`,
      delay: Math.random() * 4,
      size: Math.random() * 5 + 3,
    }));
    setParticles(particleList);
  }, []);

  const handleContinue = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/user/welcome-reward-shown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('nevo_auth_token')}`
        }
      });
      if (response.ok) {
        onContinue();
      } else {
        onContinue();
      }
    } catch (err) {
      console.error('Error marking welcome reward shown:', err);
      onContinue();
    } finally {
      setIsSubmitting(false);
    }
  };

  const featureCards = [
    { icon: CheckCircle2, title: "Complete Tasks", desc: "Complete tasks and earn rewards", color: "text-teal-400 bg-teal-500/10 border-teal-500/20" },
    { icon: Sparkles, title: "Watch Adverts", desc: "Watch rewarded adverts and earn", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" },
    { icon: ArrowUpRight, title: "Refer Friends", desc: "Invite friends and earn rewards", color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
    { icon: ArrowUpRight, title: "Withdraw Funds", desc: "Cash out after eligibility", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  ];

  return (
    <div className="fixed inset-0 z-[100] w-full h-full bg-[#070712] [background:radial-gradient(ellipse_at_top,#1e1b4b_0%,#070712_60%),radial-gradient(ellipse_at_bottom,#0d9488_0%,#070712_60%)] text-white font-sans overflow-y-auto overscroll-y-contain no-scrollbar">
      
      {/* Background glowing blurred orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-indigo-500/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-teal-500/10 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={`part-${p.id}`}
          className="fixed rounded-full bg-teal-300/20 blur-[1px] pointer-events-none"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -35, 0],
            x: [0, 12, 0],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: 8 + (p.id % 4),
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Twinkling Sparkles */}
      {sparkles.map((s) => (
        <motion.div
          key={`spark-${s.id}`}
          className="fixed pointer-events-none"
          style={{
            left: s.left,
            top: s.top,
          }}
          animate={{
            scale: [0, s.scale, 0],
            opacity: [0, 0.8, 0],
            rotate: [0, 180],
          }}
          transition={{
            duration: 3.5 + (s.id % 3),
            repeat: Infinity,
            delay: s.delay,
            ease: 'easeInOut',
          }}
        >
          <Sparkles className="w-4 h-4 fill-teal-300/20 text-teal-300" />
        </motion.div>
      ))}

      {/* Falling Confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {confetti.map((c) => (
          <motion.div
            key={`conf-${c.id}`}
            className="absolute w-1.5 h-3.5 rounded-sm opacity-80"
            style={{
              left: c.left,
              backgroundColor: c.color,
              top: '-20px',
            }}
            animate={{
              y: ['0vh', '108vh'],
              rotate: [0, 360 + (c.id * 12)],
              x: ['0px', `${(c.id % 2 === 0 ? 1 : -1) * (25 + (c.id % 8))}px`],
            }}
            transition={{
              duration: c.duration,
              repeat: Infinity,
              delay: c.delay,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Main Inner Scrollable Flex Wrapper */}
      <div className="min-h-full min-h-[100dvh] w-full flex flex-col justify-between items-center p-4 sm:p-6 md:p-8 pb-16 sm:pb-24 pb-safe relative z-10 space-y-6">

        {/* Top Header Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-xl mx-auto flex items-center justify-between pt-2 relative z-10 shrink-0"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center shadow-md">
              <span className="text-white font-black text-xs tracking-tighter">NV</span>
            </div>
            <span className="text-sm font-black tracking-tight bg-gradient-to-r from-teal-400 to-indigo-300 bg-clip-text text-transparent">
              {getCachedSettings().websiteName || 'Nevo'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono font-bold text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            VERIFIED USER
          </div>
        </motion.div>

        {/* Main Content Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="w-full max-w-md my-auto relative z-10 py-2 flex flex-col items-center text-center space-y-4 shrink-0"
        >
          
          {/* Animated Success Checkmark Badge */}
          <div className="relative mb-1">
            {/* Glowing Aura */}
            <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-2xl scale-150 animate-pulse" />
            <div className="absolute -inset-3 bg-gradient-to-tr from-indigo-500/30 to-teal-400/30 rounded-full blur-md animate-spin" style={{ animationDuration: '12s' }} />
            
            <motion.div
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.2 }}
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-teal-500 via-indigo-600 to-teal-400 flex items-center justify-center border-2 border-teal-300/40 shadow-[0_0_40px_rgba(45,212,191,0.4)] relative z-10"
            >
              <Check className="w-10 h-10 sm:w-11 sm:h-11 text-teal-100 stroke-[3.5]" />
            </motion.div>
          </div>

          {/* Title and Subtitle */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              Congratulations!
            </h1>
            <p className="text-sm font-semibold text-teal-300 tracking-wide">
              Your Nevo account is ready. Start earning with tasks and adverts.
            </p>
          </div>

          <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-indigo-500/5 to-transparent pointer-events-none" />
            <div className="relative flex items-center justify-center gap-2 text-teal-300 font-black text-xs uppercase tracking-wider">
              <Gift className="w-4 h-4" />
              Welcome to Nevo
            </div>
            <p className="relative text-xs text-slate-300 leading-relaxed mt-3">Complete tasks, watch rewarded adverts, refer friends and build your Nevo earnings.</p>
          </div>

        {/* Biometric Fingerprint / Passkey Setup Card */}
        <div className="w-full bg-slate-900/80 border border-teal-500/30 rounded-2xl p-3.5 text-left space-y-2.5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/20">
                <Fingerprint className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Enable Fingerprint / Face ID</h3>
                <p className="text-[10px] text-slate-400">Log in securely with native device biometrics</p>
              </div>
            </div>
          </div>

          {bioRegistered ? (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Fingerprint / Passkey Registered & Active!</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleRegisterBiometric}
              disabled={isBioLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 via-indigo-600 to-teal-500 hover:from-teal-400 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Fingerprint className="w-4 h-4" />
              {isBioLoading ? 'Opening Device Biometric Prompt...' : 'Register Fingerprint'}
            </button>
          )}
          {bioError && (
            <p className="text-[10px] text-rose-400 font-medium">{bioError}</p>
          )}
        </div>

        {/* Feature Preview Grid (2x2) */}
        <div className="w-full grid grid-cols-2 gap-2 text-left pt-1">
          {featureCards.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all flex items-center gap-2.5"
              >
                <div className={`p-2 rounded-lg border shrink-0 ${feat.color}`}>
                  <IconComp className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-white truncate">{feat.title}</div>
                  <div className="text-[9.5px] text-slate-400 truncate">{feat.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

      </motion.div>

        {/* Bottom Continue / Proceed Button CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="w-full max-w-md mx-auto relative z-10 shrink-0 pt-2"
        >
          <motion.button
            onClick={handleContinue}
            disabled={isSubmitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-teal-400 via-indigo-500 to-teal-400 hover:from-teal-300 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(45,212,191,0.3)] hover:shadow-[0_0_40px_rgba(45,212,191,0.5)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin"></span>
                Setting Up Your Wallet...
              </span>
            ) : (
              <>
                Proceed to Dashboard
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}

