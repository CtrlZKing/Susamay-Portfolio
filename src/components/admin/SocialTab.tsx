import { useState, FormEvent } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, X } from 'lucide-react';
import { SocialLink } from '../../types/portfolio.ts';
import { api } from '../../lib/api.ts';

interface SocialTabProps {
  socialLinks: SocialLink[];
  onRefresh: () => void;
}

export function SocialTab({ socialLinks, onRefresh }: SocialTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [formState, setFormState] = useState<Partial<SocialLink>>({
    platform: 'ArtStation',
    url: '',
    label: '',
    is_visible: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const platforms = [
    'ArtStation',
    'Sketchfab',
    'Instagram',
    'YouTube',
    'Behance',
    'GitHub',
    'LinkedIn',
    'X/Twitter',
    'Personal Website',
    'Other',
  ];

  const handleOpenCreate = () => {
    setEditingLink(null);
    setFormState({
      platform: 'ArtStation',
      url: '',
      label: '',
      is_visible: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: SocialLink) => {
    setEditingLink(link);
    setFormState({ ...link });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState.url?.trim()) {
      setError('Profile URL is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingLink && formState.id) {
        await api.updateSocialLink(formState.id, formState);
      } else {
        await api.createSocialLink(formState);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save social link.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisible = async (link: SocialLink) => {
    try {
      await api.updateSocialLink(link.id, { is_visible: !link.is_visible });
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle visibility:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteSocialLink(id);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete social link:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-zinc-200/80">
        <div>
          <h2 className="font-display text-lg font-bold text-zinc-900">
            Social &amp; Professional Profiles Manager
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage links to ArtStation, Sketchfab, GitHub 3D repos, and creative networks.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Social Link</span>
        </button>
      </div>

      <div className="bg-white rounded-xs border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
        {socialLinks.map((link) => (
          <div
            key={link.id}
            className="p-5 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-900">{link.platform}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-zinc-800"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-zinc-500 font-mono truncate">{link.url}</p>
              {link.label && (
                <p className="text-[11px] text-zinc-400">Label: {link.label}</p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleToggleVisible(link)}
                className={`p-2 rounded-xs border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                  link.is_visible
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-zinc-200 text-zinc-400'
                }`}
                title={link.is_visible ? 'Visible' : 'Hidden'}
              >
                {link.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={() => handleOpenEdit(link)}
                className="p-2 border border-zinc-200 hover:border-zinc-900 rounded-xs text-zinc-700 cursor-pointer"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(link.id)}
                className="p-2 border border-zinc-200 hover:border-red-500 rounded-xs text-zinc-400 hover:text-red-600 cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {socialLinks.length === 0 && (
          <div className="p-8 text-center text-xs text-zinc-500">
            No social links configured yet.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-xs shadow-2xl border border-zinc-200 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <h3 className="font-display text-sm font-bold text-zinc-900">
                {editingLink ? 'Edit Social Link' : 'Add Social Link'}
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
                <label className="text-xs font-medium text-zinc-700">Platform</label>
                <select
                  value={formState.platform}
                  onChange={(e) => setFormState({ ...formState, platform: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs bg-white"
                >
                  {platforms.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Profile URL *</label>
                <input
                  type="url"
                  required
                  value={formState.url}
                  onChange={(e) => setFormState({ ...formState, url: e.target.value })}
                  placeholder="https://artstation.com/username"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Display Label</label>
                <input
                  type="text"
                  value={formState.label}
                  onChange={(e) => setFormState({ ...formState, label: e.target.value })}
                  placeholder="e.g. artstation.com/eliasvance"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="soc_vis"
                  checked={formState.is_visible}
                  onChange={(e) => setFormState({ ...formState, is_visible: e.target.checked })}
                  className="rounded-xs text-zinc-900"
                />
                <label htmlFor="soc_vis" className="text-xs font-medium text-zinc-800 cursor-pointer">
                  Visible on public website
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
                  {isSaving ? 'Saving...' : 'Save Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
