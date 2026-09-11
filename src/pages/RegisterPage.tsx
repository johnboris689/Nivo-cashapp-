import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, Mail, Lock, User, Phone, Gift, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-[#100709] flex items-center justify-center p-4 relative overflow-hidden py-12">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7A1831]/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-lg nivo-glass-strong border border-[#8F1D3A]/30 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7A1831] to-[#C13A5A] flex items-center justify-center shadow-lg shadow-[#8F1D3A]/20">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white">
              NIVO <span className="text-[#C13A5A]">CASH</span>
            </span>
          </Link>
          <h1 className="text-xl font-black text-white mt-1">Create Your Account</h1>
          <p className="text-xs text-slate-400 mt-1">
            Join thousands of users earning daily on Nivo Cash App
          </p>
        </div>

        {referralCode && (
          <div className="mb-6 bg-gradient-to-r from-[#7A1831]/20 to-[#A52A4A]/20 border border-[#C13A5A]/30 p-3.5 rounded-2xl flex items-center gap-3 text-[#D46A83] text-xs font-bold">
            <Gift className="w-5 h-5 shrink-0 text-[#C13A5A]" />
            <div>
              <p className="text-white font-extrabold">Referred by Code: {referralCode}</p>
              <p className="text-[11px] text-slate-300 font-normal">
                Your referrer will receive a ₦{bonusAmount.toLocaleString()} bonus upon your registration!
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3.5 bg-[#8F1D3A]/10 border border-[#8F1D3A]/30 rounded-xl text-[#C13A5A] text-xs flex items-center gap-2.5 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#C13A5A]" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full nivo-glass-surface border border-[#8F1D3A]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#C13A5A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Username *
              </label>
              <div className="relative">
                <span className="text-slate-400 text-xs font-bold absolute left-3.5 top-1/2 -translate-y-1/2">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="johndoe"
                  className="w-full nivo-glass-surface border border-[#8F1D3A]/20 rounded-xl pl-8 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#C13A5A] transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full nivo-glass-surface border border-[#8F1D3A]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#C13A5A] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08012345678"
                  className="w-full nivo-glass-surface border border-[#8F1D3A]/20 rounded-xl pl-10 pr-4 py-3 text-white text-sm focus:outline-none focus:border-[#C13A5A] transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full nivo-glass-surface border border-[#8F1D3A]/20 rounded-xl pl-10 pr-10 py-3 text-white text-sm focus:outline-none focus:border-[#C13A5A] transition-colors"
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
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Referral Code (Optional)
            </label>
            <div className="relative">
              <Gift className="w-4 h-4 text-[#C13A5A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. NIVO8912"
                className="w-full nivo-glass-surface border border-[#8F1D3A]/20 rounded-xl pl-10 pr-4 py-3 text-[#C13A5A] font-mono font-bold text-sm focus:outline-none focus:border-[#C13A5A] transition-colors uppercase"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#7A1831] to-[#A52A4A] hover:from-[#8F1D3A] hover:to-[#C13A5A] disabled:opacity-50 text-white font-black text-sm py-3.5 rounded-xl shadow-lg shadow-[#7A1831]/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
          >
            {loading ? 'Creating Your Account...' : 'Complete Free Registration'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-400 border-t border-white/10 pt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-black text-[#C13A5A] hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
