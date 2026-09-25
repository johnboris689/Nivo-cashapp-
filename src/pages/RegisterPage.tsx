import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, Gift, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NevoBrandLockup } from '../components/NevoLogo';

export const RegisterPage: React.FC = () => {
  const { register, settings } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bonusAmount = settings?.referralBonusAmount || 1200;

  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl) {
      setReferralCode(refFromUrl.toUpperCase());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !username.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        referralCode: referralCode.trim() || undefined,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nevo-auth-shell min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 py-10 relative overflow-hidden">
      <div className="w-full max-w-[500px] mx-auto z-10">
        {/* Centered Brand Lockup - Required by specification */}
        <div className="mb-6">
          <NevoBrandLockup
            logoSize={54}
            subtitle="Join thousands of users managing wallet & rewards on Nevo"
          />
        </div>

        <div className="nevo-auth-card rounded-2xl p-6 sm:p-7 shadow-2xl">
          {/* Segmented Auth Switch */}
          <div className="p-1 bg-[#050C0E] border border-white/[0.08] rounded-xl flex items-center mb-5">
            <div className="flex-1 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider rounded-lg bg-gradient-to-r from-[#008F7A]/30 to-[#00C9A7]/25 text-[#7EE8D3] border border-[#00C9A7]/30 shadow-[0_2px_12px_rgba(0,201,167,0.15)]">
              Sign Up
            </div>
            <Link
              to="/login"
              className="flex-1 h-10 flex items-center justify-center text-xs font-bold uppercase tracking-wider rounded-lg text-[#8E9A9A] hover:text-white border border-transparent transition-all"
            >
              Sign In
            </Link>
          </div>

          {referralCode && (
            <div className="mb-5 bg-[#00C9A7]/10 border border-[#00C9A7]/25 p-3 rounded-xl flex items-center gap-3 text-[#7EE8D3] text-xs">
              <Gift className="w-4 h-4 shrink-0 text-[#00C9A7]" />
              <div>
                <p className="text-white font-bold">Referral Applied: {referralCode}</p>
                <p className="text-[11px] text-slate-300 font-normal">
                  Your referrer will receive ₦{bonusAmount.toLocaleString()} upon registration.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full h-12 bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username *
                </label>
                <div className="relative">
                  <span className="text-slate-500 text-xs font-bold absolute left-3.5 top-1/2 -translate-y-1/2">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="johndoe"
                    className="w-full h-12 bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-8 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full h-12 bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08012345678"
                    className="w-full h-12 bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full h-12 bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-11 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Referral Code (Optional)
              </label>
              <div className="relative">
                <Gift className="w-4 h-4 text-[#00C9A7] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="e.g. NEVO8912"
                  className="w-full h-12 bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-4 text-[#7EE8D3] font-mono font-bold text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 uppercase transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-xs font-bold uppercase tracking-wider nevo-primary-button rounded-xl shadow-lg shadow-[#00C9A7]/20 active:scale-[0.98] transition-all mt-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Creating Your Account...' : 'Complete Free Registration'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/[0.08] pt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#7EE8D3] hover:underline ml-1">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

