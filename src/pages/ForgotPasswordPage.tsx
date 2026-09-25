import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Lock, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';
import { NevoBrandLockup } from '../components/NevoLogo';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => setCooldown(v => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const sendOtp = async () => {
    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.forgotPassword(normalized);
      setEmail(normalized);
      setOtp('');
      setStep('otp');
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Unable to send the verification code.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.verifyResetOtp({ email, otp });
      setResetToken(res.resetToken);
      setStep('password');
    } catch (err: any) {
      setError(err.message || 'Incorrect or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.resetPassword({ email, resetToken, newPassword, confirmPassword });
      setNewPassword('');
      setConfirmPassword('');
      setResetToken('');
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Unable to change your password.');
    } finally {
      setLoading(false);
    }
  };

  const title = step === 'email' ? 'Reset Password' : step === 'otp' ? 'Verify Your Email' : step === 'password' ? 'Create New Password' : 'Password Updated';
  const subtitle = step === 'email'
    ? 'Enter your registered email and we will send a secure verification code.'
    : step === 'otp'
    ? `Enter the 6-digit code sent to ${email}.`
    : step === 'password'
    ? 'Choose a strong new password for your Nevo account.'
    : 'Your Nevo password has been changed successfully.';

  return (
    <div className="nevo-auth-shell min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      <div className="w-full max-w-[460px] mx-auto z-10">
        <div className="mb-6">
          <NevoBrandLockup
            logoSize={54}
            subtitle={subtitle}
          />
        </div>

        <div className="nevo-auth-card rounded-2xl p-6 sm:p-7 shadow-2xl">
          <h2 className="text-base font-bold text-white mb-4 text-center">{title}</h2>

          <div className="flex gap-1.5 mb-5">
            {['email', 'otp', 'password'].map((s, i) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full ${
                  step === 'success' || i < ['email','otp','password'].indexOf(step) + (step !== 'email' ? 1 : 0)
                    ? 'bg-[#00C9A7]'
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {step === 'email' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Account Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendOtp()}
                    placeholder="yourname@domain.com"
                    className="w-full bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={sendOtp}
                disabled={loading}
                className="w-full text-xs font-bold uppercase tracking-wider py-3.5 nevo-primary-button rounded-xl shadow-lg shadow-[#00C9A7]/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {loading ? 'Sending Verification Code...' : 'Send Verification Code'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="bg-[#050C0E] border border-white/[0.06] rounded-xl p-4 text-center">
                <ShieldCheck className="w-6 h-6 text-[#00C9A7] mx-auto mb-1.5" />
                <p className="text-xs text-slate-300">A 6-digit code was sent to</p>
                <p className="text-xs font-bold text-white mt-0.5 break-all">{email}</p>
                <p className="text-[10px] text-slate-400 mt-1">The code expires in 10 minutes.</p>
              </div>
              <input
                autoFocus
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && verifyOtp()}
                placeholder="000000"
                className="w-full bg-[#050C0E]/90 border border-white/[0.08] rounded-xl px-4 py-3.5 text-center text-2xl font-bold tracking-[0.55em] text-[#7EE8D3] focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20"
              />
              <button
                onClick={verifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full text-xs font-bold uppercase tracking-wider py-3.5 nevo-primary-button rounded-xl shadow-lg shadow-[#00C9A7]/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {loading ? 'Verifying Code...' : 'Verify Code'}
              </button>
              <button
                onClick={sendOtp}
                disabled={loading || cooldown > 0}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl py-2.5 text-xs font-semibold text-[#7EE8D3] disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Code'}
              </button>
            </div>
          )}

          {step === 'password' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-11 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && resetPassword()}
                    className="w-full bg-[#050C0E]/90 border border-white/[0.08] rounded-xl pl-10 pr-11 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#00C9A7] focus:ring-1 focus:ring-[#00C9A7]/20 transition-colors"
                    placeholder="Repeat your new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                onClick={resetPassword}
                disabled={loading}
                className="w-full text-xs font-bold uppercase tracking-wider py-3.5 nevo-primary-button rounded-xl shadow-lg shadow-[#00C9A7]/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer"
              >
                {loading ? 'Updating Password...' : 'Change Password'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center space-y-3 py-3">
              <div className="w-12 h-12 rounded-full bg-[#00C9A7]/20 border border-[#00C9A7]/30 flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-7 h-7 text-[#00C9A7]" />
              </div>
              <h2 className="text-base font-bold text-white">Password Changed Successfully</h2>
              <p className="text-xs text-slate-400 leading-relaxed">Your password has been updated. You can now sign in with your new credentials.</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full text-xs font-bold uppercase tracking-wider py-3.5 nevo-primary-button rounded-xl shadow-lg shadow-[#00C9A7]/20 active:scale-[0.98] transition-all mt-3 cursor-pointer"
              >
                Return to Login
              </button>
            </div>
          )}

          {step !== 'success' && (
            <button
              onClick={() => {
                setError(null);
                if (step === 'email') navigate('/login');
                else setStep(step === 'otp' ? 'email' : 'otp');
              }}
              className="mt-6 mx-auto flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{step === 'email' ? 'Back to Sign In' : 'Back'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

