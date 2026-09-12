import React from 'react';
import { Delete, Fingerprint } from 'lucide-react';

interface NumericPadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onBiometricClick?: () => void;
  showBiometric?: boolean;
}

export default function NumericPad({
  onKeyPress,
  onBackspace,
  onBiometricClick,
  showBiometric = true
}: NumericPadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="grid grid-cols-3 gap-y-4 gap-x-6 w-full max-w-xs mx-auto mt-6">
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onClick={() => onKeyPress(key)}
          className="h-16 w-16 mx-auto rounded-full bg-white/10 hover:bg-white/20 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 active:scale-95 text-xl font-semibold text-slate-800 dark:text-white flex items-center justify-center transition-all duration-150 border border-white/5 shadow-sm"
        >
          {key}
        </button>
      ))}

      {/* Action column bottom left */}
      {showBiometric && onBiometricClick ? (
        <button
          type="button"
          onClick={onBiometricClick}
          className="h-16 w-16 mx-auto rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 active:scale-95 flex items-center justify-center transition-all duration-150 border border-indigo-500/20 shadow-sm"
          title="Fingerprint scanner"
        >
          <Fingerprint className="h-8 w-8" />
        </button>
      ) : (
        <div className="h-16 w-16" />
      )}

      {/* Zero */}
      <button
        type="button"
        onClick={() => onKeyPress('0')}
        className="h-16 w-16 mx-auto rounded-full bg-white/10 hover:bg-white/20 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 active:scale-95 text-xl font-semibold text-slate-800 dark:text-white flex items-center justify-center transition-all duration-150 border border-white/5 shadow-sm"
      >
        0
      </button>

      {/* Backspace */}
      <button
        type="button"
        onClick={onBackspace}
        className="h-16 w-16 mx-auto rounded-full bg-white/10 hover:bg-white/20 dark:bg-slate-800/50 dark:hover:bg-slate-800/80 active:scale-95 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-all duration-150 border border-white/5 shadow-sm"
      >
        <Delete className="h-6 w-6" />
      </button>
    </div>
  );
}
