import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Edit2, Check, AlertCircle, ToggleLeft, ToggleRight, Clock, ShieldCheck, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Task, TaskSubmission, TaskVerificationType } from '../../types';
import { api } from '../../lib/api';

export const AdminTasksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'submissions'>('tasks');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'pending' | 'claimed' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [category, setCategory] = useState<'social' | 'survey' | 'daily' | 'download' | 'special'>('social');
  const [verificationType, setVerificationType] = useState<TaskVerificationType>('timer');
  const [timerSeconds, setTimerSeconds] = useState('30');
  const [proofInstructions, setProofInstructions] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // Review Modal State
  const [processingSubmissionId, setProcessingSubmissionId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, submissionsData] = await Promise.all([
        api.getAdminTasks(),
        api.getAdminTaskSubmissions(),
      ]);
      setTasks(tasksData);
      setSubmissions(submissionsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setRewardAmount('500');
    setCategory('social');
    setVerificationType('timer');
    setTimerSeconds('30');
    setProofInstructions('');
    setActionUrl('');
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setRewardAmount(task.rewardAmount.toString());
    setCategory(task.category);
    setVerificationType(task.verificationType || 'timer');
    setTimerSeconds((task.timerSeconds || 30).toString());
    setProofInstructions(task.proofInstructions || '');
    setActionUrl(task.actionUrl);
    setShowModal(true);
  };

  const handleToggleEnable = async (task: Task) => {
    try {
      await api.updateTask(task.id, { enabled: !task.enabled });
      setMsg({ type: 'success', text: `Task "${task.title}" ${!task.enabled ? 'enabled' : 'disabled'}.` });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update task.' });
    }
  };

  const handleDelete = async (taskId: string, taskTitle: string) => {
    if (!window.confirm(`Delete task "${taskTitle}"?`)) return;
    try {
      await api.deleteTask(taskId);
      setMsg({ type: 'success', text: `Task "${taskTitle}" deleted.` });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete task.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !rewardAmount) return;

    setSaving(true);
    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, {
          title,
          description,
          rewardAmount: Number(rewardAmount),
          category,
          verificationType,
          timerSeconds: Number(timerSeconds),
          proofInstructions,
          actionUrl: actionUrl || '#',
        });
        setMsg({ type: 'success', text: 'Task updated successfully!' });
      } else {
        await api.createTask({
          title,
          description,
          rewardAmount: Number(rewardAmount),
          category,
          verificationType,
          timerSeconds: Number(timerSeconds),
          proofInstructions,
          actionUrl: actionUrl || '#',
          enabled: true,
        });
        setMsg({ type: 'success', text: 'New task created successfully!' });
      }
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save task.' });
    } finally {
      setSaving(false);
    }
  };

  const handleApproveSubmission = async (sub: TaskSubmission) => {
    try {
      setProcessingSubmissionId(sub.id);
      const res = await api.approveTaskSubmission(sub.id, 'Verified and approved by admin');
      setMsg({ type: 'success', text: res.message });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to approve submission.' });
    } finally {
      setProcessingSubmissionId(null);
    }
  };

  const handleRejectSubmission = async (sub: TaskSubmission) => {
    const reason = window.prompt('Enter reason for rejecting this proof submission:', 'Invalid proof or username provided');
    if (!reason) return;

    try {
      setProcessingSubmissionId(sub.id);
      const res = await api.rejectTaskSubmission(sub.id, reason);
      setMsg({ type: 'success', text: res.message });
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to reject submission.' });
    } finally {
      setProcessingSubmissionId(null);
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending_verification').length;

  const filteredSubmissions = submissions.filter((s) => {
    if (submissionFilter === 'all') return true;
    if (submissionFilter === 'pending') return s.status === 'pending_verification';
    return s.status === submissionFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-[#F27D26]" />
            Task Verification & Management Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Manage active tasks and review user proof submissions</p>
        </div>

        {activeTab === 'tasks' && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-[#F27D26] hover:bg-[#E6721F] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-[#F27D26]/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Task</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-3 bg-[#11141c] p-1.5 rounded-2xl border border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-[#F27D26] text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Active Tasks ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'submissions'
              ? 'bg-[#F27D26] text-black shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <span>Review Submissions</span>
          {pendingCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          {msg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* TAB 1: TASKS LIST */}
      {activeTab === 'tasks' && (
        <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-6">
          {loading ? (
            <div className="text-center py-10 text-zinc-500 text-xs">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-10 text-zinc-500 text-xs">No tasks created yet. Click above to add one!</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-[#171b26] p-5 rounded-2xl border border-zinc-800 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase text-[#F27D26] bg-[#F27D26]/10 px-2.5 py-0.5 rounded-full border border-[#F27D26]/20">
                        {task.category} • {task.verificationType || 'timer'}
                      </span>
                      <span className="text-sm font-black text-[#F27D26]">+₦{task.rewardAmount}</span>
                    </div>

                    <h3 className="font-extrabold text-white text-sm">{task.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{task.description}</p>

                    <div className="mt-2 text-[10px] text-zinc-500 font-mono">
                      {task.verificationType === 'proof' ? 'Proof Submission Required' : `${task.timerSeconds || 30}s Timer Verification`}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleEnable(task)}
                      className="flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {task.enabled ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ToggleRight className="w-5 h-5" /> Enabled
                        </span>
                      ) : (
                        <span className="text-zinc-500 flex items-center gap-1">
                          <ToggleLeft className="w-5 h-5" /> Disabled
                        </span>
                      )}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(task)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id, task.title)}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROOF SUBMISSIONS REVIEW */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex gap-2 bg-[#11141c] p-2 rounded-2xl border border-zinc-800 w-fit text-xs font-bold">
            <button
              onClick={() => setSubmissionFilter('pending')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                submissionFilter === 'pending' ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Pending Verification ({pendingCount})
            </button>
            <button
              onClick={() => setSubmissionFilter('claimed')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                submissionFilter === 'claimed' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Approved ({submissions.filter((s) => s.status === 'claimed').length})
            </button>
            <button
              onClick={() => setSubmissionFilter('rejected')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                submissionFilter === 'rejected' ? 'bg-red-500 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Rejected ({submissions.filter((s) => s.status === 'rejected').length})
            </button>
            <button
              onClick={() => setSubmissionFilter('all')}
              className={`px-3 py-1.5 rounded-xl cursor-pointer ${
                submissionFilter === 'all' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              All Submissions ({submissions.length})
            </button>
          </div>

          <div className="bg-[#11141c] border border-zinc-800 rounded-3xl p-6">
            {loading ? (
              <div className="text-center py-10 text-zinc-500 text-xs">Loading task submissions...</div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-xs">
                No submissions found for the selected filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSubmissions.map((sub) => (
                  <div
                    key={sub.id}
                    className="bg-[#171b26] p-5 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{sub.userName}</span>
                        <span className="text-[11px] text-zinc-400 font-mono">({sub.userEmail})</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                            sub.status === 'pending_verification'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : sub.status === 'claimed'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-red-500/10 border-red-500/30 text-red-400'
                          }`}
                        >
                          {sub.status === 'pending_verification' ? 'Pending Review' : sub.status}
                        </span>
                      </div>

                      <div className="text-xs font-extrabold text-white flex items-center gap-2">
                        <span>Task: {sub.taskTitle}</span>
                        <span className="text-[#F27D26]">+₦{sub.rewardAmount.toLocaleString()}</span>
                      </div>

                      {sub.proofText && (
                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-xs font-mono text-amber-200">
                          <span className="text-zinc-500 font-sans font-bold">Proof Details: </span>
                          {sub.proofText}
                        </div>
                      )}

                      {sub.adminNote && (
                        <p className="text-[11px] text-zinc-400 italic">Admin Note: {sub.adminNote}</p>
                      )}

                      <p className="text-[10px] text-zinc-500 font-mono">
                        Submitted: {new Date(sub.completedAt || sub.createdAt).toLocaleString()}
                      </p>
                    </div>

                    {/* Action buttons */}
                    {sub.status === 'pending_verification' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveSubmission(sub)}
                          disabled={processingSubmissionId === sub.id}
                          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve & Pay</span>
                        </button>
                        <button
                          onClick={() => handleRejectSubmission(sub)}
                          disabled={processingSubmissionId === sub.id}
                          className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 border border-red-500/30 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Creation / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#11141c] border border-[#F27D26]/30 rounded-3xl w-full max-w-lg p-6 space-y-4">
            <h3 className="font-extrabold text-white text-base">
              {editingTask ? 'Edit Task Settings' : 'Create New Task'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#F27D26]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain requirements to complete this task"
                  className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#F27D26]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Reward (₦) *</label>
                  <input
                    type="number"
                    required
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    placeholder="500"
                    className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-[#F27D26] font-bold text-xs focus:outline-none focus:border-[#F27D26]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Verification Method *</label>
                  <select
                    value={verificationType}
                    onChange={(e: any) => setVerificationType(e.target.value)}
                    className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#F27D26]"
                  >
                    <option value="timer">Timer Countdown (External Visit)</option>
                    <option value="proof">Proof Submission (Username/Handle)</option>
                  </select>
                </div>
              </div>

              {verificationType === 'timer' ? (
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Required Timer Duration (Seconds)</label>
                  <input
                    type="number"
                    value={timerSeconds}
                    onChange={(e) => setTimerSeconds(e.target.value)}
                    placeholder="30"
                    className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#F27D26]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Proof Submission Instructions</label>
                  <input
                    type="text"
                    value={proofInstructions}
                    onChange={(e) => setProofInstructions(e.target.value)}
                    placeholder="e.g. Enter your Telegram @username or review handle"
                    className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#F27D26]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Action URL (External Target Link)</label>
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-[#F27D26]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/3 bg-[#171b26] text-zinc-400 font-bold text-xs py-3 rounded-xl border border-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-2/3 bg-[#F27D26] hover:bg-[#E6721F] disabled:opacity-50 text-black font-extrabold text-xs py-3 rounded-xl cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

