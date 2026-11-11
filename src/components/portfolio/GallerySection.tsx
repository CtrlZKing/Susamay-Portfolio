import { useState, useMemo } from 'react';
import { Maximize2 } from 'lucide-react';
import { GalleryImage } from '../../types/portfolio.ts';

interface GallerySectionProps {
  gallery: GalleryImage[];
  onOpenLightbox: (images: { url: string; title?: string; caption?: string; category?: string }[], index: number) => void;
}

export function GallerySection({ gallery, onOpenLightbox }: GallerySectionProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Extract unique categories from gallery
  const categories = useMemo(() => {
    const set = new Set(gallery.map((g) => g.category));
    return ['All', ...Array.from(set)];
  }, [gallery]);

  const filteredItems = useMemo(() => {
    if (selectedFilter === 'All') return gallery;
    return gallery.filter((item) => item.category === selectedFilter);
  }, [gallery, selectedFilter]);

  const handleItemClick = (index: number) => {
    const formatted = filteredItems.map((item) => ({
      url: item.image_url,
      title: item.title,
      caption: item.description,
      category: item.category,
    }));
    onOpenLightbox(formatted, index);
  };

  return (
    <section id="gallery" className="py-20 md:py-28 px-6 max-w-7xl mx-auto border-t border-zinc-200/80">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-mono">
            Visual Index
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-zinc-900">
            Artwork &amp; Render Gallery
          </h2>
          <p className="text-sm text-zinc-500 max-w-xl">
            A curated visual archive of lighting studies, hard-surface detailing, viewport renders, and organic sculpting experiments.
          </p>
        </div>

        {/* Filter controls */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100/80 rounded-sm">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                  selectedFilter === cat
                    ? 'bg-white text-zinc-900 shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Responsive Masonry / Clean Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-zinc-200 rounded-sm">
          <p className="text-sm text-zinc-500">No gallery images found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(index)}
              className="group relative overflow-hidden bg-zinc-100 border border-zinc-200/80 rounded-xs cursor-pointer flex flex-col justify-between"
            >
              <div className="aspect-4/3 w-full overflow-hidden bg-zinc-950">
                <img
                  src={item.image_url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-103"
                />
              </div>

              {/* Hover overlay hint */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-black/60 backdrop-blur-xs text-white rounded-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>

              {/* Text caption footer */}
              <div className="p-4 bg-white border-t border-zinc-100 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                  <span>{item.category}</span>
                  {item.software && <span>{item.software}</span>}
                </div>
                <h4 className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-zinc-500 line-clamp-1 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
