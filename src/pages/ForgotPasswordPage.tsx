import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, ArrowLeft, CheckCircle2, AlertCircle, Lock, Eye, EyeOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../lib/api';

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
    <div className="min-h-screen bg-[#100709] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#00C9A7]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#071114]/25 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md nivo-glass-strong rounded-[28px] p-7 sm:p-8 relative z-10">
        <div className="text-center mb-7">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#071114] via-[#008F7A] to-[#C13A5A] flex items-center justify-center shadow-lg shadow-[#00C9A7]/25">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white">NIVO <span className="text-[#C13A5A]">CASH</span></span>
          </Link>
          <h1 className="text-xl font-black text-white">{title}</h1>
          <p className="text-xs text-[#B99BA3] mt-1.5 leading-relaxed">{subtitle}</p>
        </div>

        <div className="flex gap-1.5 mb-6">
          {['email', 'otp', 'password'].map((s, i) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full ${step === 'success' || i < ['email','otp','password'].indexOf(step) + (step !== 'email' ? 1 : 0) ? 'bg-gradient-to-r from-[#008F7A] to-[#C13A5A]' : 'bg-[#071114]'}`} />
          ))}
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-[#071114]/25 border border-[#00BFA6]/30 rounded-2xl text-[#E6B8C3] text-xs flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#C13A5A]" />
            <span>{error}</span>
          </div>
        )}

        {step === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#E6D5DA] mb-1.5">Account Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#B99BA3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendOtp()} placeholder="yourname@domain.com" className="w-full nivo-input rounded-2xl pl-10 pr-4 py-3.5 text-sm" />
              </div>
            </div>
            <button onClick={sendOtp} disabled={loading} className="w-full nivo-primary rounded-2xl py-3.5 text-sm font-black disabled:opacity-50">
              {loading ? 'Sending Verification Code...' : 'Send Verification Code'}
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div className="nivo-glass-surface rounded-2xl p-4 text-center">
              <ShieldCheck className="w-7 h-7 text-[#C13A5A] mx-auto mb-2" />
              <p className="text-xs text-[#E6D5DA]">A 6-digit verification code was sent to</p>
              <p className="text-xs font-black text-white mt-1 break-all">{email}</p>
              <p className="text-[10px] text-[#B99BA3] mt-2">The code expires in 10 minutes.</p>
            </div>
            <input autoFocus inputMode="numeric" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} onKeyDown={e => e.key === 'Enter' && verifyOtp()} placeholder="000000" className="w-full nivo-input rounded-2xl px-4 py-4 text-center text-2xl font-black tracking-[0.55em]" />
            <button onClick={verifyOtp} disabled={loading || otp.length !== 6} className="w-full nivo-primary rounded-2xl py-3.5 text-sm font-black disabled:opacity-50">
              {loading ? 'Verifying Code...' : 'Verify Code'}
            </button>
            <button onClick={sendOtp} disabled={loading || cooldown > 0} className="w-full nivo-glass-surface rounded-2xl py-3 text-xs font-bold text-[#C13A5A] disabled:opacity-40 flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              {cooldown > 0 ? `Resend available in ${cooldown}s` : 'Resend Code'}
            </button>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#E6D5DA] mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B99BA3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full nivo-input rounded-2xl pl-10 pr-11 py-3.5 text-sm" placeholder="At least 8 characters" />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B99BA3] hover:text-white">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#E6D5DA] mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#B99BA3] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input type={showConfirm ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && resetPassword()} className="w-full nivo-input rounded-2xl pl-10 pr-11 py-3.5 text-sm" placeholder="Repeat your new password" />
                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#B99BA3] hover:text-white">{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <div className="nivo-glass-surface rounded-2xl p-3 text-[10px] text-[#B99BA3]">Use at least 8 characters. Your verification session can only be used once.</div>
            <button onClick={resetPassword} disabled={loading} className="w-full nivo-primary rounded-2xl py-3.5 text-sm font-black disabled:opacity-50">
              {loading ? 'Updating Password...' : 'Change Password'}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="nivo-glass-surface rounded-2xl p-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#00C9A7]/20 border border-[#C13A5A]/30 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8 text-[#C13A5A]" />
            </div>
            <h2 className="text-base font-black text-white">Password Changed Successfully</h2>
            <p className="text-xs text-[#B99BA3] leading-relaxed">Your password has been updated. You can now sign in with your new password.</p>
            <button onClick={() => navigate('/login')} className="w-full nivo-primary rounded-2xl py-3 text-xs font-black mt-2">Return to Login</button>
          </div>
        )}

        {step !== 'success' && (
          <button onClick={() => { setError(null); if (step === 'email') navigate('/login'); else setStep(step === 'otp' ? 'email' : 'otp'); }} className="mt-6 mx-auto flex items-center gap-1.5 text-xs text-[#B99BA3] hover:text-white transition-colors font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{step === 'email' ? 'Back to Sign In' : 'Back'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
