import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NevoBrandLockup } from '../../components/NevoLogo';

export const AdminLoginPage: React.FC = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter administrator email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nevo-auth-shell min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <div className="w-full max-w-[460px] mx-auto z-10">
        <div className="mb-6">
          <NevoBrandLockup
            logoSize={54}
            tagline="ADMINISTRATOR ACCESS"
            subtitle="Nevo Operations & Management Portal"
          />
        </div>

        <div className="nevo-auth-card rounded-2xl p-6 sm:p-7 shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nevo.ng"
                  className="w-full bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-xs font-bold uppercase tracking-wider py-3.5 nevo-primary-button rounded-xl shadow-lg shadow-[#00C9A7]/20 active:scale-[0.98] transition-all mt-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400 border-t border-white/[0.08] pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-[#7EE8D3] hover:underline font-semibold cursor-pointer"
            >
              Return to Customer App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

