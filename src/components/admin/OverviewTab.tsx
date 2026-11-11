import { Plus, Image as ImageIcon, Layers, Mail, ArrowUpRight, CheckCircle2, Clock, Box } from 'lucide-react';
import { DatabaseState, Project } from '../../types/portfolio.ts';

interface OverviewTabProps {
  data: DatabaseState;
  onNavigateTab: (tab: string) => void;
  onEditProject: (project: Project) => void;
  onNewProject: () => void;
}

export function OverviewTab({
  data,
  onNavigateTab,
  onEditProject,
  onNewProject,
}: OverviewTabProps) {
  const totalProjects = data.projects.length;
  const publishedProjects = data.projects.filter((p) => p.is_published).length;
  const draftProjects = totalProjects - publishedProjects;
  const totalGallery = data.gallery.length;
  const unreadMessages = data.messages.filter((m) => !m.read).length;

  const recentProjects = [...data.projects]
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 rounded-xs border border-zinc-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase text-zinc-400 block">
            Portfolio Management System
          </span>
          <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight text-zinc-900">
            Welcome back, {data.profile.display_name}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Manage your 3D artwork, projects, Blender assets, and site copy without touching code.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onNewProject}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Primary Metrics Strip - No fake graphs, purely functional numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateTab('projects')}
          className="bg-white p-5 rounded-xs border border-zinc-200/80 hover:border-zinc-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium text-zinc-600">Total Projects</span>
            <Layers className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </div>
          <div className="font-display text-2xl font-bold text-zinc-900 tabular-nums">
            {totalProjects}
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px] font-mono text-zinc-500">
            <span className="text-emerald-600">{publishedProjects} published</span>
            <span>·</span>
            <span className="text-amber-600">{draftProjects} drafts</span>
          </div>
        </div>

        <div 
          onClick={() => onNavigateTab('gallery')}
          className="bg-white p-5 rounded-xs border border-zinc-200/80 hover:border-zinc-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium text-zinc-600">Gallery Artworks</span>
            <ImageIcon className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </div>
          <div className="font-display text-2xl font-bold text-zinc-900 tabular-nums">
            {totalGallery}
          </div>
          <p className="mt-2 text-[11px] text-zinc-500">
            Render archive &amp; lighting studies
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('messages')}
          className="bg-white p-5 rounded-xs border border-zinc-200/80 hover:border-zinc-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium text-zinc-600">Client Inquiries</span>
            <Mail className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </div>
          <div className="font-display text-2xl font-bold text-zinc-900 tabular-nums">
            {data.messages.length}
          </div>
          <p className="mt-2 text-[11px] font-medium text-zinc-500">
            {unreadMessages > 0 ? (
              <span className="text-red-600">{unreadMessages} unread message{unreadMessages > 1 ? 's' : ''}</span>
            ) : (
              <span className="text-zinc-400">All inquiries reviewed</span>
            )}
          </p>
        </div>

        <div 
          onClick={() => onNavigateTab('supabase')}
          className="bg-white p-5 rounded-xs border border-zinc-200/80 hover:border-zinc-400 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium text-zinc-600">Storage &amp; Database</span>
            <Box className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
          </div>
          <div className="font-display text-base font-bold text-zinc-900 truncate">
            Active &amp; Persisted
          </div>
          <p className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" />
            <span>Real-time ready</span>
          </p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="bg-white p-6 rounded-xs border border-zinc-200/80 space-y-4">
        <h3 className="font-display text-sm font-bold text-zinc-900 uppercase tracking-wider">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={onNewProject}
            className="p-3 text-left border border-zinc-200 hover:border-zinc-900 rounded-xs transition-colors cursor-pointer flex flex-col justify-between h-20"
          >
            <span className="text-xs font-semibold text-zinc-900">Add New Project</span>
            <span className="text-[11px] text-zinc-500">Upload thumbnail &amp; Blender link</span>
          </button>

          <button
            onClick={() => onNavigateTab('gallery')}
            className="p-3 text-left border border-zinc-200 hover:border-zinc-900 rounded-xs transition-colors cursor-pointer flex flex-col justify-between h-20"
          >
            <span className="text-xs font-semibold text-zinc-900">Add Gallery Image</span>
            <span className="text-[11px] text-zinc-500">Add render to visual index</span>
          </button>

          <button
            onClick={() => onNavigateTab('about')}
            className="p-3 text-left border border-zinc-200 hover:border-zinc-900 rounded-xs transition-colors cursor-pointer flex flex-col justify-between h-20"
          >
            <span className="text-xs font-semibold text-zinc-900">Update Profile Bio</span>
            <span className="text-[11px] text-zinc-500">Change portrait or introduction</span>
          </button>

          <button
            onClick={() => onNavigateTab('supabase')}
            className="p-3 text-left border border-zinc-200 hover:border-zinc-900 rounded-xs transition-colors cursor-pointer flex flex-col justify-between h-20"
          >
            <span className="text-xs font-semibold text-zinc-900">Supabase Setup</span>
            <span className="text-[11px] text-zinc-500">View migrations &amp; Vercel guide</span>
          </button>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white rounded-xs border border-zinc-200/80 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Recent Projects
          </h3>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({totalProjects})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-zinc-100">
          {recentProjects.map((proj) => (
            <div
              key={proj.id}
              onClick={() => onEditProject(proj)}
              className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/80 transition-colors cursor-pointer gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-11 bg-zinc-100 rounded-xs overflow-hidden shrink-0 border border-zinc-200">
                  <img
                    src={proj.thumbnail_url}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-zinc-900 truncate">
                    {proj.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                    <span>{proj.category}</span>
                    <span>·</span>
                    <span>{proj.creation_date}</span>
                    {proj.blender_project_url && (
                      <>
                        <span>·</span>
                        <span className="text-amber-600 font-medium">.blend link</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-xs ${
                    proj.is_published
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-zinc-100 text-zinc-600'
                  }`}
                >
                  {proj.is_published ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-zinc-400 group-hover:text-zinc-900">
                  Edit
                </span>
              </div>
            </div>
          ))}

          {recentProjects.length === 0 && (
            <div className="p-8 text-center text-xs text-zinc-500">
              No projects created yet. Click &quot;New Project&quot; above to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
