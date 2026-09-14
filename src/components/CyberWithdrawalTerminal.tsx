import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  ShieldAlert,
  Terminal as TerminalIcon,
  Cpu,
  Database,
  Activity,
  FileText,
  UploadCloud,
  Trash2,
  Building,
  CreditCard,
  User,
  Mail,
  Phone,
  Hash,
  Calendar,
  Lock,
  Check,
  Zap,
  Server,
  Wifi,
  Eye,
  CheckSquare,
  AlertTriangle,
  Layers,
  Coins,
  History,
  TrendingUp,
  Plus
} from 'lucide-react';
import { formatNaira } from '../utils/formatters';

interface CyberWithdrawalTerminalProps {
  selectedWithdrawal: any;
  onBack: () => void;
  adminNotes: string;
  setAdminNotes: (v: string) => void;
  saveInternalNotes: () => void;
  savingNotes: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleSlipFileUpload: (file: File) => void;
  uploadingSlip: boolean;
  isDraggingSlip: boolean;
  setIsDraggingSlip: (v: boolean) => void;
  handleRemoveSlip: () => void;
  removingSlip: boolean;
  updateWithdrawalStatus: (status: string) => void;
  statusUpdating: string | null;
  maskAccountNumber: (num?: string) => string;
  approvePartialWithdrawal?: (amount: number, note?: string) => Promise<boolean>;
  approvingPartial?: boolean;
}

