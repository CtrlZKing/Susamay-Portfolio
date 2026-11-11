import { useEffect, useState } from 'react';
import { X, ExternalLink, Box, Play, Layers, Calendar, Cpu, ArrowRight } from 'lucide-react';
import { Project, ProjectImage } from '../../types/portfolio.ts';

interface ProjectDetailModalProps {
  project: Project | null;
  allProjects: Project[];
  onClose: () => void;
  onSelectProject: (project: Project) => void;
  onOpenLightbox: (images: { url: string; title?: string; caption?: string }[], index: number) => void;
}

export function ProjectDetailModal({
  project,
  allProjects,
  onClose,
  onSelectProject,
  onOpenLightbox,
}: ProjectDetailModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (!project) return;
    setActiveImageIndex(0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [project, onClose]);

  if (!project) return null;

  // Compile list of all viewable images for this project
  const displayImages: ProjectImage[] = [
    {
      id: 'thumb',
      project_id: project.id,
      image_url: project.thumbnail_url,
      caption: 'Main Key Render',
      display_order: 0,
      image_type: 'render',
    },
    ...(project.images || []),
  ];

  const currentImage = displayImages[activeImageIndex] || displayImages[0];

  // Related projects in the same category or other featured
  const relatedProjects = allProjects
    .filter((p) => p.id !== project.id && (p.category === project.category || p.is_featured))
    .slice(0, 2);

  const handleLaunchLightbox = (idx: number) => {
    onOpenLightbox(
      displayImages.map((img) => ({
        url: img.image_url,
        title: project.title,
        caption: img.caption,
      })),
      idx
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-6 md:p-10 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-full max-w-5xl rounded-xs shadow-2xl overflow-hidden my-auto border border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-zinc-200 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
            <span>{project.category}</span>
            <span>·</span>
            <span>{project.creation_date}</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xs transition-colors cursor-pointer"
            aria-label="Close project modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="max-h-[82vh] overflow-y-auto">
          {/* Main Visual Display */}
          <div className="bg-zinc-950 relative group">
            <div 
              className="max-h-[58vh] flex items-center justify-center p-2 cursor-zoom-in"
              onClick={() => handleLaunchLightbox(activeImageIndex)}
            >
              <img
                src={currentImage.image_url}
                alt={currentImage.caption || project.title}
                referrerPolicy="no-referrer"
                className="max-h-[56vh] w-auto max-w-full object-contain mx-auto"
              />
            </div>

            {/* Click to inspect prompt */}
            <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/75 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-xs font-mono flex items-center gap-1.5 pointer-events-none">
              <span>Click to view full-resolution lightbox</span>
            </div>

            {/* Caption bar */}
            {currentImage.caption && (
              <div className="bg-zinc-900/90 text-zinc-300 text-xs px-6 py-2.5 border-t border-zinc-800 flex items-center justify-between">
                <span>{currentImage.caption}</span>
                {currentImage.image_type && (
                  <span className="uppercase text-[10px] font-mono tracking-wider text-zinc-400">
                    Type: {currentImage.image_type}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Additional image thumbnail switcher */}
          {displayImages.length > 1 && (
            <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center gap-3 overflow-x-auto">
              <span className="text-[11px] font-mono text-zinc-400 uppercase shrink-0">Views:</span>
              {displayImages.map((img, idx) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative shrink-0 w-16 h-12 rounded-xs overflow-hidden border transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-zinc-900 ring-2 ring-zinc-900/20'
                      : 'border-zinc-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt={img.caption || `View ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Project Details Grid */}
          <div className="p-6 md:p-10 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Title and Narrative */}
              <div className="lg:col-span-8 space-y-6">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
                    {project.title}
                  </h1>
                  <p className="mt-3 text-sm md:text-base text-zinc-600 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {project.detailed_overview && (
                  <div className="space-y-3 pt-4 border-t border-zinc-100">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                      Technical &amp; Creative Breakdown
                    </h4>
                    <p className="text-xs md:text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                      {project.detailed_overview}
                    </p>
                  </div>
                )}

                {/* Video Embed */}
                {project.video_url && (
                  <div className="pt-4 space-y-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" />
                      <span>Demonstration / Animation</span>
                    </h4>
                    <div className="aspect-16/9 w-full bg-zinc-900 rounded-xs overflow-hidden">
                      <iframe
                        src={project.video_url}
                        title={`${project.title} video`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Metadata & Action Links */}
              <div className="lg:col-span-4 bg-zinc-50 p-6 rounded-xs border border-zinc-200/80 space-y-6">
                {/* Blender Project Link Button */}
                {project.blender_project_url && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 block">
                      Blender 3D Asset
                    </span>
                    <a
                      href={project.blender_project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                    >
                      <Box className="w-4 h-4 text-amber-400" />
                      <span>Blender Project Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* External Project URL */}
                {project.external_url && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 block">
                      Case Study / Live Link
                    </span>
                    <a
                      href={project.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 hover:border-zinc-400 text-zinc-900 text-xs font-medium rounded-xs transition-colors cursor-pointer"
                    >
                      <span>External Presentation</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Software Used */}
                {project.software_used && project.software_used.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-zinc-200">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 block">
                      Software &amp; Tools
                    </span>
                    <div className="space-y-1">
                      {project.software_used.map((tool) => (
                        <div key={tool} className="text-xs text-zinc-700 font-medium">
                          {tool}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Creation info */}
                <div className="space-y-1 pt-2 border-t border-zinc-200 text-xs text-zinc-500">
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Category:</span>
                    <span className="font-medium text-zinc-800">{project.category}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Created:</span>
                    <span className="font-medium text-zinc-800">{project.creation_date}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Assets:</span>
                    <span className="font-medium text-zinc-800">{displayImages.length} images</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Projects */}
            {relatedProjects.length > 0 && (
              <div className="pt-8 border-t border-zinc-200 space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                  Related Projects
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedProjects.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectProject(rel)}
                      className="group flex items-center gap-4 p-3 border border-zinc-200 hover:border-zinc-400 rounded-xs bg-zinc-50/50 hover:bg-white transition-all cursor-pointer"
                    >
                      <div className="w-16 h-14 bg-zinc-100 rounded-xs overflow-hidden shrink-0">
                        <img
                          src={rel.thumbnail_url}
                          alt={rel.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-mono text-zinc-400 block uppercase">
                          {rel.category}
                        </span>
                        <h5 className="text-xs font-semibold text-zinc-900 group-hover:text-zinc-600 truncate">
                          {rel.title}
                        </h5>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
