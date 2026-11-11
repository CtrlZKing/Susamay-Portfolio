import { useState, FormEvent } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Profile } from '../../types/portfolio.ts';
import { ImageUploadBox } from '../common/ImageUploadBox.tsx';
import { api } from '../../lib/api.ts';

interface AboutTabProps {
  profile: Profile;
  onRefresh: () => void;
}

export function AboutTab({ profile, onRefresh }: AboutTabProps) {
  const [formState, setFormState] = useState<Profile>({ ...profile });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await api.updateProfile(formState);
      setSuccess(true);
      onRefresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xs border border-zinc-200/80 max-w-4xl space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-zinc-900">
          About Page &amp; Artist Biography Editor
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Update your public profile, background narrative, studio location, and downloadable portfolio document.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Display / Artist Name *</label>
            <input
              type="text"
              required
              value={formState.display_name}
              onChange={(e) => setFormState({ ...formState, display_name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Professional Title *</label>
            <input
              type="text"
              required
              value={formState.professional_title}
              onChange={(e) => setFormState({ ...formState, professional_title: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Profile Picture */}
        <ImageUploadBox
          label="Profile Picture / Artist Studio Portrait"
          value={formState.profile_image}
          onChange={(url) => setFormState({ ...formState, profile_image: url })}
          aspectHint="1:1 square ratio recommended"
        />

        {/* Introduction */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-700">
            Short Introduction / One-Liner
          </label>
          <input
            type="text"
            value={formState.introduction}
            onChange={(e) => setFormState({ ...formState, introduction: e.target.value })}
            placeholder="Based in Berlin, collaborating worldwide on commercial visualization..."
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
          />
        </div>

        {/* Biography */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-700">
            Full Biography &amp; Creative Background
          </label>
          <textarea
            rows={6}
            value={formState.biography}
            onChange={(e) => setFormState({ ...formState, biography: e.target.value })}
            placeholder="Detail your background, tools, creative philosophy, and experience..."
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900 leading-relaxed"
          />
          <p className="text-[11px] text-zinc-400">
            Paragraphs separated by blank lines will render cleanly on the public About section.
          </p>
        </div>

        {/* Location & Contact Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Studio Location</label>
            <input
              type="text"
              value={formState.location}
              onChange={(e) => setFormState({ ...formState, location: e.target.value })}
              placeholder="e.g. Berlin, Germany"
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-700">Public Contact Email</label>
            <input
              type="email"
              value={formState.contact_email}
              onChange={(e) => setFormState({ ...formState, contact_email: e.target.value })}
              placeholder="artist@domain.com"
              className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
            />
          </div>
        </div>

        {/* Resume / Portfolio PDF Link */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-zinc-700">Resume / Document Link (URL)</label>
          <input
            type="text"
            value={formState.resume_url}
            onChange={(e) => setFormState({ ...formState, resume_url: e.target.value })}
            placeholder="https://drive.google.com/... or uploaded document link"
            className="w-full px-3 py-2 text-xs border border-zinc-200 rounded-xs focus:outline-none focus:border-zinc-900"
          />
          <p className="text-[11px] text-zinc-400">
            Leave blank if you do not wish to display a resume download link.
          </p>
        </div>

        {/* Availability Toggle */}
        <div className="pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formState.available_for_freelance}
              onChange={(e) => setFormState({ ...formState, available_for_freelance: e.target.checked })}
              className="rounded-xs text-zinc-900"
            />
            <span className="text-xs font-medium text-zinc-800">
              Show &quot;Available for freelance contracts &amp; commissions&quot; badge
            </span>
          </label>
        </div>

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xs text-xs text-emerald-700 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Profile and biography updated successfully!</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xs text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-4 border-t border-zinc-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 rounded-xs transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
