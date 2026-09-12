import React, { useState, useMemo, useEffect, useRef } from 'react';
import { SUPPORTED_BANKS } from '../data';
import { getBankLogoInfo } from '../data/bankLogos';
import { Search, X, ChevronDown, Check, Landmark, AlertCircle } from 'lucide-react';

interface BankLogoProps {
  bankName: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BankLogo: React.FC<BankLogoProps> = ({ bankName, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);
  const logoInfo = getBankLogoInfo(bankName);

  const dimensionClasses =
    size === 'sm'
      ? 'w-6 h-6 text-[9px]'
      : size === 'lg'
      ? 'w-10 h-10 text-xs'
      : 'w-8 h-8 text-[10px] sm:text-[11px]';

  if (logoInfo.logoUrl && !imageError) {
    return (
      <div className={`relative shrink-0 rounded-full bg-slate-800 p-0.5 border border-white/15 overflow-hidden flex items-center justify-center ${dimensionClasses} ${className}`}>
        <img
          src={logoInfo.logoUrl}
          alt={bankName}
          className="w-full h-full object-contain rounded-full bg-white p-0.5"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 rounded-full bg-gradient-to-br ${logoInfo.gradient} text-white font-mono font-black shadow-md flex items-center justify-center border border-white/20 ${dimensionClasses} ${className}`}
      title={bankName}
    >
      {logoInfo.initials}
    </div>
  );
};

export interface BankSelectorProps {
  id?: string;
  value: string;
  onChange: (selectedBank: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const BankSelector: React.FC<BankSelectorProps> = ({
  id = 'select-bank',
  value,
  onChange,
  label,
  placeholder = 'Select a bank...',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Alphabetically sorted list of complete SUPPORTED_BANKS
  const sortedBanks = useMemo(() => {
    return [...SUPPORTED_BANKS].sort((a, b) => a.localeCompare(b));
  }, []);

  // Filter banks based on search query (case-insensitive substring match anywhere in bank name)
  const filteredBanks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedBanks;
    return sortedBanks.filter((bank) => bank.toLowerCase().includes(query));
  }, [searchQuery, sortedBanks]);

  // Handle open / close
  const handleOpen = () => {
    if (disabled) return;
    setSearchQuery('');
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleSelectBank = (bankName: string) => {
    onChange(bankName);
    handleClose();
  };

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedBankName = value || '';

  return (
    <div className={`relative w-full ${className}`}>
      {/* Hidden native select to preserve any legacy DOM queries or form bindings */}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        {sortedBanks.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      {/* Main Trigger Button */}
      <button
        type="button"
        id={`${id}-trigger`}
        disabled={disabled}
        onClick={handleOpen}
        className={`w-full text-xs bg-slate-950 border border-white/10 hover:border-white/20 active:border-teal-500/50 rounded-xl px-3.5 py-3 text-white flex items-center justify-between transition-all group cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="flex items-center gap-2.5 truncate pr-2">
          {selectedBankName ? (
            <>
              <BankLogo bankName={selectedBankName} size="sm" />
              <span className="font-semibold text-white text-xs sm:text-sm truncate">
                {selectedBankName}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2 text-slate-400">
              <Landmark className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="text-xs">{placeholder}</span>
            </div>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white transition-transform shrink-0" />
      </button>

      {/* Bank Selection Modal / Overlay Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-[fadeIn_0.15s_ease-out]">
          {/* Backdrop Click */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={handleClose}
            aria-label="Close modal backdrop"
          />

          {/* Modal Card */}
          <div className="relative z-10 w-full max-w-md bg-slate-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden animate-[slideUp_0.2s_ease-out]">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90 sticky top-0 z-20">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-display">Select Bank</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {sortedBanks.length} supported Nigerian banks
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Bank Search Bar */}
            <div className="p-3.5 bg-slate-950/60 border-b border-white/5 sticky top-[65px] z-20">
              <div className="relative flex items-center">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bank..."
                  className="w-full bg-slate-950 border border-white/15 focus:border-teal-400/80 focus:ring-1 focus:ring-teal-400/80 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-400 font-sans transition-all outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer rounded-full hover:bg-white/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Bank List Container */}
            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 custom-scrollbar">
              {filteredBanks.length > 0 ? (
                filteredBanks.map((bankName) => {
                  const isSelected = selectedBankName === bankName;
                  return (
                    <button
                      key={bankName}
                      type="button"
                      onClick={() => handleSelectBank(bankName)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer group ${
                        isSelected
                          ? 'bg-teal-500/15 border border-teal-500/40 text-teal-300 font-bold shadow-sm'
                          : 'hover:bg-white/5 border border-transparent text-slate-200 active:scale-[0.99]'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate pr-2">
                        <BankLogo bankName={bankName} size="md" />
                        <span className="text-xs sm:text-sm font-medium tracking-wide truncate">
                          {bankName}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="h-5 w-5 rounded-full bg-teal-400 text-slate-950 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="py-10 px-4 text-center space-y-3">
                  <div className="h-10 w-10 mx-auto rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-300">No bank found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      No results matching "{searchQuery}"
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono transition-colors cursor-pointer"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-3 bg-slate-950/80 border-t border-white/5 text-[10px] font-mono text-slate-400 text-center flex items-center justify-between px-4">
              <span>Showing {filteredBanks.length} of {sortedBanks.length} banks</span>
              <span className="text-teal-400">Nevo Secured</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
