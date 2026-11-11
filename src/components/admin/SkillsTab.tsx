import { useState, FormEvent } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Loader2, AlertCircle, X } from 'lucide-react';
import { Skill } from '../../types/portfolio.ts';
import { api } from '../../lib/api.ts';

interface SkillsTabProps {
  skills: Skill[];
  onRefresh: () => void;
}

export function SkillsTab({ skills, onRefresh }: SkillsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formState, setFormState] = useState<Partial<Skill>>({
    name: '',
    category: 'Software',
    description: '',
    proficiency_label: 'Expert',
    is_visible: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingSkill(null);
    setFormState({
      name: '',
      category: 'Software',
      description: '',
      proficiency_label: 'Advanced',
      is_visible: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormState({ ...skill });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState.name?.trim()) {
      setError('Skill name is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingSkill && formState.id) {
        await api.updateSkill(formState.id, formState);
      } else {
        await api.createSkill(formState);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save skill.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisible = async (skill: Skill) => {
    try {
      await api.updateSkill(skill.id, { is_visible: !skill.is_visible });
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle skill visibility:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSkill(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-zinc-200/80">
        <div>
          <h2 className="font-display text-lg font-bold text-zinc-900">
            Skills &amp; Software Manager
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configure your 3D software toolchain, rendering competencies, and proficiency tags.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Skill / Tool</span>
        </button>
      </div>

      <div className="bg-white rounded-xs border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="p-5 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                <span>{skill.category}</span>
                <span>·</span>
                <span className="text-zinc-700 font-medium">{skill.proficiency_label}</span>
              </div>
              <h4 className="text-sm font-semibold text-zinc-900">{skill.name}</h4>
              <p className="text-xs text-zinc-500 line-clamp-1">{skill.description}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleVisible(skill)}
                className={`p-2 rounded-xs border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                  skill.is_visible
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-zinc-200 text-zinc-400'
                }`}
                title={skill.is_visible ? 'Visible' : 'Hidden'}
              >
                {skill.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleOpenEdit(skill)}
                className="p-2 border border-zinc-200 hover:border-zinc-900 rounded-xs text-zinc-700 cursor-pointer"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(skill.id)}
                className="p-2 border border-zinc-200 hover:border-red-500 rounded-xs text-zinc-400 hover:text-red-600 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-xs shadow-2xl border border-zinc-200 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <h3 className="font-display text-sm font-bold text-zinc-900">
                {editingSkill ? 'Edit Skill / Tool' : 'Add New Skill / Tool'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Skill / Software Name *</label>
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="e.g. Blender 4.x or Geometry Nodes"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Category</label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs bg-white"
                  >
                    <option value="Software">Software</option>
                    <option value="3D & CG">3D &amp; CG</option>
                    <option value="Rendering">Rendering</option>
                    <option value="Post-Production">Post-Production</option>
                    <option value="Technical">Technical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Proficiency Label</label>
                  <input
                    type="text"
                    value={formState.proficiency_label}
                    onChange={(e) => setFormState({ ...formState, proficiency_label: e.target.value })}
                    placeholder="e.g. Daily Driver / Expert"
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Description</label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="How you utilize this in your production pipeline..."
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="skill_vis"
                  checked={formState.is_visible}
                  onChange={(e) => setFormState({ ...formState, is_visible: e.target.checked })}
                  className="rounded-xs text-zinc-900"
                />
                <label htmlFor="skill_vis" className="text-xs font-medium text-zinc-800 cursor-pointer">
                  Visible in public skills section
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xs">
                  {error}
                </div>
              )}

              <div className="pt-4 border-t border-zinc-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs text-zinc-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xs cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
