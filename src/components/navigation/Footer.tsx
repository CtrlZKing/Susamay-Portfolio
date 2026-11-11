import { ArrowUp, Lock } from 'lucide-react';
import { SocialLink } from '../../types/portfolio.ts';

interface FooterProps {
  artistName: string;
  footerText: string;
  socialLinks: SocialLink[];
  onNavigateToAdmin: () => void;
}

export function Footer({ artistName, footerText, socialLinks, onNavigateToAdmin }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/50 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Artist branding */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-display font-bold text-lg tracking-tight text-zinc-900 uppercase">
              {artistName}
            </h3>
            <p className="text-xs text-zinc-500 max-w-md leading-relaxed">
              Creative portfolio for 3D modeling, hard-surface concept design, environmental art, and cinematic ray-traced rendering.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li><a href="#hero" className="hover:text-zinc-900 transition-colors">Overview</a></li>
              <li><a href="#projects" className="hover:text-zinc-900 transition-colors">Featured Works</a></li>
              <li><a href="#gallery" className="hover:text-zinc-900 transition-colors">Artworks &amp; Renders</a></li>
              <li><a href="#about" className="hover:text-zinc-900 transition-colors">Biography</a></li>
              <li><a href="#skills" className="hover:text-zinc-900 transition-colors">Software &amp; Skills</a></li>
              <li><a href="#contact" className="hover:text-zinc-900 transition-colors">Inquire</a></li>
            </ul>
          </div>

          {/* Col 3: Social & External */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
              Profiles &amp; Assets
            </h4>
            <ul className="space-y-2 text-xs text-zinc-500">
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-zinc-900 transition-colors"
                  >
                    {link.platform}
                  </a>
                </li>
              ))}
              {socialLinks.length === 0 && (
                <li className="text-zinc-400">No public profiles configured</li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-zinc-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>{footerText || `© ${new Date().getFullYear()} ${artistName}. All rights reserved.`}</p>

          <div className="flex items-center gap-6">
            <button
              onClick={onNavigateToAdmin}
              className="flex items-center gap-1.5 hover:text-zinc-700 transition-colors cursor-pointer"
              title="Private Owner Portal"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin CMS</span>
            </button>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-zinc-700 transition-colors cursor-pointer"
              aria-label="Scroll to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
