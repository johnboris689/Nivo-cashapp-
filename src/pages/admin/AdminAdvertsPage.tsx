import React, { useState } from 'react';
import AdminAdvertManagement from '../../components/AdminAdvertManagement';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const AdminAdvertsPage: React.FC = () => {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md border ${
              toast.type === 'success'
                ? 'bg-emerald-500/90 text-white border-emerald-400/40'
                : toast.type === 'error'
                ? 'bg-rose-500/90 text-white border-rose-400/40'
                : 'bg-indigo-500/90 text-white border-indigo-400/40'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 shrink-0" />
            ) : (
              <Info className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <AdminAdvertManagement
        token={localStorage.getItem('nevo_admin_token') || ''}
        onToast={(msg, type) => showToast(msg, type)}
      />
    </div>
  );
};

export default AdminAdvertsPage;
