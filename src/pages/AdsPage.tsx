import React, { useEffect, useState, useRef } from 'react';
import { 
  PlayCircle, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  TrendingUp, 
  Gift, 
  Lock,
  ExternalLink,
  Award,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api, getAuthToken } from '../lib/api';

declare global {
  interface Window {
    googletag?: {
      cmd: Array<() => void>;
      defineOutOfPageSlot?: (adUnitPath: string, format: any) => any;
      pubads?: () => any;
      enableServices?: () => void;
      display?: (slot: any) => void;
      destroySlots?: (slots?: any[]) => boolean;
      enums?: {
        OutOfPageFormat: {
          REWARDED: any;
        };
      };
    };
  }
}

interface AdHistoryItem {
  id: string;
  sessionId: string;
  provider: string;
  rewardAmount: number;
  status: string;
  reference: string;
  createdAt: string;
  completedAt: string;
}

interface AdStats {
  rewardAmount: number;
  totalAdsWatched: number;
  totalEarnings: number;
  todayEarnings: number;
  todayAdsCount: number;
  history: AdHistoryItem[];
}

export interface AdsPageProps {
  onBack?: () => void;
}

export const AdsPage: React.FC<AdsPageProps> = ({ onBack }) => {
  const handleNavigateBack = () => {
    if (onBack) {
      onBack();
    } else if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/';
    }
  };
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [rewardAmount, setRewardAmount] = useState<number>(200);
  const [adUnitPath, setAdUnitPath] = useState<string>('/21775744923/example/rewarded');
  const [providerName, setProviderName] = useState<string>('Google Ad Manager (GPT Web Rewarded)');
  
  const [stats, setStats] = useState<AdStats>({
    rewardAmount: 200,
    totalAdsWatched: 0,
    totalEarnings: 0,
    todayEarnings: 0,
    todayAdsCount: 0,
    history: []
  });

  // Ad watching states
  const [adState, setAdState] = useState<'idle' | 'preparing' | 'loading' | 'watching' | 'verifying' | 'granted' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isRewardGranted, setIsRewardGranted] = useState<boolean>(false);
  const [gptLoaded, setGptLoaded] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<number | null>(null);

  // References to active slots & listeners
  const currentSlotRef = useRef<any>(null);
  const rewardGrantedRef = useRef<boolean>(false);
  const sessionRef = useRef<string | null>(null);

  // Load GPT SDK once on mount
  useEffect(() => {
    const loadGptScript = () => {
      if (document.getElementById('google-gpt-script')) {
        setGptLoaded(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-gpt-script';
      script.src = 'https://securepubads.g.doubleclick.net/tag/js/gpt.js';
      script.async = true;
      script.onload = () => {
        window.googletag = window.googletag || { cmd: [] };
        setGptLoaded(true);
      };
      script.onerror = () => {
        console.warn('Google Ad Manager GPT script could not be loaded (ad blocker may be active).');
        setGptLoaded(false);
      };
      document.head.appendChild(script);
    };

    loadGptScript();
    fetchConfigAndStats();

    // Fetch user balance
    api.getCurrentUser().then(res => {
      if (res?.user) {
        setUserBalance(res.user.balance);
      }
    }).catch(() => {});
  }, []);

  const fetchConfigAndStats = async () => {
    try {
      setLoadingConfig(true);
      const [configRes, statsRes] = await Promise.all([
        api.getAdConfig().catch(() => ({ success: true, rewardAmount: 200, adUnitPath: '/21775744923/example/rewarded', provider: 'Google Ad Manager (GPT Web Rewarded)' })),
        api.getAdStats().catch(() => ({ success: true, rewardAmount: 200, totalAdsWatched: 0, totalEarnings: 0, todayEarnings: 0, todayAdsCount: 0, history: [] }))
      ]);

      if (configRes?.rewardAmount) setRewardAmount(configRes.rewardAmount);
      if (configRes?.adUnitPath) setAdUnitPath(configRes.adUnitPath);
      if (configRes?.provider) setProviderName(configRes.provider);

      if (statsRes) {
        setStats({
          rewardAmount: statsRes.rewardAmount || 200,
          totalAdsWatched: statsRes.totalAdsWatched || 0,
          totalEarnings: statsRes.totalEarnings || 0,
          todayEarnings: statsRes.todayEarnings || 0,
          todayAdsCount: statsRes.todayAdsCount || 0,
          history: statsRes.history || []
        });
      }
    } catch (err: any) {
      console.error('Error fetching ads configuration:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  // Launch the rewarded ad workflow
  const handleWatchAd = async () => {
    if (adState !== 'idle' && adState !== 'error' && adState !== 'granted') {
      return;
    }

    setErrorMessage(null);
    setAdState('preparing');
    setStatusMessage('Initiating cryptographically signed ad session...');
    rewardGrantedRef.current = false;
    setIsRewardGranted(false);

    try {
      // 1. Verify user session
      const token = getAuthToken();
      if (!token) {
        setAdState('error');
        setErrorMessage('Please log in to your Nevo account to watch rewarded ads and earn ₦' + rewardAmount + '.');
        return;
      }

      // 2. Create secure session on server
      const session = await api.createAdSession();
      if (!session?.sessionId) {
        throw new Error('Could not establish ad verification session. Please try again.');
      }

      const sessId = session.sessionId;
      setActiveSessionId(sessId);
      sessionRef.current = sessId;
      const targetUnit = session.adUnitPath || adUnitPath;

      setAdState('loading');
      setStatusMessage('Requesting rewarded ad from Google Ad Manager...');

      // Ensure GPT is initialized
      window.googletag = window.googletag || { cmd: [] };

      window.googletag.cmd.push(() => {
        try {
          // Cleanup previous slot if any
          if (currentSlotRef.current && window.googletag?.destroySlots) {
            try {
              window.googletag.destroySlots([currentSlotRef.current]);
            } catch (e) {}
          }

          const outOfPageFormat = window.googletag?.enums?.OutOfPageFormat?.REWARDED;
          if (!window.googletag?.defineOutOfPageSlot || !outOfPageFormat) {
            throw new Error('Rewarded ad format is not supported or ad blocker is active.');
          }

          const rewardedSlot = window.googletag.defineOutOfPageSlot(
            targetUnit,
            outOfPageFormat
          );

          if (!rewardedSlot) {
            setAdState('error');
            setErrorMessage('No rewarded ad is available right now. Please try again later.');
            return;
          }

          currentSlotRef.current = rewardedSlot;
          const pubads = window.googletag.pubads ? window.googletag.pubads() : null;

          if (!pubads) {
            throw new Error('Google Publisher Tag pubads service is unavailable.');
          }

          rewardedSlot.addService(pubads);

          // Add event listener for slot ready
          const onSlotReady = (event: any) => {
            if (event.slot === rewardedSlot) {
              setAdState('watching');
              setStatusMessage('Advertisement playing. Please watch until completion to earn ₦' + rewardAmount + '...');
              // Make rewarded ad visible to user
              if (typeof event.makeRewardedVisible === 'function') {
                event.makeRewardedVisible();
              }
            }
          };

          // Add event listener for reward granted
          const onRewardGranted = async (event: any) => {
            if (event.slot === rewardedSlot) {
              rewardGrantedRef.current = true;
              setIsRewardGranted(true);
              setAdState('verifying');
              setStatusMessage('Reward granted by provider! Verifying completion with Nevo server...');

              try {
                const verifyRes = await api.verifyAdReward({
                  sessionId: sessionRef.current || sessId,
                  providerToken: event.payload,
                  providerTxId: (event.payload && (event.payload.type || event.payload.id)) || `${sessId}-${Date.now()}`
                });

                if (verifyRes.success) {
                  setAdState('granted');
                  setStatusMessage(`₦${verifyRes.rewardAmount || rewardAmount} reward verified and added to your Nevo wallet!`);
                  
                  if (verifyRes.newBalance !== undefined) {
                    setUserBalance(verifyRes.newBalance);
                  }

                  // Trigger celebratory confetti
                  try {
                    confetti({
                      particleCount: 80,
                      spread: 70,
                      origin: { y: 0.6 }
                    });
                  } catch (e) {}

                  // Refresh stats
                  fetchConfigAndStats();
                } else {
                  setAdState('error');
                  setErrorMessage(verifyRes.message || 'Verification could not be completed.');
                }
              } catch (verErr: any) {
                setAdState('error');
                setErrorMessage(verErr.message || 'Ad reward verification failed. Please try again.');
              }
            }
          };

          // Add event listener for ad closed
          const onSlotClosed = (event: any) => {
            if (event.slot === rewardedSlot) {
              if (!rewardGrantedRef.current) {
                setAdState('error');
                setErrorMessage('Advertisement was closed before completion. Watch the complete ad to earn your ₦' + rewardAmount + ' reward.');
              }
              try {
                if (window.googletag?.destroySlots) {
                  window.googletag.destroySlots([rewardedSlot]);
                }
              } catch (e) {}
            }
          };

          // Add event listener for empty fill
          const onSlotRenderEnded = (event: any) => {
            if (event.slot === rewardedSlot && event.isEmpty) {
              setAdState('error');
              setErrorMessage('No rewarded ad is available right now. Please try again later.');
            }
          };

          pubads.addEventListener('rewardedSlotReady', onSlotReady);
          pubads.addEventListener('rewardedSlotGranted', onRewardGranted);
          pubads.addEventListener('rewardedSlotClosed', onSlotClosed);
          pubads.addEventListener('slotRenderEnded', onSlotRenderEnded);

          if (window.googletag.enableServices) {
            window.googletag.enableServices();
          }
          if (window.googletag.display) {
            window.googletag.display(rewardedSlot);
          }
        } catch (gptErr: any) {
          console.error('GPT Execution Error:', gptErr);
          setAdState('error');
          setErrorMessage('No rewarded ad is available right now. Please try again later.');
        }
      });
    } catch (err: any) {
      console.error('Ad Session Error:', err);
      setAdState('error');
      setErrorMessage(err.message || 'Unable to connect to rewarded ad provider. Please check your network connection.');
    }
  };

  const isWatchingOrBusy = adState === 'preparing' || adState === 'loading' || adState === 'watching' || adState === 'verifying';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleNavigateBack}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide">WATCH &amp; EARN</h1>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400">Rewarded Ad Monetization Engine</p>
            </div>
          </div>

          {userBalance !== null && (
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block leading-tight">Balance</span>
                <span className="text-sm font-bold text-white">₦{userBalance.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Banner Card */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 shadow-xl">
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL REWARDED ADVERTISING</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Watch Rewarded Advertisements
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mt-1 max-w-xl">
                Watch verified advertisements to completion and earn instant rewards credited directly to your Nevo wallet.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="bg-slate-900/80 border border-emerald-500/40 px-4 py-2.5 rounded-xl shadow-inner">
                <span className="text-xs text-emerald-400 uppercase font-medium tracking-wider block">Reward Per Ad</span>
                <span className="text-2xl font-black text-emerald-300">₦{rewardAmount.toLocaleString()}</span>
              </div>

              <div className="bg-slate-900/80 border border-slate-700 px-4 py-2.5 rounded-xl">
                <span className="text-xs text-slate-400 uppercase font-medium tracking-wider block">Verification</span>
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Server-Side Verified
                </span>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Ad Action Center Card */}
        <section className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-indigo-400" />
                <span>Rewarded Advertisement Unit</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Provider: <span className="text-slate-300 font-medium">{providerName}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Reward Rate</span>
              <span className="block text-emerald-400 font-bold text-sm">₦{rewardAmount} / completion</span>
            </div>
          </div>

          {/* Interactive Ad Launcher Box */}
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-4">
            <div className="max-w-md mx-auto space-y-2">
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                Important: Watch the advertisement until completion. Your reward is credited after successful verification.
              </p>
              <p className="text-xs text-slate-400">
                Nevo reward: <span className="text-emerald-400 font-semibold">₦{rewardAmount}</span> per successfully completed eligible advertisement.
              </p>
            </div>

            {/* Status Messages */}
            {statusMessage && (
              <div className={`p-3 rounded-lg text-xs font-medium max-w-md mx-auto ${
                adState === 'granted' 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                  : 'bg-indigo-500/10 border border-indigo-500/30 text-indigo-300'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {isWatchingOrBusy && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {adState === 'granted' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  <span>{statusMessage}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium max-w-md mx-auto flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Trigger Button */}
            <div className="pt-2">
              <button
                onClick={handleWatchAd}
                disabled={isWatchingOrBusy}
                className={`w-full sm:w-auto min-w-[240px] px-8 py-3.5 rounded-xl font-bold text-base transition-all duration-200 flex items-center justify-center gap-3 mx-auto shadow-lg cursor-pointer ${
                  isWatchingOrBusy
                    ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white shadow-emerald-900/30 hover:shadow-emerald-900/50 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isWatchingOrBusy ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>
                      {adState === 'preparing' && 'Connecting...'}
                      {adState === 'loading' && 'Loading Ad...'}
                      {adState === 'watching' && 'Watching Ad...'}
                      {adState === 'verifying' && 'Verifying...'}
                    </span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-5 h-5 text-emerald-200" />
                    <span>WATCH ADS</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Important Rules Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Full Duration</strong>
                <span>Watch the full video without closing early to qualify.</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Verified Reward</strong>
                <span>Server verifies completion token before crediting ₦200.</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Withdrawal Notice</strong>
                <span>Withdrawal requires 5 referrals + ₦520 wallet deposit.</span>
              </div>
            </div>
          </div>
        </section>

        {/* User Ads Stats Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold block">Today's Earnings</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">₦{stats.todayEarnings.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500">{stats.todayAdsCount} ads watched today</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold block">Total Ad Rewards</span>
            <span className="text-xl font-bold text-white mt-1 block">₦{stats.totalEarnings.toLocaleString()}</span>
            <span className="text-[11px] text-slate-500">{stats.totalAdsWatched} all-time completed</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold block">Reward / Ad</span>
            <span className="text-xl font-bold text-indigo-400 mt-1 block">₦{rewardAmount}</span>
            <span className="text-[11px] text-slate-500">Per verified completion</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold block">Reward Status</span>
            <span className="text-sm font-semibold text-emerald-400 mt-1.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Active &amp; Instant
            </span>
            <span className="text-[11px] text-slate-500">Auto-credited to wallet</span>
          </div>
        </section>

        {/* Ads Reward History */}
        <section className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Rewarded Ads History</span>
            </h3>
            <span className="text-xs text-slate-400">{stats.history.length} records</span>
          </div>

          {stats.history.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Gift className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400">No ad rewards yet.</p>
              <p className="text-xs text-slate-500">Click &ldquo;WATCH ADS&rdquo; above to complete your first advertisement and earn ₦{rewardAmount}.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/80">
              {stats.history.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">Rewarded Ad Completed</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        VERIFIED
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{new Date(item.completedAt || item.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] truncate max-w-[140px] sm:max-w-[200px]" title={item.reference}>
                        {item.reference}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base font-bold text-emerald-400">+₦{item.rewardAmount.toLocaleString()}</span>
                    <span className="text-[11px] text-slate-500 block">Credited</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdsPage;
