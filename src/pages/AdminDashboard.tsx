import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../components/admin/AdminLayout.tsx';
import { OverviewTab } from '../components/admin/OverviewTab.tsx';
import { ProjectsTab } from '../components/admin/ProjectsTab.tsx';
import { GalleryTab } from '../components/admin/GalleryTab.tsx';
import { AboutTab } from '../components/admin/AboutTab.tsx';
import { SkillsTab } from '../components/admin/SkillsTab.tsx';
import { SocialTab } from '../components/admin/SocialTab.tsx';
import { SettingsTab } from '../components/admin/SettingsTab.tsx';
import { MessagesTab } from '../components/admin/MessagesTab.tsx';
import { SupabaseSetupTab } from '../components/admin/SupabaseSetupTab.tsx';
import { api, authStorage } from '../lib/api.ts';
import { DatabaseState, Project } from '../types/portfolio.ts';
import { Loader2 } from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
  onViewSite: () => void;
}

export function AdminDashboard({ onLogout, onViewSite }: AdminDashboardProps) {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [data, setData] = useState<DatabaseState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const loadAdminData = useCallback(async () => {
    try {
      const result = await api.getAdminData();
      setData(result);
      setError(null);
    } catch (err: unknown) {
      console.error('Failed to load admin data:', err);
      // If unauthorized, token might be invalid
      if (err instanceof Error && err.message.includes('401')) {
        authStorage.clearToken();
        onLogout();
        return;
      }
      setError('Unable to fetch administrative data.');
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const handleEditProjectFromOverview = (project: Project) => {
    setEditingProject(project);
    setCurrentTab('projects');
  };

  const handleNewProjectFromOverview = () => {
    setEditingProject(null);
    setCurrentTab('projects');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-500">
          Loading Admin Workspace...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-100 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-red-600 mb-4">{error || 'Session error.'}</p>
        <button
          onClick={loadAdminData}
          className="px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  const unreadMessagesCount = data.messages.filter((m) => !m.read).length;

  return (
    <AdminLayout
      currentTab={currentTab}
      onSelectTab={(tab) => {
        setCurrentTab(tab);
        if (tab !== 'projects') {
          setEditingProject(null);
        }
      }}
      onLogout={async () => {
        await api.logout();
        onLogout();
      }}
      onViewSite={onViewSite}
      unreadCount={unreadMessagesCount}
    >
      {currentTab === 'overview' && (
        <OverviewTab
          data={data}
          onNavigateTab={setCurrentTab}
          onEditProject={handleEditProjectFromOverview}
          onNewProject={handleNewProjectFromOverview}
        />
      )}

      {currentTab === 'projects' && (
        <ProjectsTab
          projects={data.projects}
          categories={data.categories}
          onRefresh={loadAdminData}
          editingProject={editingProject}
          onClearEditing={() => setEditingProject(null)}
        />
      )}

      {currentTab === 'gallery' && (
        <GalleryTab
          gallery={data.gallery}
          categories={data.categories}
          onRefresh={loadAdminData}
        />
      )}

      {currentTab === 'about' && (
        <AboutTab
          profile={data.profile}
          onRefresh={loadAdminData}
        />
      )}

      {currentTab === 'skills' && (
        <SkillsTab
          skills={data.skills}
          onRefresh={loadAdminData}
        />
      )}

      {currentTab === 'social' && (
        <SocialTab
          socialLinks={data.social_links}
          onRefresh={loadAdminData}
        />
      )}

      {currentTab === 'settings' && (
        <SettingsTab
          settings={data.settings}
          categories={data.categories}
          onRefresh={loadAdminData}
        />
      )}

      {currentTab === 'messages' && (
        <MessagesTab
          messages={data.messages}
          onRefresh={loadAdminData}
        />
      )}

      {currentTab === 'supabase' && <SupabaseSetupTab />}
    </AdminLayout>
  );
}
