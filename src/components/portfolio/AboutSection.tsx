import { FileText, MapPin, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { Profile } from '../../types/portfolio.ts';

interface AboutSectionProps {
  profile: Profile;
}

export function AboutSection({ profile }: AboutSectionProps) {
  const profileImg = profile.profile_image || '/src/assets/images/artist_portrait_1794374247762.jpg';

  return (
    <section id="about" className="py-20 md:py-28 px-6 max-w-7xl mx-auto border-t border-zinc-200/80">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Portrait and Quick Meta */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative border border-zinc-200 rounded-xs overflow-hidden bg-zinc-100 aspect-square max-w-md mx-auto lg:max-w-none">
            <img
              src={profileImg}
              alt={profile.display_name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div className="space-y-3 pt-2 text-xs text-zinc-500 max-w-md mx-auto lg:max-w-none">
            {profile.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Based in {profile.location} · Available globally</span>
              </div>
            )}
            {profile.available_for_freelance && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-zinc-700 font-medium">Currently open to freelance &amp; remote studio contracts</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Biography & Philosophy */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
              About the Artist
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
              {profile.display_name}
            </h2>
            <p className="text-sm font-medium text-zinc-500 font-mono">
              {profile.professional_title}
            </p>
          </div>

          <div className="prose prose-zinc max-w-none text-zinc-600 space-y-4 text-sm md:text-base leading-relaxed">
            {profile.biography ? (
              profile.biography.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))
            ) : (
              <p>
                Specialized in high-end Blender 3D visualization, hard-surface concept design, and procedural shading.
              </p>
            )}
          </div>

          {/* Core Areas of Practice */}
          <div className="pt-6 border-t border-zinc-200/80 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                Primary Medium
              </span>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Blender 4.x (Cycles ray-tracing), Geometry Nodes, and complex procedural PBR shader graphs.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-900 uppercase tracking-wider block">
                Creative Direction
              </span>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Brutalist architecture, hard-surface robotics, atmospheric cinematography, and realistic material physics.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            {profile.resume_url && (
              <a
                href={profile.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Resume / Portfolio PDF</span>
                <ArrowUpRight className="w-3 h-3 text-zinc-400" />
              </a>
            )}

            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white bg-zinc-900 hover:bg-zinc-800 transition-colors rounded-xs cursor-pointer"
            >
              <span>Get in Touch</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
