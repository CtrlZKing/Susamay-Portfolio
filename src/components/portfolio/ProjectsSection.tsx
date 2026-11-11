import { useState, useMemo } from 'react';
import { ArrowUpRight, Box, Layers, ExternalLink } from 'lucide-react';
import { Project } from '../../types/portfolio.ts';

interface ProjectsSectionProps {
  projects: Project[];
  categories: string[];
  onSelectProject: (project: Project) => void;
}

export function ProjectsSection({ projects, categories, onSelectProject }: ProjectsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Filter projects by category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'All') return projects;
    return projects.filter((p) => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  return (
    <section id="projects" className="py-20 md:py-28 px-6 max-w-7xl mx-auto border-t border-zinc-200/80">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
            Selected Works
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
            Featured Projects &amp; Studies
          </h2>
          <p className="text-sm text-zinc-500 max-w-xl">
            Selected Blender 3D modeling, environment design, and character studies with complete breakdown of topology, lighting, and assets.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100/80 rounded-sm">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
              selectedCategory === 'All'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            All Works ({projects.length})
          </button>
          {categories.map((cat) => {
            const count = projects.filter((p) => p.category === cat).length;
            if (count === 0 && selectedCategory !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-200 rounded-sm">
          <p className="text-sm text-zinc-500">No projects found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12">
          {filteredProjects.map((project, index) => {
            const isWide = index === 0 && filteredProjects.length > 2;

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`group cursor-pointer flex flex-col justify-between ${
                  isWide ? 'md:col-span-2' : ''
                }`}
              >
                {/* Artwork container */}
                <div className="relative overflow-hidden bg-zinc-100 border border-zinc-200/80 rounded-xs mb-4">
                  <div className={`w-full overflow-hidden ${isWide ? 'aspect-16/9' : 'aspect-4/3'}`}>
                    <img
                      src={project.thumbnail_url}
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
                      loading="lazy"
                    />
                  </div>

                  {/* Top indicators */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {project.blender_project_url && (
                      <span className="p-1.5 bg-black/75 backdrop-blur-xs text-white text-[11px] rounded-xs font-mono flex items-center gap-1 shadow-sm">
                        <Box className="w-3 h-3 text-amber-400" />
                        <span>.blend</span>
                      </span>
                    )}
                    {project.images && project.images.length > 1 && (
                      <span className="p-1.5 bg-black/75 backdrop-blur-xs text-white text-[11px] rounded-xs font-mono flex items-center gap-1 shadow-sm">
                        <Layers className="w-3 h-3" />
                        <span>+{project.images.length}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Project Metadata - Zero-pill discipline */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                    <span>{project.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{project.creation_date}</span>
                    {project.software_used && project.software_used.length > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="truncate max-w-[200px]">
                          {project.software_used.slice(0, 2).join(', ')}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                      {project.title}
                    </h3>
                    <div className="p-1 text-zinc-400 group-hover:text-zinc-900 transition-colors shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-zinc-600 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
