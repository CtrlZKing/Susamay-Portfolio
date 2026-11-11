import { useState, FormEvent } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Box,
  Layers,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Star,
  StarOff,
  Loader2,
  X,
  Upload,
} from 'lucide-react';
import { Project, ProjectImage } from '../../types/portfolio.ts';
import { ImageUploadBox } from '../common/ImageUploadBox.tsx';
import { api } from '../../lib/api.ts';

interface ProjectsTabProps {
  projects: Project[];
  categories: string[];
  onRefresh: () => void;
  editingProject?: Project | null;
  onClearEditing?: () => void;
}

export function ProjectsTab({
  projects,
  categories,
  onRefresh,
  editingProject,
  onClearEditing,
}: ProjectsTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(Boolean(editingProject));
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formState, setFormState] = useState<Partial<Project>>({
    id: '',
    title: '',
    slug: '',
    description: '',
    detailed_overview: '',
    thumbnail_url: '',
    category: categories[0] || '3D Modeling',
    software_used: ['Blender 4.2 LTS', 'Cycles Engine'],
    external_url: '',
    blender_project_url: '',
    video_url: '',
    is_featured: false,
    is_published: true,
    creation_date: '2026',
    images: [],
  });

  const [softwareInput, setSoftwareInput] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [newImageType, setNewImageType] = useState<'render' | 'wireframe' | 'viewport' | 'wip'>('render');
  const [tempImageUrl, setTempImageUrl] = useState('');

  // Handle open modal for create
  const handleOpenCreate = () => {
    setFormState({
      id: '',
      title: '',
      slug: '',
      description: '',
      detailed_overview: '',
      thumbnail_url: '',
      category: categories[0] || '3D Modeling',
      software_used: ['Blender 4.2 LTS', 'Cycles'],
      external_url: '',
      blender_project_url: '',
      video_url: '',
      is_featured: false,
      is_published: true,
      creation_date: '2026',
      images: [],
    });
    setError(null);
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const handleOpenEdit = (project: Project) => {
    setFormState({
      ...project,
      images: [...(project.images || [])],
    });
    setError(null);
    setIsModalOpen(true);
  };

  // Add Software Tag
  const handleAddSoftware = () => {
    if (!softwareInput.trim()) return;
    const current = formState.software_used || [];
    if (!current.includes(softwareInput.trim())) {
      setFormState({ ...formState, software_used: [...current, softwareInput.trim()] });
    }
    setSoftwareInput('');
  };

  const handleRemoveSoftware = (tag: string) => {
    const current = formState.software_used || [];
    setFormState({ ...formState, software_used: current.filter((t) => t !== tag) });
  };

  // Add Project Image
  const handleAddProjectImage = () => {
    if (!tempImageUrl.trim()) return;
    const newImg: ProjectImage = {
      id: `img-${Date.now()}`,
      project_id: formState.id || 'new',
      image_url: tempImageUrl.trim(),
      caption: newImageCaption.trim() || 'Additional View',
      display_order: (formState.images?.length || 0) + 1,
      image_type: newImageType,
    };
    setFormState({
      ...formState,
      images: [...(formState.images || []), newImg],
    });
    setTempImageUrl('');
    setNewImageCaption('');
  };

  const handleRemoveProjectImage = (imgId: string) => {
    setFormState({
      ...formState,
      images: (formState.images || []).filter((i) => i.id !== imgId),
    });
  };

  // Submit Save
  const handleSaveProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!formState.title?.trim() || !formState.thumbnail_url?.trim()) {
      setError('Project title and thumbnail image are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (formState.id) {
        await api.updateProject(formState.id, formState);
      } else {
        await api.createProject(formState);
      }
      setIsModalOpen(false);
      if (onClearEditing) onClearEditing();
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save project.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle publish state inline
  const handleTogglePublish = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.updateProject(project.id, { is_published: !project.is_published });
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  // Toggle featured state inline
  const handleToggleFeatured = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.updateProject(project.id, { is_featured: !project.is_featured });
      onRefresh();
    } catch (err) {
      console.error('Failed to toggle featured:', err);
    }
  };

  // Delete project
  const handleDeleteConfirm = async (id: string) => {
    try {
      await api.deleteProject(id);
      setConfirmDeleteId(null);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xs border border-zinc-200/80">
        <div>
          <h2 className="font-display text-lg font-bold text-zinc-900">
            Project Management
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Create, edit, or publish 3D projects, upload render passes and configure Blender assets.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-xs border border-zinc-200/80 overflow-hidden">
        <div className="divide-y divide-zinc-200">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-20 h-16 bg-zinc-100 rounded-xs overflow-hidden shrink-0 border border-zinc-200">
                  <img
                    src={proj.thumbnail_url}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                    <span>{proj.category}</span>
                    <span>·</span>
                    <span>{proj.creation_date}</span>
                    {proj.images && proj.images.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{proj.images.length + 1} views</span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-zinc-900 truncate">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-zinc-500 line-clamp-1 max-w-xl">
                    {proj.description}
                  </p>

                  {proj.blender_project_url && (
                    <div className="flex items-center gap-1 text-[11px] text-amber-700 font-mono">
                      <Box className="w-3 h-3 text-amber-500" />
                      <span className="truncate max-w-xs">{proj.blender_project_url}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* Featured toggle */}
                <button
                  type="button"
                  onClick={(e) => handleToggleFeatured(proj, e)}
                  className={`p-2 rounded-xs border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                    proj.is_featured
                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                      : 'border-zinc-200 text-zinc-400 hover:text-zinc-700'
                  }`}
                  title={proj.is_featured ? 'Featured on homepage' : 'Mark as featured'}
                >
                  {proj.is_featured ? <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" /> : <StarOff className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline text-[11px]">Featured</span>
                </button>

                {/* Published toggle */}
                <button
                  type="button"
                  onClick={(e) => handleTogglePublish(proj, e)}
                  className={`p-2 rounded-xs border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                    proj.is_published
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-zinc-200 text-zinc-400 hover:text-zinc-700'
                  }`}
                  title={proj.is_published ? 'Visible to public' : 'Draft / Hidden from public'}
                >
                  {proj.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline text-[11px]">
                    {proj.is_published ? 'Published' : 'Draft'}
                  </span>
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => handleOpenEdit(proj)}
                  className="p-2 border border-zinc-200 hover:border-zinc-900 rounded-xs text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer"
                  title="Edit project"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>

                {/* Delete */}
                {confirmDeleteId === proj.id ? (
                  <div className="flex items-center gap-1 bg-red-50 p-1 rounded-xs border border-red-200">
                    <span className="text-[10px] text-red-600 px-1">Delete?</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteConfirm(proj.id)}
                      className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-semibold rounded-xs hover:bg-red-700 cursor-pointer"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-1.5 py-0.5 text-zinc-600 text-[10px] hover:text-zinc-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(proj.id)}
                    className="p-2 border border-zinc-200 hover:border-red-500 rounded-xs text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="p-12 text-center text-xs text-zinc-500 space-y-2">
              <p>No projects in portfolio.</p>
              <button
                onClick={handleOpenCreate}
                className="text-zinc-900 font-medium hover:underline cursor-pointer"
              >
                Create your first project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Project Form Modal (Create or Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-xs shadow-2xl border border-zinc-200 my-8 overflow-hidden">
            {/* Top Bar */}
            <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
              <h3 className="font-display text-base font-bold text-zinc-900">
                {formState.id ? 'Edit Project' : 'Create New Project'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  if (onClearEditing) onClearEditing();
                }}
                className="p-1 text-zinc-500 hover:text-zinc-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProject} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Title & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="e.g. Monolith: Oceanic Brutalism"
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700">Category *</label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Thumbnail Upload */}
              <ImageUploadBox
                label="Primary Thumbnail Artwork *"
                value={formState.thumbnail_url || ''}
                onChange={(url) => setFormState({ ...formState, thumbnail_url: url })}
                aspectHint="Key cover render (16:9 or 4:3 ratio recommended)"
              />

              {/* Short Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">Short Summary / Teaser</label>
                <textarea
                  rows={2}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="One or two sentences explaining the creative intent..."
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
                />
              </div>

              {/* Detailed Technical Overview */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-700">
                  Detailed Technical &amp; Creative Process Breakdown
                </label>
                <textarea
                  rows={4}
                  value={formState.detailed_overview}
                  onChange={(e) => setFormState({ ...formState, detailed_overview: e.target.value })}
                  placeholder="Explain your Blender modeling workflow, modifier stack, lighting setup, samples, shaders, and texturing details..."
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900 font-mono text-[11px]"
                />
              </div>

              {/* Dedicated Blender Link & External Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-amber-500" />
                    <span>Blender Project Link (URL)</span>
                  </label>
                  <input
                    type="url"
                    value={formState.blender_project_url}
                    onChange={(e) => setFormState({ ...formState, blender_project_url: e.target.value })}
                    placeholder="https://blendswap.com/... or GitHub or Drive link"
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
                  />
                  <p className="text-[10px] text-zinc-400">
                    Direct URL to your .blend project or external 3D asset host
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-700 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                    <span>External Showcase Link (URL)</span>
                  </label>
                  <input
                    type="url"
                    value={formState.external_url}
                    onChange={(e) => setFormState({ ...formState, external_url: e.target.value })}
                    placeholder="https://artstation.com/artwork/..."
                    className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
                  />
                  <p className="text-[10px] text-zinc-400">
                    ArtStation, Behance, or Sketchfab viewer link
                  </p>
                </div>
              </div>

              {/* Software Used Tags */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700">Software &amp; Tools Used</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={softwareInput}
                    onChange={(e) => setSoftwareInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSoftware();
                      }
                    }}
                    placeholder="e.g. Blender 4.2 LTS, Cycles, ZBrush, AgX Color"
                    className="flex-1 px-3 py-1.5 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddSoftware}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-xs cursor-pointer"
                  >
                    Add Tool
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formState.software_used?.map((tool) => (
                    <span
                      key={tool}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-xs rounded-xs"
                    >
                      <span>{tool}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSoftware(tool)}
                        className="text-zinc-400 hover:text-zinc-900 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Multi-Image Gallery Manager (Wireframes, Viewports, Angles) */}
              <div className="space-y-3 pt-4 border-t border-zinc-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                      Additional Images &amp; Breakdown Passes ({formState.images?.length || 0})
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Upload wireframe viewports, clay renders, or detail close-ups.
                    </p>
                  </div>
                </div>

                {/* Existing Additional Images */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formState.images?.map((img) => (
                    <div key={img.id} className="relative group border border-zinc-200 rounded-xs overflow-hidden bg-zinc-50">
                      <div className="aspect-4/3 overflow-hidden">
                        <img
                          src={img.image_url}
                          alt={img.caption}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-1.5 bg-white text-[10px] font-mono text-zinc-600 truncate border-t border-zinc-100">
                        {img.caption || img.image_type}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProjectImage(img.id)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Remove image"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add new sub-image */}
                <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xs space-y-2">
                  <div className="text-[11px] font-medium text-zinc-700">Add Image Pass:</div>
                  <ImageUploadBox
                    label="Image File"
                    value={tempImageUrl}
                    onChange={(url) => setTempImageUrl(url)}
                    aspectHint="Render pass, wireframe screenshot, or angle"
                  />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      value={newImageCaption}
                      onChange={(e) => setNewImageCaption(e.target.value)}
                      placeholder="Caption (e.g. Clay / Wireframe Pass)"
                      className="px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-xs"
                    />
                    <select
                      value={newImageType}
                      onChange={(e) => setNewImageType(e.target.value as any)}
                      className="px-2.5 py-1.5 text-xs bg-white border border-zinc-200 rounded-xs"
                    >
                      <option value="render">Render</option>
                      <option value="wireframe">Wireframe</option>
                      <option value="viewport">Viewport</option>
                      <option value="wip">WIP / Process</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    disabled={!tempImageUrl}
                    onClick={handleAddProjectImage}
                    className="w-full py-1.5 text-xs bg-zinc-900 text-white font-medium rounded-xs hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
                  >
                    Attach View to Project
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center gap-6 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_published}
                    onChange={(e) => setFormState({ ...formState, is_published: e.target.checked })}
                    className="rounded-xs text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="font-medium text-zinc-800">Published to Live Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.is_featured}
                    onChange={(e) => setFormState({ ...formState, is_featured: e.target.checked })}
                    className="rounded-xs text-zinc-900 focus:ring-zinc-900"
                  />
                  <span className="font-medium text-zinc-800">Feature on Hero/Top</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Date/Season:</span>
                  <input
                    type="text"
                    value={formState.creation_date}
                    onChange={(e) => setFormState({ ...formState, creation_date: e.target.value })}
                    placeholder="2026"
                    className="w-24 px-2 py-1 text-xs border border-zinc-200 rounded-xs"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit / Cancel Buttons */}
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
                  className="px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Project...</span>
                    </>
                  ) : (
                    <span>Save Project</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
