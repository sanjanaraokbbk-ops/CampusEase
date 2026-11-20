import { useState } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ProductImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackTitle,
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#F7F5FC] to-[#E9E2F8] text-[#3B1D6E] p-4 text-center"
        role="img"
        aria-label={alt}
      >
        <Package className="w-8 h-8 mb-2 opacity-60" strokeWidth={1.6} />
        {fallbackTitle && (
          <span className="text-xs font-medium text-[#4C278C]/80 line-clamp-2 max-w-[160px]">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
      loading="lazy"
    />
  );
}
