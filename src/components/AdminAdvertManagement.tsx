import React, { useState, useEffect, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  Eye,
  MousePointerClick,
  Gift,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  X,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { AdminAdvert } from '../types';
import { api } from '../lib/api';
import GlassCard from './GlassCard';

interface AdminAdvertManagementProps {
  token?: string;
  onToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const PRESET_BANNERS = [
  { label: 'Fintech / Banking', url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80' },
  { label: 'Payments & Rewards', url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80' },
  { label: 'E-Commerce / Shopping', url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=600&auto=format&fit=crop&q=80' },
  { label: 'Telecom & Data', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80' },
  { label: 'Savings & Investment', url: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=80' },
  { label: 'Technology / Apps', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80' },
];

export const AdminAdvertManagement: React.FC<AdminAdvertManagementProps> = ({ onToast }) => {
  const [adverts, setAdverts] = useState<AdminAdvert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAdvert, setEditingAdvert] = useState<AdminAdvert | null>(null);
  const [deletingAdvert, setDeletingAdvert] = useState<AdminAdvert | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form inputs
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destinationUrl: '',
    rewardAmount: '200',
    bannerUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
    category: 'Fintech',
    isActive: true
  });

  const fetchAdverts = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAdverts();
      setAdverts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to load adverts:', err);
      onToast?.(err.message || 'Failed to load advert campaigns.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdverts();
  }, []);

  const openCreateModal = () => {
    setEditingAdvert(null);
    setFormData({
      title: '',
      description: '',
      destinationUrl: 'https://',
      rewardAmount: '200',
      bannerUrl: PRESET_BANNERS[0].url,
      category: 'Fintech',
      isActive: true
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (ad: AdminAdvert) => {
    setEditingAdvert(ad);
    setFormData({
      title: ad.title || '',
      description: ad.description || '',
      destinationUrl: ad.destinationUrl || 'https://',
      rewardAmount: String(ad.rewardAmount || 200),
      bannerUrl: ad.bannerUrl || PRESET_BANNERS[0].url,
      category: ad.category || 'Fintech',
      isActive: ad.isActive !== false
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveAdvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      onToast?.('Please enter an advert title.', 'error');
      return;
    }
    if (!formData.destinationUrl.trim() || formData.destinationUrl === 'https://') {
      onToast?.('Please enter a valid destination URL.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let finalUrl = formData.destinationUrl.trim();
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        destinationUrl: finalUrl,
        rewardAmount: Math.max(0, Number(formData.rewardAmount) || 0),
        bannerUrl: formData.bannerUrl.trim() || PRESET_BANNERS[0].url,
        category: formData.category.trim() || 'General',
        isActive: formData.isActive
      };

      if (editingAdvert) {
        await api.updateAdminAdvert(editingAdvert.id, payload);
        onToast?.(`Campaign "${payload.title}" updated successfully.`, 'success');
      } else {
        await api.createAdminAdvert(payload);
        onToast?.(`New advert "${payload.title}" launched successfully!`, 'success');
      }

      setIsCreateModalOpen(false);
      setEditingAdvert(null);
      await fetchAdverts();
    } catch (err: any) {
      console.error('Failed to save advert:', err);
      onToast?.(err.message || 'Failed to save advert campaign.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (ad: AdminAdvert) => {
    const nextStatus = !ad.isActive;
    try {
      await api.toggleAdvertStatus(ad.id, nextStatus);
      onToast?.(`Advert "${ad.title}" ${nextStatus ? 'activated' : 'paused'}.`, 'success');
      setAdverts(prev =>
        prev.map(item => (item.id === ad.id ? { ...item, isActive: nextStatus } : item))
      );
    } catch (err: any) {
      console.error('Failed to toggle advert status:', err);
      onToast?.(err.message || 'Failed to update advert status.', 'error');
    }
  };

  const handleDeleteAdvert = async () => {
    if (!deletingAdvert) return;
    setSubmitting(true);
    try {
      await api.deleteAdminAdvert(deletingAdvert.id);
      onToast?.(`Advert "${deletingAdvert.title}" permanently removed.`, 'success');
      setAdverts(prev => prev.filter(item => item.id !== deletingAdvert.id));
      setDeletingAdvert(null);
    } catch (err: any) {
      console.error('Failed to delete advert:', err);
      onToast?.(err.message || 'Failed to delete advert campaign.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    adverts.forEach(a => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [adverts]);

  // Filtered adverts
  const filteredAdverts = useMemo(() => {
    return adverts.filter(ad => {
      const matchSearch =
        ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ad.description && ad.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ad.destinationUrl.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
          ? ad.isActive !== false
          : ad.isActive === false;

      const matchCategory =
        categoryFilter === 'all' || ad.category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchSearch && matchStatus && matchCategory;
    });
  }, [adverts, searchTerm, statusFilter, categoryFilter]);

  // Key metrics
  const totalCampaigns = adverts.length;
  const activeCampaigns = adverts.filter(a => a.isActive !== false).length;
  const pausedCampaigns = totalCampaigns - activeCampaigns;
  const totalClicks = adverts.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const totalImpressions = adverts.reduce((acc, curr) => acc + (curr.impressions || 0), 0);
  const totalRewardsDistributed = adverts.reduce((acc, curr) => acc + ((curr.clicks || 0) * (curr.rewardAmount || 200)), 0);

  return (
    <div id="admin-adverts-management" className="space-y-6 animate-fade-in pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-[#8F1D3A] to-[#C13A5A] text-white">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Advert Campaign Management</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage sponsored advertisements, track clicks &amp; impressions, and configure user cash rewards
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="refresh-adverts-btn"
            onClick={fetchAdverts}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all cursor-pointer"
            title="Refresh adverts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-teal-400' : ''}`} />
          </button>
          <button
            id="create-advert-modal-trigger"
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#8F1D3A] to-[#C13A5A] hover:opacity-90 text-white text-xs font-black shadow-lg shadow-[#8F1D3A]/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <GlassCard className="p-4 border-white/5 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Campaigns</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">{totalCampaigns}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Total Advert Placements</div>
        </GlassCard>

        <GlassCard className="p-4 border-white/5 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Active</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{activeCampaigns}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Live &amp; Earning</div>
        </GlassCard>

        <GlassCard className="p-4 border-white/5 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Paused</span>
            <XCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">{pausedCampaigns}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Inactive Campaigns</div>
        </GlassCard>

        <GlassCard className="p-4 border-white/5 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Clicks</span>
            <MousePointerClick className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400 font-mono mt-1">{totalClicks.toLocaleString()}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">User Redirects</div>
        </GlassCard>

        <GlassCard className="p-4 border-white/5 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Impressions</span>
            <Eye className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400 font-mono mt-1">{totalImpressions.toLocaleString()}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Ad Views Completed</div>
        </GlassCard>

        <GlassCard className="p-4 border-white/5 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">User Rewards</span>
            <Gift className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-black text-rose-400 font-mono mt-1">₦{totalRewardsDistributed.toLocaleString()}</div>
          <div className="text-[9px] text-slate-500 mt-0.5">Distributed to Wallets</div>
        </GlassCard>
      </div>

      {/* Search & Filter Bar */}
      <GlassCard className="p-4 border-white/5 space-y-3 bg-slate-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="search-adverts-input"
              type="text"
              placeholder="Search campaigns by title, description, or destination URL..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/60 text-white focus:outline-none focus:ring-1 focus:ring-teal-400 font-mono"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {/* Status Pills */}
            <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-white/5">
              {(['all', 'active', 'inactive'] as const).map(st => (
                <button
                  key={st}
                  id={`filter-status-${st}`}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#8F1D3A] text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'all' ? 'All Status' : st}
                </button>
              ))}
            </div>

            {/* Category Select */}
            <select
              id="filter-category-select"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl bg-slate-950/60 text-slate-300 border border-white/10 focus:outline-none focus:ring-1 focus:ring-teal-400"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Adverts Grid */}
      {loading ? (
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-teal-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading active advert campaigns...</p>
        </div>
      ) : filteredAdverts.length === 0 ? (
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 rounded-2xl bg-slate-900/30 border border-white/5">
          <div className="p-4 rounded-2xl bg-white/5 text-slate-400">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No campaigns found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
                ? 'No advert campaigns matched your current search filters.'
                : 'No advert campaigns exist yet. Create your first campaign to begin serving sponsored ads!'}
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8F1D3A] to-[#C13A5A] text-white text-xs font-bold shadow-md cursor-pointer"
          >
            Create First Advert
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdverts.map(ad => {
            const isActive = ad.isActive !== false;
            return (
              <GlassCard
                key={ad.id}
                id={`advert-card-${ad.id}`}
                className={`flex flex-col justify-between overflow-hidden border transition-all ${
                  isActive
                    ? 'border-white/10 hover:border-teal-400/40 bg-slate-900/60'
                    : 'border-white/5 opacity-70 bg-slate-950/60'
                }`}
              >
                {/* Banner Thumbnail */}
                <div className="relative h-32 w-full bg-slate-950 overflow-hidden group">
                  <img
                    src={ad.bannerUrl || PRESET_BANNERS[0].url}
                    alt={ad.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-md ${
                        isActive
                          ? 'bg-emerald-500/80 text-white border border-emerald-400/40'
                          : 'bg-rose-500/80 text-white border border-rose-400/40'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-white'}`} />
                      {isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wide bg-black/60 text-slate-200 border border-white/10 backdrop-blur-sm">
                      {ad.category || 'General'}
                    </span>
                  </div>

                  {/* Reward Badge */}
                  <div className="absolute bottom-2 left-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md">
                      <Gift className="w-3.5 h-3.5" />
                      <span>₦{Number(ad.rewardAmount || 200).toLocaleString()} Reward</span>
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-1">{ad.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {ad.description || 'No description provided.'}
                    </p>
                  </div>

                  {/* Destination URL Preview */}
                  <div className="p-2 rounded-xl bg-slate-950/60 border border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <ExternalLink className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span className="text-[10px] text-slate-300 font-mono truncate">{ad.destinationUrl}</span>
                    </div>
                    <a
                      href={ad.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-teal-400 hover:text-teal-300 shrink-0 flex items-center gap-0.5"
                      title="Open destination in new tab"
                    >
                      <span>Visit</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
                        <MousePointerClick className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">Clicks</div>
                        <div className="text-xs font-bold text-white font-mono">{ad.clicks || 0}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <Eye className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">Impressions</div>
                        <div className="text-xs font-bold text-white font-mono">{ad.impressions || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex items-center justify-between gap-2 border-t border-white/5">
                    {/* Toggle Active / Pause */}
                    <button
                      id={`toggle-advert-${ad.id}`}
                      onClick={() => handleToggleStatus(ad)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{isActive ? 'Deactivate' : 'Activate'}</span>
                    </button>

                    {/* Edit */}
                    <button
                      id={`edit-advert-${ad.id}`}
                      onClick={() => openEditModal(ad)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 transition-all cursor-pointer"
                      title="Edit Campaign"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      id={`delete-advert-${ad.id}`}
                      onClick={() => setDeletingAdvert(ad)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#0e1017] border border-white/10 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#8F1D3A] text-white">
                  {editingAdvert ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingAdvert ? 'Edit Advert Campaign' : 'Create New Advert Campaign'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Configure campaign metadata, payout rewards, and external destination link
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveAdvert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kuda Smart Digital Bank"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Brief promotional copy describing the advert and call-to-action..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Destination URL (Redirect Target) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/promo"
                  value={formData.destinationUrl}
                  onChange={e => setFormData({ ...formData, destinationUrl: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Users will be redirected to this external website URL upon clicking or viewing the ad.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">User Reward (₦) *</label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    required
                    value={formData.rewardAmount}
                    onChange={e => setFormData({ ...formData, rewardAmount: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                  <p className="text-[9px] text-slate-500 mt-0.5">Credited to wallet on interaction</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-white/10 text-white focus:outline-none focus:ring-1 focus:ring-teal-400"
                  >
                    <option value="Fintech">Fintech</option>
                    <option value="Finance">Finance</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Telecom">Telecom</option>
                    <option value="Investment">Investment</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Services">Services</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Banner Image URL</label>
                <input
                  type="url"
                  value={formData.bannerUrl}
                  onChange={e => setFormData({ ...formData, bannerUrl: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl bg-slate-950 border border-white/10 text-white font-mono focus:outline-none focus:ring-1 focus:ring-teal-400"
                />

                {/* Preset image selector */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold">Or pick a preset theme:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BANNERS.map(p => (
                      <button
                        type="button"
                        key={p.label}
                        onClick={() => setFormData({ ...formData, bannerUrl: p.url })}
                        className={`text-[9px] px-2 py-1 rounded-md border transition-all cursor-pointer ${
                          formData.bannerUrl === p.url
                            ? 'bg-[#8F1D3A] text-white border-[#C13A5A]'
                            : 'bg-white/5 text-slate-400 border-white/5 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5">
                <div>
                  <div className="text-xs font-bold text-white">Campaign Status</div>
                  <div className="text-[10px] text-slate-400">Make this advert active immediately upon saving</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8F1D3A] to-[#C13A5A] hover:opacity-95 text-white text-xs font-black shadow-lg shadow-[#8F1D3A]/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{editingAdvert ? 'Update Campaign' : 'Launch Campaign'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAdvert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0e1017] border border-rose-500/30 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Delete Advert Campaign</h3>
                <p className="text-xs text-slate-400 mt-0.5">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/5 space-y-1">
              <div className="text-xs font-bold text-white">{deletingAdvert.title}</div>
              <div className="text-[10px] text-slate-400 truncate">{deletingAdvert.destinationUrl}</div>
              <div className="text-[10px] text-teal-400 font-mono">
                {deletingAdvert.clicks || 0} total clicks recorded
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete this advert? It will immediately stop appearing to users and all click links will be deactivated.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeletingAdvert(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Keep Campaign
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteAdvert}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAdvertManagement;
