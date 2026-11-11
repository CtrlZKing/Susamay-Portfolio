import { useState, useEffect } from 'react';
import { Copy, Check, Database, ExternalLink, Shield, Server, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api.ts';

export function SupabaseSetupTab() {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{
    mode: string;
    hasSupabaseConfig: boolean;
    projectCount: number;
    galleryCount: number;
  } | null>(null);

  useEffect(() => {
    api.getStatus().then(setStatus).catch(console.error);
  }, []);

  const migrationSql = `-- ==============================================================================
-- AURA CREATIVE PORTFOLIO - SUPABASE DATABASE MIGRATION
-- Paste this entire script into your Supabase SQL Editor and click 'RUN'.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name TEXT NOT NULL DEFAULT 'Elias Vance',
  professional_title TEXT NOT NULL DEFAULT '3D Artist | Blender Specialist',
  biography TEXT NOT NULL DEFAULT '',
  profile_image TEXT NOT NULL DEFAULT '',
  introduction TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT 'elias.vance.3d@example.com',
  resume_url TEXT DEFAULT '',
  location TEXT DEFAULT 'Berlin, Germany',
  available_for_freelance BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0
);

-- 3. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  detailed_overview TEXT DEFAULT '',
  thumbnail_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '3D Modeling',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  software_used TEXT[] DEFAULT '{}',
  external_url TEXT DEFAULT '',
  blender_project_url TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  creation_date TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PROJECT IMAGES
CREATE TABLE IF NOT EXISTS public.project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  display_order INT DEFAULT 0,
  image_type TEXT DEFAULT 'render',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. GALLERY IMAGES
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '3D Render',
  software TEXT DEFAULT 'Blender / Cycles',
  display_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SKILLS
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '3D & CG',
  description TEXT DEFAULT '',
  proficiency_label TEXT DEFAULT 'Advanced',
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- 7. SOCIAL LINKS
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT DEFAULT '',
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- 8. SITE SETTINGS
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_title TEXT NOT NULL DEFAULT 'ELIAS VANCE — 3D & Digital Creator',
  artist_name TEXT NOT NULL DEFAULT 'Elias Vance',
  hero_headline TEXT NOT NULL DEFAULT 'Sculpting light, geometry, and digital spaces.',
  hero_subheadline TEXT NOT NULL DEFAULT 'Specializing in hard-surface mechanical modeling, brutalist environmental design, and ray-traced cinematic renders in Blender.',
  featured_project_id TEXT DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT 'elias.vance.3d@example.com',
  footer_text TEXT NOT NULL DEFAULT '© 2026 Elias Vance. All rights reserved.',
  seo_title TEXT NOT NULL DEFAULT 'Elias Vance — 3D Artist & Blender Specialist Portfolio',
  seo_description TEXT NOT NULL DEFAULT 'Selected 3D renders, hard-surface modeling, and digital art created in Blender.',
  accent_color TEXT DEFAULT '#18181b',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. CONTACT MESSAGES
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Admin update profiles" ON public.profiles FOR ALL TO authenticated USING (true);

CREATE POLICY "Public view published projects" ON public.projects FOR SELECT USING (is_published = true);
CREATE POLICY "Admin manage projects" ON public.projects FOR ALL TO authenticated USING (true);

CREATE POLICY "Public view project images" ON public.project_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_images.project_id AND projects.is_published = true)
);
CREATE POLICY "Admin manage project images" ON public.project_images FOR ALL TO authenticated USING (true);

CREATE POLICY "Public view gallery" ON public.gallery_images FOR SELECT USING (is_published = true);
CREATE POLICY "Admin manage gallery" ON public.gallery_images FOR ALL TO authenticated USING (true);

CREATE POLICY "Public view skills" ON public.skills FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage skills" ON public.skills FOR ALL TO authenticated USING (true);

CREATE POLICY "Public view social links" ON public.social_links FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin manage social links" ON public.social_links FOR ALL TO authenticated USING (true);

CREATE POLICY "Public view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin update settings" ON public.site_settings FOR ALL TO authenticated USING (true);

CREATE POLICY "Anyone submit contact inquiry" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage messages" ON public.contact_messages FOR ALL TO authenticated USING (true);

-- STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public view media" ON storage.objects FOR SELECT USING (bucket_id = 'portfolio-media');
CREATE POLICY "Admin upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'portfolio-media');
CREATE POLICY "Admin update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'portfolio-media');
CREATE POLICY "Admin delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'portfolio-media');`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(migrationSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Current Runtime Status */}
      <div className="bg-white p-6 md:p-8 rounded-xs border border-zinc-200/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-zinc-900" />
            <h2 className="font-display text-lg font-bold text-zinc-900">
              Database &amp; Deployment Architecture
            </h2>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-xs bg-emerald-50 text-emerald-700 flex items-center gap-1.5 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Persistent Engine Online</span>
          </span>
        </div>

        <p className="text-xs text-zinc-600 leading-relaxed">
          The portfolio currently runs a fully operational full-stack Express engine with real-time atomic disk persistence (<code className="font-mono text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded-xs">data/portfolio.db.json</code>) and image uploads (<code className="font-mono text-zinc-800 bg-zinc-100 px-1 py-0.5 rounded-xs">public/uploads/</code>).
        </p>

        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xs space-y-2 text-xs">
          <div className="font-semibold text-zinc-900">Architecture Capabilities:</div>
          <ul className="list-disc list-inside space-y-1 text-zinc-600 text-[11px]">
            <li>Instant live updates: all changes made in this dashboard reflect on the public website immediately without code edits.</li>
            <li>Ready for Supabase PostgreSQL, Supabase Storage, and Supabase RLS in production.</li>
            <li>Ready for 1-click Vercel frontend and cloud hosting.</li>
          </ul>
        </div>
      </div>

      {/* Step-by-Step Supabase Setup Checklist */}
      <div className="bg-white p-6 md:p-8 rounded-xs border border-zinc-200/80 space-y-6">
        <div>
          <h3 className="font-display text-base font-bold text-zinc-900">
            Production Setup Checklist (Supabase &amp; Vercel)
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Follow these simple steps when deploying to your custom domain on Vercel with Supabase:
          </p>
        </div>

        <ol className="space-y-4 text-xs text-zinc-700">
          <li className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xs space-y-1.5">
            <div className="font-semibold text-zinc-900 flex items-center justify-between">
              <span>Step 1: Create a Supabase Project</span>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-zinc-500 hover:text-zinc-900 flex items-center gap-1"
              >
                <span>supabase.com</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Sign up or log in at Supabase, click &quot;New Project&quot;, and select your preferred region (e.g. Frankfurt, London, or US East).
            </p>
          </li>

          <li className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xs space-y-2">
            <div className="font-semibold text-zinc-900 flex items-center justify-between">
              <span>Step 2: Run Database Migration &amp; RLS Policies</span>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 text-white text-[11px] rounded-xs hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied SQL!' : 'Copy Migration SQL'}</span>
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              In your Supabase Dashboard, open the <strong>SQL Editor</strong> tab on the left, paste the SQL script (using the button above), and click <strong>Run</strong>. This creates all 9 tables, indexes, Row Level Security policies, and the <code className="font-mono">portfolio-media</code> storage bucket.
            </p>
          </li>

          <li className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xs space-y-1.5">
            <div className="font-semibold text-zinc-900">
              <span>Step 3: Configure Environment Variables</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Navigate to <strong>Project Settings → API</strong> in Supabase. Copy your <code className="font-mono text-zinc-800">Project URL</code> and <code className="font-mono text-zinc-800">anon public key</code>, then add them to your environment:
            </p>
            <div className="bg-zinc-900 text-zinc-200 p-3 rounded-xs font-mono text-[10px] space-y-1">
              <div>VITE_SUPABASE_URL=&quot;https://your-project.supabase.co&quot;</div>
              <div>VITE_SUPABASE_ANON_KEY=&quot;eyJh...&quot;</div>
            </div>
          </li>

          <li className="p-4 bg-zinc-50 border border-zinc-200/80 rounded-xs space-y-1.5">
            <div className="font-semibold text-zinc-900">
              <span>Step 4: Deploy to Vercel</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Push your repository to GitHub, import into Vercel, paste the two environment variables above, and click Deploy. Your portfolio will be live worldwide with SSL and CDN delivery.
            </p>
          </li>
        </ol>
      </div>

      {/* Migration Script Viewer */}
      <div className="bg-white p-6 rounded-xs border border-zinc-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-sm font-bold text-zinc-900 uppercase tracking-wider">
            Supabase Migration SQL (<code className="font-mono text-xs">supabase/migrations/001_initial_schema.sql</code>)
          </h4>
          <button
            type="button"
            onClick={handleCopySql}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium rounded-xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Full SQL'}</span>
          </button>
        </div>

        <pre className="p-4 bg-zinc-950 text-zinc-300 font-mono text-[11px] rounded-xs overflow-x-auto max-h-72 leading-relaxed">
          {migrationSql}
        </pre>
      </div>
    </div>
  );
}
