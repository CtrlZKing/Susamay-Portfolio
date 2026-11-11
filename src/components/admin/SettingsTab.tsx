import { useState, FormEvent } from 'react';
import { Loader2, Check, AlertCircle, Key, Plus, Trash2, RotateCcw } from 'lucide-react';
import { SiteSettings } from '../../types/portfolio.ts';
import { api } from '../../lib/api.ts';

interface SettingsTabProps {
  settings: SiteSettings;
  categories: string[];
  onRefresh: () => void;
}

export function SettingsTab({ settings, categories, onRefresh }: SettingsTabProps) {
  const [formState, setFormState] = useState<SiteSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New Category
  const [newCategory, setNewCategory] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [pwdStatus, setPwdStatus] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.updateSettings(formState);
      setSuccess(true);
      onRefresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update settings.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await api.addCategory(newCategory.trim());
      setNewCategory('');
      onRefresh();
    } catch (err) {
      console.error('Failed to add category:', err);
    }
  };

  const handleDeleteCategory = async (cat: string) => {
    try {
      await api.deleteCategory(cat);
      onRefresh();
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const handleUpdateCredentials = async (e: FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdStatus(null);

    if (!currentPassword) {
      setPwdError('Current password is required.');
      return;
    }

    try {
      await api.updateCredentials({
        email: adminEmail.trim() || undefined,
        currentPassword,
        newPassword: newPassword || undefined,
      });
      setPwdStatus('Admin login credentials updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update credentials.';
      setPwdError(msg);
    }
  };

  const handleResetDemo = async () => {
    if (window.confirm('Reset all portfolio projects and settings back to clean initial demo state?')) {
      try {
        await api.resetDemoData();
        onRefresh();
        window.location.reload();
      } catch (err) {
        console.error('Failed to reset demo:', err);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* General Settings */}
      <div className="bg-white p-6 md:p-8 rounded-xs border border-zinc-200/80 space-y-6">
        <div>
          <h2 className="font-display text-lg font-bold text-zinc-900">
            Website &amp; SEO Configuration
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Manage site headers, meta descriptions, and default contact routing.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Site Title / Browser Tab</label>
              <input
                type="text"
                value={formState.site_title}
                onChange={(e) => setFormState({ ...formState, site_title: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Artist Name (Navbar Brand)</label>
              <input
                type="text"
                value={formState.artist_name}
                onChange={(e) => setFormState({ ...formState, artist_name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Hero Section Main Headline</label>
            <input
              type="text"
              value={formState.hero_headline}
              onChange={(e) => setFormState({ ...formState, hero_headline: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Hero Subheadline / Introduction</label>
            <textarea
              rows={2}
              value={formState.hero_subheadline}
              onChange={(e) => setFormState({ ...formState, hero_subheadline: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">SEO Meta Title</label>
              <input
                type="text"
                value={formState.seo_title}
                onChange={(e) => setFormState({ ...formState, seo_title: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-700">Inquiry Destination Email</label>
              <input
                type="email"
                value={formState.contact_email}
                onChange={(e) => setFormState({ ...formState, contact_email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">SEO Description</label>
            <textarea
              rows={2}
              value={formState.seo_description}
              onChange={(e) => setFormState({ ...formState, seo_description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Footer Copyright Text</label>
            <input
              type="text"
              value={formState.footer_text}
              onChange={(e) => setFormState({ ...formState, footer_text: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs text-xs text-emerald-700 flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Site Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Categories Manager */}
      <div className="bg-white p-6 md:p-8 rounded-xs border border-zinc-200/80 space-y-4">
        <div>
          <h3 className="font-display text-base font-bold text-zinc-900">
            Project &amp; Artwork Categories
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Add or remove categories used across your projects and gallery.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCategory();
              }
            }}
            placeholder="New category name (e.g. Procedural Shading)"
            className="flex-1 px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-xs hover:bg-zinc-800 cursor-pointer"
          >
            Add Category
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-800 text-xs rounded-xs"
            >
              <span>{cat}</span>
              {categories.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat)}
                  className="text-zinc-400 hover:text-red-600 cursor-pointer"
                  title="Remove category"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Admin Account Security */}
      <div className="bg-white p-6 md:p-8 rounded-xs border border-zinc-200/80 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-zinc-700" />
          <h3 className="font-display text-base font-bold text-zinc-900">
            Admin Account &amp; Credentials
          </h3>
        </div>
        <p className="text-xs text-zinc-500">
          Change your administrator login email and password for the dashboard.
        </p>

        <form onSubmit={handleUpdateCredentials} className="space-y-4 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">New Admin Email (Optional)</label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Required to make changes"
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">New Password (Optional)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          {pwdStatus && (
            <div className="p-3 bg-emerald-50 text-xs text-emerald-700 rounded-xs border border-emerald-200">
              {pwdStatus}
            </div>
          )}

          {pwdError && (
            <div className="p-3 bg-red-50 text-xs text-red-600 rounded-xs border border-red-200">
              {pwdError}
            </div>
          )}

          <button
            type="submit"
            className="px-4 py-2 bg-zinc-900 text-white text-xs font-semibold uppercase tracking-wider rounded-xs hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Update Credentials
          </button>
        </form>
      </div>

      {/* Danger Zone: Reset to Initial Demo */}
      <div className="p-6 bg-red-50/50 border border-red-200 rounded-xs space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-red-800">
          Reset Portfolio State
        </h4>
        <p className="text-xs text-zinc-600">
          Restore the initial demo projects, skills, and configuration. All custom additions will be reverted.
        </p>
        <button
          type="button"
          onClick={handleResetDemo}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 text-xs font-medium rounded-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset to Clean Demo Content</span>
        </button>
      </div>
    </div>
  );
}
