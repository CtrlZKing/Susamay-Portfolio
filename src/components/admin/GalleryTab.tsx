import { useState, FormEvent } from 'react';
import { Plus, Trash2, Eye, EyeOff, Loader2, AlertCircle, X, Pencil } from 'lucide-react';
import { GalleryImage } from '../../types/portfolio.ts';
import { ImageUploadBox } from '../common/ImageUploadBox.tsx';
import { api } from '../../lib/api.ts';

interface GalleryTabProps {
  gallery: GalleryImage[];
  categories: string[];
  onRefresh: () => void;
}

export function GalleryTab({ gallery, categories, onRefresh }: GalleryTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryImage | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [formState, setFormState] = useState<Partial<GalleryImage>>({
    id: '',
    title: '',
    description: '',
    image_url: '',
    category: categories[0] || '3D Render',
    software: 'Blender 4.2 / Cycles',
    display_order: gallery.length + 1,
    is_published: true,
  });

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormState({
      id: '',
      title: '',
      description: '',
      image_url: '',
      category: categories[0] || '3D Render',
      software: 'Blender 4.2 / Cycles',
      display_order: gallery.length + 1,
      is_published: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GalleryImage) => {
    setEditingItem(item);
    setFormState({ ...item });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState.image_url) {
      setError('Please upload or provide an artwork image URL.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editingItem && formState.id) {
        await api.updateGalleryImage(formState.id, formState);
      } else {
        await api.createGalleryImage(formState);
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save gallery image.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (item: GalleryImage) => {
    try {
      await api.updateGalleryImage(item.id, { is_published: !item.is_published });
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteGalleryImage(id);
      setConfirmDeleteId(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete gallery image:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-zinc-200/80">
        <div>
          <h2 className="font-display text-lg font-bold text-zinc-900">
            Gallery &amp; Renders Archive
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Upload and manage standalone 3D renders, viewport experiments, and lighting studies.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Artwork</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="group bg-white border border-zinc-200/80 rounded-xs overflow-hidden flex flex-col justify-between hover:border-zinc-400 transition-colors"
          >
            <div className="relative aspect-4/3 bg-zinc-900 overflow-hidden">
              <img
                src={item.image_url}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {!item.is_published && (
                <div className="absolute top-2 left-2 bg-zinc-900/90 text-white text-[10px] font-mono px-2 py-0.5 rounded-xs">
                  Hidden
                </div>
              )}
            </div>

            <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>{item.category}</span>
                  <span>{item.software}</span>
                </div>
                <h4 className="text-xs font-semibold text-zinc-900 truncate mt-1">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-[11px] text-zinc-500 line-clamp-1">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Action bar */}
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(item)}
                  className={`text-[11px] flex items-center gap-1 cursor-pointer ${
                    item.is_published ? 'text-emerald-700' : 'text-zinc-400'
                  }`}
                  title={item.is_published ? 'Published' : 'Hidden'}
                >
                  {item.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{item.is_published ? 'Public' : 'Draft'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1 text-zinc-500 hover:text-zinc-900 cursor-pointer"
                    title="Edit image info"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  {confirmDeleteId === item.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded-xs cursor-pointer"
                      >
                        Del
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-zinc-500 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(item.id)}
                      className="p-1 text-zinc-400 hover:text-red-600 cursor-pointer"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {gallery.length === 0 && (
        <div className="bg-white p-12 text-center text-xs text-zinc-500 border border-zinc-200 rounded-xs">
          No gallery images yet. Click &quot;Upload Artwork&quot; to add your 3D renders.
        </div>
      )}

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-xs shadow-2xl border border-zinc-200 overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <h3 className="font-display text-sm font-bold text-zinc-900">
                {editingItem ? 'Edit Gallery Artwork' : 'Upload New Gallery Artwork'}
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
              <ImageUploadBox
                label="Artwork Image *"
                value={formState.image_url || ''}
                onChange={(url) => setFormState({ ...formState, image_url: url })}
                aspectHint="High-res render (JPG, PNG, WebP)"
              />

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Artwork Title</label>
                <input
                  type="text"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  placeholder="e.g. Copper Dispersion Study"
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
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="Study">Study</option>
                    <option value="Lighting">Lighting</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Software / Renderer</label>
                  <input
                    type="text"
                    value={formState.software}
                    onChange={(e) => setFormState({ ...formState, software: e.target.value })}
                    placeholder="Blender 4.2 / Cycles"
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Caption / Description</label>
                <input
                  type="text"
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Lighting breakdown or shader notes"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="gal_pub"
                  checked={formState.is_published}
                  onChange={(e) => setFormState({ ...formState, is_published: e.target.checked })}
                  className="rounded-xs text-zinc-900"
                />
                <label htmlFor="gal_pub" className="text-xs font-medium text-zinc-800 cursor-pointer">
                  Visible in public gallery
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
                  className="px-4 py-2 text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Artwork'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
