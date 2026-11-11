import { useEffect, useState, useCallback } from 'react';
import { Navbar } from '../components/navigation/Navbar.tsx';
import { Footer } from '../components/navigation/Footer.tsx';
import { HeroSection } from '../components/portfolio/HeroSection.tsx';
import { ProjectsSection } from '../components/portfolio/ProjectsSection.tsx';
import { ProjectDetailModal } from '../components/portfolio/ProjectDetailModal.tsx';
import { GallerySection } from '../components/portfolio/GallerySection.tsx';
import { AboutSection } from '../components/portfolio/AboutSection.tsx';
import { SkillsSection } from '../components/portfolio/SkillsSection.tsx';
import { ContactSection } from '../components/portfolio/ContactSection.tsx';
import { Lightbox } from '../components/common/Lightbox.tsx';
import { api } from '../lib/api.ts';
import { Project, Profile, SiteSettings, GalleryImage, Skill, SocialLink } from '../types/portfolio.ts';
import { Loader2 } from 'lucide-react';

interface PublicPortfolioProps {
  onNavigateToAdmin: () => void;
}

export function PublicPortfolio({ onNavigateToAdmin }: PublicPortfolioProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Modal & Lightbox state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    images: { url: string; title?: string; caption?: string; category?: string }[];
    index: number;
  }>({
    isOpen: false,
    images: [],
    index: 0,
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getPortfolio();
      setProfile(data.profile);
      setSettings(data.settings);
      setCategories(data.categories || []);
      setProjects(data.projects || []);
      setGallery(data.gallery || []);
      setSkills(data.skills || []);
      setSocialLinks(data.social_links || []);
      setError(null);
    } catch (err: unknown) {
      console.error('Failed to load portfolio:', err);
      setError('Unable to load portfolio content. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open lightbox helper
  const handleOpenLightbox = (
    images: { url: string; title?: string; caption?: string; category?: string }[],
    index: number
  ) => {
    setLightboxState({
      isOpen: true,
      images,
      index,
    });
  };

  const handleCloseLightbox = () => {
    setLightboxState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleNavigateLightbox = (index: number) => {
    setLightboxState((prev) => ({ ...prev, index }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-zinc-800 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
        <p className="text-xs font-mono uppercase tracking-widest text-zinc-400">
          Loading Portfolio Works...
        </p>
      </div>
    );
  }

  if (error || !profile || !settings) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <p className="text-sm text-zinc-600 mb-4">{error || 'Failed to initialize portfolio.'}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-xs hover:bg-zinc-800"
        >
          Retry
        </button>
      </div>
    );
  }

  // Find featured project
  const featuredProject =
    projects.find((p) => p.id === settings.featured_project_id) ||
    projects.find((p) => p.is_featured) ||
    projects[0];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Top Bar Contract Navbar */}
      <Navbar
        brandName={settings.artist_name || profile.display_name}
        onNavigateToAdmin={onNavigateToAdmin}
      />

      <main>
        {/* Hero Section */}
        <HeroSection
          profile={profile}
          settings={settings}
          featuredProject={featuredProject}
          onSelectProject={(proj) => setSelectedProject(proj)}
        />

        {/* Featured Projects Gallery */}
        <ProjectsSection
          projects={projects}
          categories={categories}
          onSelectProject={(proj) => setSelectedProject(proj)}
        />

        {/* Artwork & Renders Gallery */}
        <GallerySection
          gallery={gallery}
          onOpenLightbox={handleOpenLightbox}
        />

        {/* About the Artist */}
        <AboutSection profile={profile} />

        {/* Skills & Software */}
        <SkillsSection skills={skills} />

        {/* Contact & Inquiries */}
        <ContactSection
          profile={profile}
          settings={settings}
          socialLinks={socialLinks}
        />
      </main>

      {/* Footer */}
      <Footer
        artistName={settings.artist_name || profile.display_name}
        footerText={settings.footer_text}
        socialLinks={socialLinks}
        onNavigateToAdmin={onNavigateToAdmin}
      />

      {/* Dedicated Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        allProjects={projects}
        onClose={() => setSelectedProject(null)}
        onSelectProject={(p) => setSelectedProject(p)}
        onOpenLightbox={handleOpenLightbox}
      />

      {/* Accessible Artwork Lightbox */}
      <Lightbox
        isOpen={lightboxState.isOpen}
        onClose={handleCloseLightbox}
        images={lightboxState.images}
        currentIndex={lightboxState.index}
        onNavigate={handleNavigateLightbox}
      />
    </div>
  );
}
