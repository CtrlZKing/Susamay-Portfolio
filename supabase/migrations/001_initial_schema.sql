-- ==============================================================================
-- AURA CREATIVE PORTFOLIO - SUPABASE DATABASE MIGRATION
-- Run this in your Supabase SQL Editor to set up all tables and security policies.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  display_name TEXT NOT NULL DEFAULT 'Elias Vance',
  professional_title TEXT NOT NULL DEFAULT '3D Artist | Blender Specialist | Visual Designer',
  biography TEXT NOT NULL DEFAULT '',
  profile_image TEXT NOT NULL DEFAULT '',
  introduction TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT 'elias.vance.3d@example.com',
  resume_url TEXT DEFAULT '',
  location TEXT DEFAULT 'Berlin, Germany',
  available_for_freelance BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_order INT DEFAULT 0
);

-- 3. PROJECTS TABLE
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

-- 4. PROJECT IMAGES TABLE (Multi-image support per project)
CREATE TABLE IF NOT EXISTS public.project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  display_order INT DEFAULT 0,
  image_type TEXT DEFAULT 'render', -- 'render', 'wireframe', 'viewport', 'wip', 'detail'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. GALLERY IMAGES TABLE
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

-- 6. SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '3D & CG',
  description TEXT DEFAULT '',
  proficiency_label TEXT DEFAULT 'Advanced',
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- 7. SOCIAL LINKS TABLE
CREATE TABLE IF NOT EXISTS public.social_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT DEFAULT '',
  display_order INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- 8. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_title TEXT NOT NULL DEFAULT 'ELIAS VANCE — 3D & Digital Creator',
  artist_name TEXT NOT NULL DEFAULT 'Elias Vance',
  hero_headline TEXT NOT NULL DEFAULT 'Sculpting light, geometry, and digital spaces.',
  hero_subheadline TEXT NOT NULL DEFAULT 'Specializing in hard-surface modeling, brutalist environmental design, and ray-traced cinematic renders in Blender.',
  featured_project_id TEXT DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT 'elias.vance.3d@example.com',
  footer_text TEXT NOT NULL DEFAULT '© 2026 Elias Vance. All rights reserved. Crafted with precision.',
  seo_title TEXT NOT NULL DEFAULT 'Elias Vance — 3D Artist & Blender Specialist Portfolio',
  seo_description TEXT NOT NULL DEFAULT 'Explore selected 3D renders, hard-surface modeling, architectural spaces, and digital art created in Blender.',
  accent_color TEXT DEFAULT '#27272a',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. CONTACT MESSAGES (Inquiries from visitors)
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT DEFAULT '',
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES: Public can read profile, only authenticated admin can update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Admin can update profile" ON public.profiles
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 2. CATEGORIES: Public can read categories, admin can manage
CREATE POLICY "Public categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);
CREATE POLICY "Admin can manage categories" ON public.categories
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 3. PROJECTS: Public can only see published projects; Admin sees all
CREATE POLICY "Public can view published projects" ON public.projects
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admin can manage all projects" ON public.projects
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. PROJECT IMAGES: Public can view images of published projects; Admin manages all
CREATE POLICY "Public can view project images" ON public.project_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_images.project_id AND projects.is_published = true)
  );
CREATE POLICY "Admin can manage all project images" ON public.project_images
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. GALLERY: Public sees published items, Admin manages all
CREATE POLICY "Public can view published gallery images" ON public.gallery_images
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admin can manage gallery images" ON public.gallery_images
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. SKILLS: Public sees visible skills, Admin manages all
CREATE POLICY "Public can view visible skills" ON public.skills
  FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin can manage skills" ON public.skills
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. SOCIAL LINKS: Public sees visible links, Admin manages all
CREATE POLICY "Public can view visible social links" ON public.social_links
  FOR SELECT USING (is_visible = true);
CREATE POLICY "Admin can manage social links" ON public.social_links
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. SETTINGS: Public can read site settings, Admin can update
CREATE POLICY "Public can view site settings" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admin can update site settings" ON public.site_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. CONTACT MESSAGES: Anyone can submit an inquiry; only Admin can read/manage
CREATE POLICY "Anyone can submit contact message" ON public.contact_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read and manage messages" ON public.contact_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION (Supabase Storage)
-- ==============================================================================
-- Run in Storage SQL or enable 'portfolio-media' public bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-media', 'portfolio-media', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read images from portfolio-media
CREATE POLICY "Public can view media"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-media');

-- Authenticated admin can upload, update, delete media
CREATE POLICY "Admin can upload media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-media');

CREATE POLICY "Admin can update media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-media');

CREATE POLICY "Admin can delete media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-media');
