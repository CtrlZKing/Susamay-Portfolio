import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon, Link as LinkIcon, Loader2, Check } from 'lucide-react';
import { uploadMediaFile } from '../../lib/supabase.ts';
import { authStorage } from '../../lib/api.ts';

interface ImageUploadBoxProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectHint?: string;
  className?: string;
}

export function ImageUploadBox({
  label,
  value,
  onChange,
  aspectHint = 'JPG, PNG, WebP up to 25MB',
  className = '',
}: ImageUploadBoxProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, WebP, GIF, SVG).');
      return;
    }

    // Validate size (25MB)
    if (file.size > 25 * 1024 * 1024) {
      setError('Image file is larger than 25MB limit.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const token = authStorage.getToken() || undefined;
      const result = await uploadMediaFile(file, token);
      onChange(result.url);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    onChange(customUrl.trim());
    setCustomUrl('');
    setShowUrlInput(false);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <label className="font-medium text-zinc-700">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? 'Upload file instead' : 'Or paste URL'}
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://..."
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 px-3 py-2 text-xs border border-zinc-200 rounded-md focus:outline-none focus:border-zinc-900 bg-white"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-2 text-xs font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Apply
          </button>
        </div>
      ) : value ? (
        <div className="relative border border-zinc-200 rounded-md overflow-hidden bg-zinc-50 group">
          <img
            src={value}
            alt="Preview"
            referrerPolicy="no-referrer"
            className="w-full h-44 object-contain bg-zinc-100"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-zinc-900 text-xs font-medium rounded-md shadow-sm hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Replace Image
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-zinc-900 bg-zinc-50'
              : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-zinc-500 py-3">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-900" />
              <span className="text-xs font-medium">Uploading high-resolution image...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="p-2.5 rounded-full bg-zinc-100 text-zinc-600">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs text-zinc-600">
                <span className="font-medium text-zinc-900">Click to upload</span> or drag and drop
              </div>
              <p className="text-[11px] text-zinc-400">{aspectHint}</p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleInputChange}
      />

      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
