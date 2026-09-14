import React from 'react';
import { Download, Share2, CheckCircle2, X, ShieldCheck } from 'lucide-react';
import jsPDF from 'jspdf';
import { Transaction } from '../types';
import GlassCard from './GlassCard';
import { formatNaira } from '../utils/formatters';

interface TransactionReceiptProps {
  transaction: Transaction | null;
  onClose: () => void;
  onShare: (summary: string) => void;
  onToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export default function TransactionReceipt({
  transaction,
  onClose,
  onShare,
  onToast
}: TransactionReceiptProps) {
  if (!transaction) return null;

  const getFormattedDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      date: d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isoDate: d.toISOString().split('T')[0]
    };
  };

  const { date, time, isoDate } = getFormattedDate(transaction.date);
  const refNum = transaction.reference || transaction.refNum || transaction.id;
  const newBalanceVal = transaction.newBalance ?? (transaction as any).balanceAfter ?? 0;

  let title = "Transaction Receipt";
  let contentRows: { label: string; value: string; bold?: boolean; highlight?: boolean; selectAll?: boolean }[] = [];

  const type = transaction.type;

  if (type === 'withdraw') {
    title = "Withdrawal Successful";
    contentRows = [
      { label: "Bank", value: transaction.recipientBank || 'PalmPay', bold: true },
      { label: "Account Name", value: transaction.recipientName || 'Pwamunadi Ishaku' },
      { label: "Account Number", value: transaction.recipientAccount || '8960723295' },
      { label: "Amount", value: formatNaira(transaction.amount), bold: true },
      { label: "Transaction Reference", value: refNum, selectAll: true },
      { label: "Date & Time", value: `${date} ${time}` },
      { label: "Remaining Wallet Balance", value: formatNaira(newBalanceVal), highlight: true }
    ];
  } else if (type === 'bank_transfer_direct') {
    title = "Transfer Successful";
    contentRows = [
      { label: "Recipient Bank", value: transaction.recipientBank || 'N/A', bold: true },
      { label: "Recipient Account Number", value: transaction.recipientAccount || 'N/A' },
      { label: "Recipient Name", value: transaction.recipientName || 'N/A' },
      { label: "Amount", value: formatNaira(transaction.amount), bold: true },
      { label: "Transaction Reference", value: refNum, selectAll: true },
      { label: "Date & Time", value: `${date} ${time}` },
      { label: "Remaining Wallet Balance", value: formatNaira(newBalanceVal), highlight: true }
    ];
  } else if (type === 'redeem_airtime') {
    title = "Airtime Purchase Successful";
    contentRows = [
      { label: "Network", value: transaction.recipientBank || transaction.network || 'MTN', bold: true },
      { label: "Phone Number", value: transaction.recipientAccount || transaction.phoneNumber || 'N/A' },
      { label: "Amount", value: formatNaira(transaction.amount), bold: true },
      { label: "Transaction Reference", value: refNum, selectAll: true },
      { label: "Date & Time", value: `${date} ${time}` },
      { label: "Remaining Wallet Balance", value: formatNaira(newBalanceVal), highlight: true }
    ];
  } else if (type === 'redeem_data') {
    let planSize = transaction.dataPlan;
    if (!planSize && transaction.description) {
      const match = transaction.description.match(/Data Purchase of\s+(\S+)/i);
      if (match) planSize = match[1];
    }
    if (!planSize) planSize = "1.5GB";

    title = "Data Purchase Successful";
    contentRows = [
      { label: "Network", value: transaction.recipientBank || transaction.network || 'MTN', bold: true },
      { label: "Phone Number", value: transaction.recipientAccount || transaction.phoneNumber || 'N/A' },
      { label: "Data Plan", value: planSize },
      { label: "Amount", value: formatNaira(transaction.amount), bold: true },
      { label: "Transaction Reference", value: refNum, selectAll: true },
      { label: "Date & Time", value: `${date} ${time}` },
      { label: "Remaining Wallet Balance", value: formatNaira(newBalanceVal), highlight: true }
    ];
  } else {
    title = "Operation Successful";
    contentRows = [
      { label: "Transaction Reference", value: transaction.id, selectAll: true },
      { label: "Date & Time", value: `${date} ${time}` },
      { label: "Type", value: transaction.type.toUpperCase() },
      { label: "Amount", value: formatNaira(transaction.amount), bold: true },
      { label: "Description", value: transaction.description },
      { label: "Remaining Wallet Balance", value: formatNaira(newBalanceVal), highlight: true }
    ];
  }

  const handleDownload = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors
      const primaryDark = [12, 12, 20]; // #0c0c14
      const tealAccent = [45, 212, 191]; // #2dd4bf
      const slateDark = [15, 23, 42]; // #0f172a
      const borderGray = [226, 232, 240]; // #e2e8f0
      const textDark = [30, 41, 59]; // #1e293b
      const textMuted = [100, 116, 139]; // #64748b

      // Header Banner
      doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2]);
      doc.rect(0, 0, 210, 48, 'F');

      // Top Header Accent Bar
      doc.setFillColor(tealAccent[0], tealAccent[1], tealAccent[2]);
      doc.rect(0, 0, 210, 4, 'F');

      // Header Brand Text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text('NEVO DIGITAL BANKING', 20, 22);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(tealAccent[0], tealAccent[1], tealAccent[2]);
      doc.text('Official Settlement Confirmation & Transaction Receipt', 20, 31);

      // Status Badge
      doc.setFillColor(16, 185, 129); // Emerald 500
      doc.roundedRect(150, 18, 40, 10, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text('SUCCESSFUL', 156, 24.5);

      // Amount Display Box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(20, 56, 170, 28, 3, 3, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('TOTAL TRANSACTION SETTLEMENT', 30, 66);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      const amountStr = `NGN ${transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
      doc.text(amountStr, 30, 77);

      // Receipt Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.text(title.toUpperCase(), 20, 96);

      // Items Card Table
      let startY = 104;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(20, startY, 170, (contentRows.length * 12) + 12, 3, 3, 'D');

      let currentY = startY + 10;

      // Table Rows
      contentRows.forEach((row, idx) => {
        // Label
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
        doc.text(row.label, 26, currentY);

        // Value
        doc.setFont('helvetica', row.bold || row.highlight ? 'bold' : 'normal');
        doc.setFontSize(9.5);
        if (row.highlight) {
          doc.setTextColor(13, 148, 136); // Teal 600
        } else {
          doc.setTextColor(textDark[0], textDark[1], textDark[2]);
        }

        // Clean value string for PDF compatibility
        const cleanVal = row.value.replace(/₦/g, 'NGN ');
        doc.text(cleanVal, 184, currentY, { align: 'right' });

        currentY += 12;

        // Row Separator Line
        if (idx < contentRows.length - 1) {
          doc.setDrawColor(241, 245, 249);
          doc.line(26, currentY - 6, 184, currentY - 6);
        }
      });

      // Security / Support Footer Section
      const footerY = currentY + 15;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.roundedRect(20, footerY, 170, 32, 3, 3, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
      doc.text('SECURITY & COMPLIANCE VERIFICATION', 28, footerY + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
      doc.text('• End-to-end encrypted transaction settlement record.', 28, footerY + 17);
      doc.text('• Support: support@nevo.com | Website: www.nevo.com', 28, footerY + 23);

      // Bottom Watermark & Time
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated on ${new Date().toLocaleString()} • Nevo Enterprise Engine`, 105, 280, { align: 'center' });

      // Save PDF file cleanly triggering direct download
      const filename = `${type === 'withdraw' ? 'Withdrawal' : 'Nevo'}-Receipt-${isoDate}.pdf`;
      doc.save(filename);
      onToast(`PDF receipt downloaded: ${filename}`, 'success');
    } catch (err) {
      console.error('PDF Generation Error:', err);
      onToast('Error generating PDF receipt', 'error');
    }
  };

  const handleShareClick = () => {
    const summary = `Nevo Receipt:\n${title}\n` + contentRows.map(row => `${row.label}: ${row.value}`).join('\n');
    onShare(summary);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0c0c14] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl relative animate-[scaleUp_0.25s_ease-out] font-sans">
        
        {/* Receipt Header Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-teal-500 p-6 text-center text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="mx-auto h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <CheckCircle2 className="h-7 w-7 text-teal-300" />
          </div>
          <h4 className="text-sm font-black tracking-widest uppercase font-mono">{title}</h4>
          <p className="text-[10px] text-teal-200 mt-1">Official settlement confirmation</p>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <div className="text-center">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Total Settlement</span>
            <h3 className="text-2xl font-black font-mono text-white mt-1">
              ₦{transaction.amount.toLocaleString()}
            </h3>
            <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block mt-2">
              Status: Successful
            </span>
          </div>

          <GlassCard className="p-4 bg-white/[0.02] border-white/5 space-y-3 font-mono text-[10px] text-slate-300">
            {contentRows.map((row, i) => (
              <div key={i}>
                {row.label === 'New Wallet Balance' || row.label === 'New Balance' || row.label === 'Remaining Wallet Balance' ? (
                  <div className="border-t border-dashed border-white/10 my-2 pt-2 flex justify-between text-xs font-bold text-teal-400">
                    <span>{row.label}</span>
                    <span>{row.value}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center py-0.5">
                    <span className="text-slate-500">{row.label}</span>
                    <span className={`text-white truncate max-w-[200px] ${row.bold ? 'font-bold' : ''} ${row.selectAll ? 'select-all' : ''}`}>
                      {row.value}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </GlassCard>

          <div className="flex gap-2">
            <button
              id="btn-download-pdf-receipt"
              onClick={handleDownload}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-700 hover:to-teal-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="h-3.5 w-3.5" /> Download PDF
            </button>
            <button
              onClick={handleShareClick}
              className="px-4 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              title="Share Receipt Summary"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 justify-center">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-500" /> Fully Encrypted &amp; Verified Settlement Receipt
          </div>
        </div>
      </div>
    </div>
  );
}

