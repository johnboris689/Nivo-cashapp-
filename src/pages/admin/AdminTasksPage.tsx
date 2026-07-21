import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Edit2, Check, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { Task } from '../../types';
import { api } from '../../lib/api';

export const AdminTasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardAmount, setRewardAmount] = useState('');
  const [category, setCategory] = useState<'social' | 'survey' | 'daily' | 'download' | 'special'>('social');
  const [actionUrl, setActionUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      const data = await api.getAdminTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openCreateModal = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setRewardAmount('500');
    setCategory('social');
    setActionUrl('');
    setShowModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setRewardAmount(task.rewardAmount.toString());
    setCategory(task.category);
    setActionUrl(task.actionUrl);
    setShowModal(true);
  };

  const handleToggleEnable = async (task: Task) => {
    try {
      await api.updateTask(task.id, { enabled: !task.enabled });
      setMsg({ type: 'success', text: `Task "${task.title}" ${!task.enabled ? 'enabled' : 'disabled'}.` });
      fetchTasks();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update task.' });
    }
  };

  const handleDelete = async (taskId: string, taskTitle: string) => {
    if (!window.confirm(`Delete task "${taskTitle}"?`)) return;
    try {
      await api.deleteTask(taskId);
      setMsg({ type: 'success', text: `Task "${taskTitle}" deleted.` });
      fetchTasks();
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
          actionUrl: actionUrl || '#',
        });
        setMsg({ type: 'success', text: 'Task updated successfully!' });
      } else {
        await api.createTask({
          title,
          description,
          rewardAmount: Number(rewardAmount),
          category,
          actionUrl: actionUrl || '#',
          enabled: true,
        });
        setMsg({ type: 'success', text: 'New task created successfully!' });
      }
      setShowModal(false);
      fetchTasks();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save task.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-400" />
            Task Management Center
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Create, modify, or toggle tasks and reward amounts for users</p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
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

      {/* Task List Grid */}
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
                    <span className="text-[10px] font-bold uppercase text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                      {task.category}
                    </span>
                    <span className="text-sm font-black text-amber-400">+₦{task.rewardAmount}</span>
                  </div>

                  <h3 className="font-extrabold text-white text-sm">{task.title}</h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{task.description}</p>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleEnable(task)}
                    className="flex items-center gap-1 text-xs font-bold transition-colors"
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
                      className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id, task.title)}
                      className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg transition-all"
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

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#11141c] border border-amber-500/30 rounded-3xl w-full max-w-lg p-6 space-y-4">
            <h3 className="font-extrabold text-white text-base">
              {editingTask ? 'Edit Task' : 'Create New Task'}
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
                  className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Description *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain requirements to complete this task"
                  className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="social">Social Media</option>
                    <option value="daily">Daily Streak</option>
                    <option value="download">Mobile App Download</option>
                    <option value="survey">Survey / Quiz</option>
                    <option value="special">Special Promo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1">Action URL (Optional)</label>
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#171b26] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-xs focus:outline-none focus:border-amber-500"
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
                  className="w-2/3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold text-xs py-3 rounded-xl"
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
