-- ==============================================================================
-- AURA CREATIVE PORTFOLIO - SUPABASE SEED DATA
-- Optional: Run in Supabase SQL editor to populate starter content
-- ==============================================================================

-- Seed Site Settings
INSERT INTO public.site_settings (
  site_title, artist_name, hero_headline, hero_subheadline, contact_email, footer_text, seo_title, seo_description
) VALUES (
  'ELIAS VANCE — 3D & Digital Creator',
  'Elias Vance',
  'Sculpting light, geometry, and digital spaces.',
  'Specializing in hard-surface modeling, brutalist environmental design, and ray-traced cinematic renders in Blender.',
  'elias.vance.3d@example.com',
  '© 2026 Elias Vance. All rights reserved. Crafted with precision.',
  'Elias Vance — 3D Artist & Blender Specialist Portfolio',
  'Explore selected 3D renders, hard-surface modeling, architectural spaces, and digital art created in Blender.'
) ON CONFLICT DO NOTHING;

-- Seed Profile
INSERT INTO public.profiles (
  display_name, professional_title, biography, profile_image, introduction, contact_email, resume_url, location, available_for_freelance
) VALUES (
  'Elias Vance',
  '3D Artist | Blender Specialist | Visual Designer',
  'With over seven years of dedicated exploration in computer graphics and 3D visualization, I craft evocative digital spaces, intricate mechanical designs, and sculptural forms. My primary toolchain centers around Blender (Cycles & Eevee), supported by ZBrush, Substance 3D Painter, and DaVinci Resolve for final grade. I believe in restrained composition, tangible material physics, and purposeful lighting that tells a quiet story.',
  '/src/assets/images/artist_portrait_1794374247762.jpg',
  'Based in Berlin, collaborating worldwide on commercial visualization, concept art, and independent digital artwork.',
  'elias.vance.3d@example.com',
  '#resume',
  'Berlin, Germany',
  true
) ON CONFLICT DO NOTHING;

-- Seed Categories
INSERT INTO public.categories (name, slug, display_order) VALUES
  ('3D Modeling', '3d-modeling', 1),
  ('Environment Design', 'environment-design', 2),
  ('Character Design', 'character-design', 3),
  ('3D Animation', '3d-animation', 4),
  ('Rendering', 'rendering', 5),
  ('Digital Art', 'digital-art', 6)
ON CONFLICT (slug) DO NOTHING;

-- Seed Skills
INSERT INTO public.skills (name, category, description, proficiency_label, display_order, is_visible) VALUES
  ('Blender 4.x', 'Software', 'Primary DCC tool: full workflow from box modeling to final Cycles composition', 'Daily Driver', 1, true),
  ('Cycles & Ray-Tracing', 'Rendering', 'Deep understanding of light paths, caustic simulation, and custom shader networks', 'Expert', 2, true),
  ('Hard-Surface Modeling', '3D & CG', 'Subdivision surface and boolean workflow with clean topology & beveled geometry', 'Expert', 3, true),
  ('Geometry Nodes', '3D & CG', 'Procedural generation of scattering, organic patterns, and parametric setups', 'Advanced', 4, true),
  ('Substance 3D Painter', 'Software', 'PBR procedural texturing, hand-painted micro-wear, and multi-layered roughness maps', 'Advanced', 5, true),
  ('ZBrush', 'Software', 'Organic anatomy sculpting, high-poly displacement baking, and concept ideation', 'Proficient', 6, true),
  ('Lighting & Color Grading', 'Post-Production', 'Cinematic ACES and AgX color transform pipelines with DaVinci Resolve integration', 'Advanced', 7, true),
  ('Marvelous Designer', 'Software', 'Realistic cloth simulation, dynamic garment folds, and drape optimization', 'Proficient', 8, true)
ON CONFLICT DO NOTHING;

-- Seed Social Links
INSERT INTO public.social_links (platform, url, label, display_order, is_visible) VALUES
  ('ArtStation', 'https://artstation.com', 'artstation.com/eliasvance', 1, true),
  ('Sketchfab', 'https://sketchfab.com', 'sketchfab.com/eliasvance', 2, true),
  ('Instagram', 'https://instagram.com', '@elias.3d.renders', 3, true),
  ('YouTube', 'https://youtube.com', 'Blender Breakdowns & Tutorials', 4, true),
  ('GitHub', 'https://github.com', 'Open Source .blend files', 5, true),
  ('LinkedIn', 'https://linkedin.com', 'Professional Network', 6, true)
ON CONFLICT DO NOTHING;