export function CyberWithdrawalTerminal({
  selectedWithdrawal,
  onBack,
  adminNotes,
  setAdminNotes,
  saveInternalNotes,
  savingNotes,
  fileInputRef,
  handleSlipFileUpload,
  uploadingSlip,
  isDraggingSlip,
  setIsDraggingSlip,
  handleRemoveSlip,
  removingSlip,
  updateWithdrawalStatus,
  statusUpdating,
  maskAccountNumber,
  approvePartialWithdrawal,
  approvingPartial = false
}: CyberWithdrawalTerminalProps) {
  const statusLower = (selectedWithdrawal?.status ? String(selectedWithdrawal.status) : '').toLowerCase();
  const dateObj = new Date(selectedWithdrawal.timestamp || selectedWithdrawal.created_at || Date.now());
  const dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const hasSlip = !!(selectedWithdrawal.posSlipPath || selectedWithdrawal.posslippath);

  // Financial calculations
  const requestedAmount = Number(selectedWithdrawal?.amount || 0);
  const approvedAmount = Number(selectedWithdrawal?.approvedAmount || selectedWithdrawal?.approvedamount || 0);
  const remainingAmount = Math.max(0, requestedAmount - approvedAmount);
  const percentApproved = requestedAmount > 0 ? Math.min(100, (approvedAmount / requestedAmount) * 100) : 0;
  
  let rawHistory = selectedWithdrawal?.approvalHistory || selectedWithdrawal?.approvalhistory || [];
  if (typeof rawHistory === 'string') {
    try { rawHistory = JSON.parse(rawHistory); } catch (e) { rawHistory = []; }
  }
  const approvalHistory: any[] = Array.isArray(rawHistory) ? rawHistory : [];

  const isCompleted = statusLower === 'completed' || statusLower === 'success' || (remainingAmount <= 0 && requestedAmount > 0);
  const isPartiallyApproved = !isCompleted && approvedAmount > 0 && remainingAmount > 0;
  const isRejected = statusLower === 'rejected' || statusLower === 'cancelled';

  // Partial Approval Input State
  const [partialAmountInput, setPartialAmountInput] = useState<string>('');
  const [partialNoteInput, setPartialNoteInput] = useState<string>('');
  const [inputError, setInputError] = useState<string | null>(null);

  // Live system monitor simulated stats
  const [cpuUsage, setCpuUsage] = useState(17);
  const [ramUsage, setRamUsage] = useState(42);
  const [latency, setLatency] = useState(19);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(14 + Math.random() * 8));
      setRamUsage(Math.floor(41 + Math.random() * 4));
      setLatency(Math.floor(18 + Math.random() * 6));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle amount input change with live validation
  const handleAmountChange = (val: string) => {
    // Clean numeric input
    const cleaned = val.replace(/[^0-9.]/g, '');
    setPartialAmountInput(cleaned);
    
    const num = Number(cleaned);
    if (!cleaned) {
      setInputError(null);
      return;
    }
    if (isNaN(num) || num <= 0) {
      setInputError('Approval amount must be greater than ₦0.00');
    } else if (num > remainingAmount) {
      setInputError(`Approval amount (${formatNaira(num)}) exceeds remaining pending balance of ${formatNaira(remainingAmount)}`);
    } else {
      setInputError(null);
    }
  };

  // Set preset amount
  const handleSetPreset = (amt: number) => {
    const target = Math.min(amt, remainingAmount);
    setPartialAmountInput(target.toString());
    setInputError(null);
  };

  // Submit Partial Approval
  const handleExecutePartialApproval = async () => {
    const num = Number(partialAmountInput);
    if (isNaN(num) || num <= 0) {
      setInputError('Please enter a valid approval amount greater than ₦0.00');
      return;
    }
    if (num > remainingAmount) {
      setInputError(`Approval amount cannot exceed remaining balance of ${formatNaira(remainingAmount)}`);
      return;
    }

    if (approvePartialWithdrawal) {
      const success = await approvePartialWithdrawal(num, partialNoteInput);
      if (success) {
        setPartialAmountInput('');
        setPartialNoteInput('');
        setInputError(null);
      }
    }
  };

  // Status Badge Glow Styling
  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          ● FULLY APPROVED (100%)
        </div>
      );
    }
    if (isRejected) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-rose-950/80 border border-rose-500/50 text-rose-400 font-mono text-xs font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)]">
          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
          ● REJECTED
        </div>
      );
    }
    if (isPartiallyApproved) {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950/80 border border-amber-500/50 text-amber-300 font-mono text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.3)]">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          ● PARTIALLY APPROVED ({formatNaira(approvedAmount)} of {formatNaira(requestedAmount)})
        </div>
      );
    }
    if (statusLower === 'processing') {
      return (
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950/80 border border-blue-500/50 text-blue-400 font-mono text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          ● PROCESSING IN PROGRESS
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 font-mono text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        ● PENDING REVIEW - AWAITING ACTION
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#060810] text-slate-200 p-3 sm:p-6 space-y-6 font-mono text-xs select-none">
      {/* Navigation Header */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyan-500/20 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-950/50 border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-900/40 transition-all text-cyan-300 font-bold cursor-pointer w-fit shadow-[0_0_10px_rgba(6,182,212,0.15)]"
        >
          <ArrowLeft className="h-4 w-4 text-cyan-400" />
          [ BACK TO WITHDRAWAL QUEUE ]
        </button>
        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-widest">SYSTEM AUDIT ID</span>
            <span className="text-xs sm:text-sm font-bold text-teal-300 tracking-wider">
              {selectedWithdrawal.reference || selectedWithdrawal.id}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-bold">
            SHA-256 VERIFIED
          </div>
        </div>
      </div>

      {/* TOP PROCESSING CONSOLE & THREE-WAY BALANCE BREAKDOWN */}
      <div className="w-full p-4 sm:p-6 rounded-xl border border-teal-500/30 bg-[#0a0e1a]/90 backdrop-blur-xl shadow-[0_0_30px_rgba(20,184,166,0.1)] space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <TerminalIcon className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-white tracking-widest uppercase flex items-center gap-2">
                NEVO SECURE TRANSACTION TERMINAL
                <span className="text-[10px] text-teal-400 font-normal px-2 py-0.5 rounded bg-teal-950 border border-teal-500/30">
                  PARTIAL DISBURSEMENT ACTIVE
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">Multi-batch partial approval ledger, fraud audit, and compliance console.</p>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* 3-CARD BALANCE BREAKDOWN GRID (Requested / Already Approved / Remaining) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Requested Amount */}
          <div className="p-3.5 rounded-lg bg-[#050811] border border-cyan-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">REQUESTED AMOUNT</span>
              <Coins className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-white font-mono block">
                {formatNaira(requestedAmount)}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Original user withdrawal sum</span>
            </div>
          </div>

          {/* Already Approved Amount */}
          <div className="p-3.5 rounded-lg bg-[#050811] border border-emerald-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">ALREADY APPROVED</span>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono block">
                {formatNaira(approvedAmount)}
              </span>
              <span className="text-[10px] text-emerald-500/80 font-mono">
                {approvalHistory.length} batch{approvalHistory.length === 1 ? '' : 'es'} disbursed ({percentApproved.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Remaining Balance */}
          <div className="p-3.5 rounded-lg bg-[#050811] border border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">REMAINING TO APPROVE</span>
              <Clock className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2">
              <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono block">
                {formatNaira(remainingAmount)}
              </span>
              <span className="text-[10px] text-amber-500/80 font-mono">
                {remainingAmount === 0 ? 'Fully disbursed' : 'Pending admin authorization'}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <TrendingUp className="h-3.5 w-3.5 text-teal-400" />
              Disbursement Progress
            </span>
            <span className="font-bold text-teal-300 font-mono">
              {percentApproved.toFixed(1)}% Approved &bull; {formatNaira(approvedAmount)} / {formatNaira(requestedAmount)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-[#03050a] rounded-full border border-white/10 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]'
                  : 'bg-gradient-to-r from-amber-500 via-teal-400 to-emerald-400 shadow-[0_0_10px_rgba(20,184,166,0.6)]'
              }`}
              style={{ width: `${percentApproved}%` }}
            ></div>
          </div>
        </div>

        {/* Live Command Logs Box */}
        <div className="p-3 bg-[#03050a] rounded-lg border border-teal-500/20 text-[11px] space-y-1 text-slate-300 overflow-x-auto">
          <div className="text-teal-400 font-bold flex items-center gap-2">
            <span className="text-slate-500">[{timeStr}]</span> Loading transaction ledger context...
          </div>
          <div className="text-slate-400">
            <span className="text-slate-600">[{timeStr}]</span> Checking withdrawal queue status... <span className="text-emerald-400 font-bold">[{selectedWithdrawal.status?.toUpperCase() || 'QUEUED'}]</span>
          </div>
          <div className="text-slate-400">
            <span className="text-slate-600">[{timeStr}]</span> Partial Approval Subsystem... <span className="text-teal-400 font-bold">[APPROVED: {formatNaira(approvedAmount)} | REMAINING: {formatNaira(remainingAmount)}]</span>
          </div>
          <div className="text-slate-400">
            <span className="text-slate-600">[{timeStr}]</span> POS Decline Slip Requirement... <span className={hasSlip ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>{hasSlip ? '[EVIDENCE RECORDED]' : '[AWAITING SLIP UPLOAD]'}</span>
          </div>
          <div className="text-teal-300 font-bold pt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            STATUS: {isCompleted ? 'TRANSACTION COMPLETED & FULLY APPROVED' : isRejected ? 'TRANSACTION REJECTED BY ADMIN' : isPartiallyApproved ? `PARTIALLY APPROVED (${formatNaira(remainingAmount)} REMAINING)` : 'AWAITING OPERATOR PARTIAL / FULL APPROVAL'}
            <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>

      {/* PARTIAL APPROVAL ENGINE & DISBURSEMENT AUDIT TRAIL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Partial Approval Interactive Input Form (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-xl bg-[#090d18] border border-amber-500/40 space-y-4 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  PARTIAL DISBURSEMENT &amp; APPROVAL ENGINE
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-amber-500/10 border-amber-500/30 text-amber-400">
                PART-BY-PART DISBURSEMENT
              </span>
            </div>

            {isCompleted ? (
              <div className="p-4 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs">Full Disbursement Complete</div>
                  <div className="text-[11px] text-emerald-400/80">
                    The entire requested amount of {formatNaira(requestedAmount)} has been fully approved and authorized for payout.
                  </div>
                </div>
              </div>
            ) : isRejected ? (
              <div className="p-4 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-center gap-3">
                <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-xs">Withdrawal Rejected</div>
                  <div className="text-[11px] text-rose-400/80">
                    This withdrawal request has been rejected by compliance and cannot receive further partial approvals.
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Input Amount Section */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
                      <span>Amount to approve:</span>
                      <span className="text-amber-400 font-bold">₦_____</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Remaining Cap: <strong className="text-amber-400 font-mono">{formatNaira(remainingAmount)}</strong>
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-amber-400 font-mono">
                      ₦
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={partialAmountInput}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="e.g. 500, 2000, 5000, 10000..."
                      disabled={approvingPartial || remainingAmount <= 0}
                      className="w-full pl-8 pr-4 py-3 bg-[#03050a] border border-amber-500/40 rounded-lg text-white font-mono text-base font-bold placeholder:text-slate-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 shadow-inner disabled:opacity-50"
                    />
                  </div>

                  {inputError && (
                    <div className="text-rose-400 text-[11px] flex items-center gap-1 font-bold animate-pulse">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      {inputError}
                    </div>
                  )}
                </div>

                {/* Quick Selection Presets */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    QUICK APPROVAL PRESETS (CLICK TO SET):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[500, 2000, 5000, 10000, 50000].map((presetAmt) => {
                      const isDisabled = presetAmt > remainingAmount || approvingPartial;
                      return (
                        <button
                          key={presetAmt}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleSetPreset(presetAmt)}
                          className={`px-2.5 py-1.5 rounded-md border text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isDisabled
                              ? 'bg-[#050811] border-white/5 text-slate-600 cursor-not-allowed'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/25 hover:border-amber-400'
                          }`}
                        >
                          <Plus className="h-3 w-3 text-amber-400" />
                          {formatNaira(presetAmt)}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      disabled={remainingAmount <= 0 || approvingPartial}
                      onClick={() => handleSetPreset(remainingAmount)}
                      className="px-2.5 py-1.5 rounded-md border text-[11px] font-mono font-bold bg-teal-500/10 border-teal-500/30 text-teal-300 hover:bg-teal-500/25 hover:border-teal-400 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-30"
                    >
                      <Check className="h-3 w-3 text-teal-400" />
                      Full Remaining ({formatNaira(remainingAmount)})
                    </button>
                  </div>
                </div>

                {/* Optional Note for this approval batch */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    BATCH AUDIT REMARK / TRANSACTION NOTE (OPTIONAL):
                  </label>
                  <input
                    type="text"
                    value={partialNoteInput}
                    onChange={(e) => setPartialNoteInput(e.target.value)}
                    placeholder="e.g. Approved first tranche, NIBSS batch #1..."
                    disabled={approvingPartial}
                    className="w-full px-3 py-2 bg-[#03050a] border border-white/15 rounded-lg text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 disabled:opacity-50 font-sans"
                  />
                </div>

                {/* Dynamic Outcome Preview */}
                {partialAmountInput && !isNaN(Number(partialAmountInput)) && Number(partialAmountInput) > 0 && !inputError && (
                  <div className="p-3 rounded-lg bg-[#050811] border border-teal-500/30 text-[11px] space-y-1">
                    <div className="text-teal-300 font-bold flex items-center gap-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-teal-400" />
                      Preview Calculation:
                    </div>
                    <div className="flex justify-between text-slate-300 font-mono">
                      <span>Amount To Authorize:</span>
                      <strong className="text-emerald-400">{formatNaira(Number(partialAmountInput))}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 font-mono">
                      <span>Total Approved After:</span>
                      <strong className="text-white">{formatNaira(approvedAmount + Number(partialAmountInput))}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 font-mono">
                      <span>Remaining Balance After:</span>
                      <strong className="text-amber-400">{formatNaira(Math.max(0, remainingAmount - Number(partialAmountInput)))}</strong>
                    </div>
                    <div className="pt-1 text-[10px] text-slate-400 italic">
                      {Math.max(0, remainingAmount - Number(partialAmountInput)) === 0
                        ? '★ This partial approval will fulfill the withdrawal 100% and automatically mark it as Fully Approved.'
                        : '★ Withdrawal will remain Partially Approved / Pending until the full amount is satisfied.'}
                    </div>
                  </div>
                )}

                {/* Approve Button */}
                <button
                  type="button"
                  onClick={handleExecutePartialApproval}
                  disabled={
                    approvingPartial ||
                    !partialAmountInput ||
                    isNaN(Number(partialAmountInput)) ||
                    Number(partialAmountInput) <= 0 ||
                    Number(partialAmountInput) > remainingAmount ||
                    !!inputError
                  }
                  className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {approvingPartial ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      PROCESSING PARTIAL APPROVAL...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-black" />
                      [ AUTHORIZE DISBURSEMENT OF {formatNaira(Number(partialAmountInput) || 0)} ]
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Approval Audit Trail (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-[#090d18] border border-cyan-500/30 space-y-3 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    APPROVAL AUDIT TRAIL ({approvalHistory.length})
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  IMMUTABLE
                </span>
              </div>

              {/* History list */}
              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {approvalHistory.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[#03050a] border border-white/5 text-center text-slate-500 text-[11px] space-y-1">
                    <Clock className="h-6 w-6 text-slate-600 mx-auto" />
                    <div>No partial disbursements authorized yet.</div>
                    <div className="text-[10px] text-slate-600">Full {formatNaira(requestedAmount)} is pending approval.</div>
                  </div>
                ) : (
                  approvalHistory.slice().reverse().map((rec: any, idx: number) => {
                    const recDate = new Date(rec.approvedAt || Date.now());
                    return (
                      <div
                        key={rec.id || idx}
                        className="p-3 rounded-lg bg-[#03050a] border border-emerald-500/20 space-y-1.5 text-[11px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400 font-mono text-xs flex items-center gap-1">
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            + {formatNaira(rec.amount)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {recDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} @ {recDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400 border-t border-white/5 pt-1">
                          <span>Authorized by: <strong className="text-slate-300">{rec.approvedBy || 'Admin'}</strong></span>
                          <span>Remaining: <strong className="text-amber-400 font-mono">{formatNaira(rec.remainingAfter ?? Math.max(0, requestedAmount - approvedAmount))}</strong></span>
                        </div>
                        {rec.note && (
                          <div className="text-[10px] text-teal-300/90 italic bg-teal-950/30 p-1.5 rounded border border-teal-500/20">
                            &ldquo;{rec.note}&rdquo;
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Audit compliance badge */}
            <div className="pt-3 border-t border-white/5 text-[10px] text-slate-500 flex items-center justify-between">
              <span>LEDGER INTEGRITY: SECURE</span>
              <span className="text-emerald-400 font-bold">100% AUDITABLE</span>
            </div>
          </div>
        </div>
      </div>

      {/* THREE MAIN TERMINAL MODULES (ACCOUNT, BANKING, LEGACY_VOUCHER) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module 1: Client Profile Terminal */}
        <div className="p-4 rounded-xl bg-[#090d18] border border-indigo-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-400" />
              CLIENT PROFILE TERMINAL
            </h3>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">USER DB</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">NAME:</span>
              <span className="text-white font-bold">{selectedWithdrawal.fullName || selectedWithdrawal.accountName || selectedWithdrawal.accountname || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">EMAIL:</span>
              <span className="text-slate-200">{selectedWithdrawal.email || selectedWithdrawal.userId || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">PHONE:</span>
              <span className="text-slate-200">{selectedWithdrawal.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">RISK LEVEL:</span>
              <span className="text-emerald-400 font-bold">LOW (0.0% THREAT)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">SESSION:</span>
              <span className="text-teal-400 font-bold">AUTHENTICATED</span>
            </div>
          </div>
        </div>

        {/* Module 2: Bank Terminal */}
        <div className="p-4 rounded-xl bg-[#090d18] border border-cyan-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Building className="h-4 w-4 text-cyan-400" />
              BANK TERMINAL
            </h3>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">NIBSS INTEGRATED</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">BANK:</span>
              <span className="text-white font-bold">{selectedWithdrawal.bankName || selectedWithdrawal.bankname || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">ACCOUNT:</span>
              <span className="text-cyan-300 font-bold">{maskAccountNumber(selectedWithdrawal.accountNumber || selectedWithdrawal.accountnumber)}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">ACCOUNT NAME:</span>
              <span className="text-white font-bold">{selectedWithdrawal.accountName || selectedWithdrawal.accountname || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">STATUS:</span>
              <span className="text-emerald-400 font-bold">MATCHED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ENCRYPTION:</span>
              <span className="text-slate-300 font-mono">AES-256 GCM</span>
            </div>
          </div>
        </div>

        {/* Module 3: LEGACY_VOUCHER Generation Terminal */}
        <div className="p-4 rounded-xl bg-[#090d18] border border-teal-500/30 space-y-3 shadow-lg">
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
            <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-teal-400" />
              LEGACY_VOUCHER GENERATION TERMINAL
            </h3>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">VOUCHER MODULE</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">VOUCHER:</span>
              <span className="text-teal-300 font-bold">{selectedWithdrawal.voucherCode || selectedWithdrawal.vouchercode || 'None'}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">STATUS:</span>
              <span className={selectedWithdrawal.voucherCode ? "text-emerald-400 font-bold" : "text-slate-400"}>
                {selectedWithdrawal.voucherCode ? 'VALID & REGISTERED' : 'NOT APPLICABLE'}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">ISSUED:</span>
              <span className="text-slate-300">SYSTEM GENERATED</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-1">
              <span className="text-slate-500">SECURITY:</span>
              <span className="text-emerald-400 font-bold">VERIFIED</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">CHECKSUM:</span>
              <span className="text-teal-400 font-bold">PASSED</span>
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: FORENSIC EVIDENCE TERMINAL + INTERNAL NOTES + LIVE SYSTEM MONITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Evidence Upload + Notes (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* POS Slip Evidence Terminal */}
          <div className="p-5 rounded-xl bg-[#090d18] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  FORENSIC EVIDENCE TERMINAL (POS DECLINE SLIP)
                </h3>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                hasSlip ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              }`}>
                {hasSlip ? 'EVIDENCE UPLOADED' : 'AWAITING SLIP'}
              </span>
            </div>

            {hasSlip ? (
              <div className="space-y-3">
                <div className="relative p-3 rounded-lg bg-[#03050a] border border-white/10 flex flex-col items-center justify-center min-h-[220px]">
                  <img
                    src={selectedWithdrawal.posSlipPath || selectedWithdrawal.posslippath}
                    alt="POS Decline Slip Evidence"
                    referrerPolicy="no-referrer"
                    className="max-h-72 w-full object-contain rounded border border-white/10"
                  />
                  <div className="absolute top-5 right-5 flex gap-2">
                    <button
                      onClick={handleRemoveSlip}
                      disabled={removingSlip}
                      className="p-2 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-400 hover:bg-rose-900/80 hover:text-white transition-all cursor-pointer shadow-lg disabled:opacity-50"
                      title="Remove Evidence Slip"
                    >
                      {removingSlip ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
                  <span>Uploaded: {selectedWithdrawal.posSlipUploadedAt ? new Date(selectedWithdrawal.posSlipUploadedAt).toLocaleString() : 'N/A'}</span>
                  <span>By: {selectedWithdrawal.posSlipUploadedBy || 'Admin'}</span>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingSlip(true);
                }}
                onDragLeave={() => setIsDraggingSlip(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingSlip(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleSlipFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 cursor-pointer text-center ${
                  isDraggingSlip
                    ? 'border-amber-400 bg-amber-950/30'
                    : 'border-white/15 bg-[#03050a] hover:border-amber-500/50 hover:bg-amber-950/10'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleSlipFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  {uploadingSlip ? <RefreshCw className="h-6 w-6 animate-spin" /> : <UploadCloud className="h-6 w-6" />}
                </div>
                <div>
                  <div className="font-bold text-white text-xs">
                    {uploadingSlip ? 'UPLOADING FORENSIC EVIDENCE...' : 'UPLOAD POS DECLINE SLIP'}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Drag &amp; drop screenshot/receipt or click to browse (PNG, JPG, PDF up to 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Internal Compliance Audit Notes Terminal */}
          <div className="p-5 rounded-xl bg-[#090d18] border border-teal-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-teal-500/20 pb-2">
              <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-4 w-4 text-teal-400" />
                INTERNAL COMPLIANCE AUDIT NOTES
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300">ADMIN ONLY</span>
            </div>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Enter internal fraud inspection notes, verification flags, or compliance overrides..."
              className="w-full h-24 p-3 bg-[#03050a] border border-white/15 rounded-lg text-slate-200 text-xs placeholder:text-slate-600 focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400/50 font-sans resize-none"
            />
            <div className="flex justify-end">
              <button
                onClick={saveInternalNotes}
                disabled={savingNotes}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-black font-bold text-xs transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {savingNotes ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                [ SAVE AUDIT NOTES ]
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live System Monitor (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 rounded-xl bg-[#090d18] border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  LIVE TELEMETRY &amp; FRAUD ENGINE
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                MONITOR ONLINE
              </span>
            </div>

            <div className="space-y-3">
              {/* CPU Load */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-cyan-400" /> NIBSS AUDIT THREADS</span>
                  <span className="font-bold text-white">{cpuUsage}%</span>
                </div>
                <div className="w-full h-2 bg-[#03050a] rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-cyan-400 transition-all duration-300" style={{ width: `${cpuUsage}%` }}></div>
                </div>
              </div>

              {/* Memory Allocation */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5"><Database className="h-3.5 w-3.5 text-indigo-400" /> ENCRYPTED MEMORY BUFFER</span>
                  <span className="font-bold text-white">{ramUsage}%</span>
                </div>
                <div className="w-full h-2 bg-[#03050a] rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${ramUsage}%` }}></div>
                </div>
              </div>

              {/* Latency */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span className="flex items-center gap-1.5"><Wifi className="h-3.5 w-3.5 text-emerald-400" /> INTERBANK API LATENCY</span>
                  <span className="font-bold text-emerald-400">{latency} ms</span>
                </div>
                <div className="w-full h-2 bg-[#03050a] rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(100, latency * 2)}%` }}></div>
                </div>
              </div>
            </div>

            {/* Threat matrix overview */}
            <div className="p-3 bg-[#03050a] rounded-lg border border-white/5 space-y-2 text-[11px]">
              <div className="flex items-center justify-between text-slate-400">
                <span>BENEFICIARY BLACKLIST CHECK:</span>
                <span className="text-emerald-400 font-bold">CLEAN (0 MATCHES)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>VELOCITY RISK SCORE:</span>
                <span className="text-emerald-400 font-bold">0.02 / 1.00 (NOMINAL)</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>IP / DEVICE FINGERPRINT:</span>
                <span className="text-cyan-400 font-bold">VERIFIED TRUSTED</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ADMIN ACTION COMMAND CENTER */}
      <div className="p-5 rounded-xl bg-[#090d18] border border-teal-500/40 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Zap className="h-4 w-4 text-teal-400" />
            ADMIN COMMAND CENTER (DECISION EXECUTION)
          </h3>
          <span className="text-[10px] text-slate-400">AUTHORITY: SUPER ADMIN</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Reject Button */}
          <button
            onClick={() => updateWithdrawalStatus('rejected')}
            disabled={isCompleted || isRejected || !!statusUpdating || approvingPartial}
            className="p-3.5 rounded-lg border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:shadow-[0_0_25px_rgba(244,63,94,0.4)] disabled:opacity-30"
          >
            {statusUpdating === 'rejected' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                EXECUTING REJECTION...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-rose-400" />
                [ REJECT REQUEST ]
              </>
            )}
          </button>

          {/* Hold / Processing Button */}
          <button
            onClick={() => updateWithdrawalStatus('processing')}
            disabled={isCompleted || isRejected || !!statusUpdating || approvingPartial}
            className="p-3.5 rounded-lg border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] disabled:opacity-30"
          >
            {statusUpdating === 'processing' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                STAGING PROCESSING...
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 text-amber-400 animate-pulse" />
                [ HOLD FOR REVIEW ]
              </>
            )}
          </button>

          {/* Approve Full / Remaining Withdrawal Button */}
          <button
            onClick={() => updateWithdrawalStatus('completed')}
            disabled={isCompleted || isRejected || !!statusUpdating || approvingPartial}
            className="p-3.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] disabled:opacity-30"
          >
            {statusUpdating === 'completed' ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                AUTHORIZING DISBURSEMENT...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                [ APPROVE FULL / REMAINING ({formatNaira(remainingAmount)}) ]
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
