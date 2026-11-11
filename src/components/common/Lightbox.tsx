import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: { url: string; title?: string; caption?: string; category?: string }[];
  currentIndex: number;
  onNavigate?: (index: number) => void;
}

export function Lightbox({ isOpen, onClose, images, currentIndex, onNavigate }: LightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onNavigate && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      }
      if (e.key === 'ArrowRight' && onNavigate && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || !images[currentIndex]) return null;

  const current = images[currentIndex];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 md:p-8 select-none transition-opacity duration-200"
      onClick={onClose}
    >
      {/* Top action bar */}
      <div 
        className="absolute top-4 left-4 right-4 md:top-6 md:left-8 md:right-8 flex items-center justify-between text-zinc-400 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-xs md:text-sm tracking-wide">
          <span className="font-mono text-zinc-300">
            {currentIndex + 1} / {images.length}
          </span>
          {current.category && (
            <>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-300">{current.category}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <a
            href={current.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-zinc-400 hover:text-white transition-colors"
            title="Open raw image"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Navigation buttons */}
      {images.length > 1 && onNavigate && (
        <>
          <button
            disabled={currentIndex === 0}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex - 1);
            }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-400 transition-colors z-10 cursor-pointer"
            title="Previous (Left arrow)"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            disabled={currentIndex === images.length - 1}
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(currentIndex + 1);
            }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-400 transition-colors z-10 cursor-pointer"
            title="Next (Right arrow)"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Main Image presentation */}
      <div 
        className="relative max-w-7xl max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.url}
          alt={current.title || 'Artwork preview'}
          referrerPolicy="no-referrer"
          className="max-h-[80vh] max-w-full object-contain rounded-sm shadow-2xl transition-all"
        />

        {(current.title || current.caption) && (
          <div className="mt-4 text-center max-w-2xl px-4">
            {current.title && (
              <h4 className="text-white font-medium text-sm md:text-base tracking-tight">
                {current.title}
              </h4>
            )}
            {current.caption && (
              <p className="text-zinc-400 text-xs md:text-sm mt-1 leading-relaxed">
                {current.caption}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
