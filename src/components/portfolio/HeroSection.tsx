import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import { Project, Profile, SiteSettings } from '../../types/portfolio.ts';

interface HeroSectionProps {
  profile: Profile;
  settings: SiteSettings;
  featuredProject?: Project;
  onSelectProject: (project: Project) => void;
}

export function HeroSection({
  profile,
  settings,
  featuredProject,
  onSelectProject,
}: HeroSectionProps) {
  const heroImage = featuredProject?.thumbnail_url || '/src/assets/images/hero_3d_render_1794374246726.jpg';

  return (
    <section id="hero" className="pt-28 md:pt-36 pb-16 md:pb-24 px-6 max-w-7xl mx-auto">
      {/* 2-Column Hero Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: Typographic Hierarchy */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
              {profile.professional_title || '3D Artist · Blender Specialist'}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900 leading-[1.08] text-balance">
              {settings.hero_headline || 'Sculpting light, geometry, and digital spaces.'}
            </h1>
          </div>

          <p className="text-sm md:text-base text-zinc-600 leading-relaxed max-w-lg">
            {settings.hero_subheadline || profile.introduction}
          </p>

          {/* Action buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 transition-colors rounded-xs cursor-pointer shadow-xs"
            >
              <span>Explore My Work</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </a>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-800 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer"
            >
              <span>Contact Me</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Status highlight */}
          {profile.available_for_freelance && (
            <div className="pt-4 flex items-center gap-2 text-xs text-zinc-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Available for freelance contracts &amp; 3D commissions</span>
            </div>
          )}
        </div>

        {/* Right Column: Hero Artwork Showcase */}
        <div className="lg:col-span-7">
          <div 
            onClick={() => featuredProject && onSelectProject(featuredProject)}
            className={`group relative overflow-hidden rounded-xs border border-zinc-200/80 bg-zinc-100 cursor-pointer transition-all duration-300 ${
              featuredProject ? 'hover:border-zinc-400 hover:shadow-lg' : ''
            }`}
          >
            <div className="aspect-16/10 sm:aspect-16/9 w-full overflow-hidden">
              <img
                src={heroImage}
                alt={featuredProject?.title || 'Featured 3D Render'}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-102"
              />
            </div>

            {/* Quiet overlay caption */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-t border-zinc-100 bg-white">
              <div>
                <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
                  Featured Project · {featuredProject?.category || 'Environment Design'}
                </span>
                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                  {featuredProject?.title || 'Monolith: Oceanic Brutalism'}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 group-hover:text-zinc-900 transition-colors">
                <span>View Breakdown</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width discipline strip below the split */}
      <div className="mt-16 pt-8 border-t border-zinc-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-zinc-600">
        <div>
          <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Discipline</span>
          <p className="text-xs font-semibold text-zinc-900">3D Modeling &amp; Geometry</p>
          <p className="text-[11px] text-zinc-500">Sub-d &amp; Booleans</p>
        </div>
        <div>
          <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Renderer</span>
          <p className="text-xs font-semibold text-zinc-900">Blender Cycles &amp; AgX</p>
          <p className="text-[11px] text-zinc-500">Spectral Ray-Tracing</p>
        </div>
        <div>
          <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Texturing</span>
          <p className="text-xs font-semibold text-zinc-900">Substance 3D &amp; PBR</p>
          <p className="text-[11px] text-zinc-500">Procedural &amp; Wear Maps</p>
        </div>
        <div>
          <span className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Location</span>
          <p className="text-xs font-semibold text-zinc-900">{profile.location || 'Berlin, Germany'}</p>
          <p className="text-[11px] text-zinc-500">Worldwide Collaboration</p>
        </div>
      </div>
    </section>
  );
}
