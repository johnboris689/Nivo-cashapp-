import React, { useState } from 'react';
import { X, Copy, Check, Share2, Sparkles, MessageCircle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ShareModalProps {
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ onClose }) => {
  const { user, settings } = useAuth();

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const bonusAmount = settings?.referralBonusAmount || 1200;
  const referralCode = user?.referralCode || 'NIVO123';
  const referralLink = user?.referralLink || `${window.location.origin}/register?ref=${referralCode}`;

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nivo Cash App Referral',
          text: `🔥 Join Nivo Cash App with my link & start earning! Use my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch (err) {
        console.log('Share canceled', err);
      }
    } else {
      copyLink();
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `🔥 Hey! Join me on Nivo Cash App and earn money completing tasks & referring friends! Sign up here: ${referralLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const shareTelegram = () => {
    const text = encodeURIComponent(`🔥 Join Nivo Cash App today & earn ₦${bonusAmount} per referral!`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141414] border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F27D26]" />
            <h3 className="font-bold text-white text-base">Share & Earn ₦{bonusAmount.toLocaleString()}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-400">Your Exclusive Referral Link</p>
            <p className="text-sm font-bold text-white">Earn ₦{bonusAmount.toLocaleString()} per friend who signs up!</p>
          </div>

          {/* Code Box */}
          <div className="bg-black/40 border border-white/5 p-3 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-bold">Referral Code</p>
              <p className="text-base font-mono font-bold text-[#F27D26]">{referralCode}</p>
            </div>
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 bg-[#F27D26]/10 text-[#F27D26] hover:bg-[#F27D26]/20 font-bold text-xs px-3 py-2 rounded-lg transition-all cursor-pointer border border-[#F27D26]/20"
            >
              {copiedCode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Link Box */}
          <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-2">
            <p className="text-[10px] text-gray-500 uppercase font-bold">Referral Link</p>
            <p className="text-xs font-mono text-gray-300 break-all bg-black p-2.5 rounded-lg border border-white/5">
              {referralLink}
            </p>
            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2.5 rounded-lg border border-white/5 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[#F27D26]" />}
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Full Link'}</span>
            </button>
          </div>

          {/* Social Share Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={shareWhatsApp}
              className="flex flex-col items-center justify-center p-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-2xl text-green-500 text-xs font-bold transition-all cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 mb-1" />
              WhatsApp
            </button>
            <button
              onClick={shareTelegram}
              className="flex flex-col items-center justify-center p-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-2xl text-blue-400 text-xs font-bold transition-all cursor-pointer"
            >
              <Send className="w-5 h-5 mb-1" />
              Telegram
            </button>
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center p-3 bg-[#F27D26]/10 hover:bg-[#F27D26]/20 border border-[#F27D26]/20 rounded-2xl text-[#F27D26] text-xs font-bold transition-all cursor-pointer"
            >
              <Share2 className="w-5 h-5 mb-1" />
              More Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
