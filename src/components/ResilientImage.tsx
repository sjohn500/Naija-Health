import React, { useState } from 'react';
import { HeartPulse, Droplet, Thermometer, ShieldAlert, Building2, Baby } from 'lucide-react';

export type VisualFallbackVariant = 'welcome' | 'ors' | 'sponging' | 'choking' | 'pregnancy' | 'hospital';

interface ResilientImageProps {
  src: string;
  alt: string;
  variant?: VisualFallbackVariant;
  className?: string;
  imgClassName?: string;
  loading?: 'eager' | 'lazy';
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  variant = 'welcome',
  className = '',
  imgClassName = 'w-full h-full object-cover',
  loading = 'eager',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const getFallbackVisual = () => {
    switch (variant) {
      case 'ors':
        return {
          tint: 'var(--blue-soft)',
          icon: <Droplet className="w-7 h-7" style={{ color: 'var(--blue)' }} />,
        };
      case 'sponging':
        return {
          tint: 'var(--amber-soft)',
          icon: <Thermometer className="w-7 h-7" style={{ color: 'var(--amber)' }} />,
        };
      case 'choking':
        return {
          tint: 'var(--teal-soft)',
          icon: <ShieldAlert className="w-7 h-7" style={{ color: 'var(--teal)' }} />,
        };
      case 'pregnancy':
        return {
          tint: 'var(--rose-soft)',
          icon: <Baby className="w-7 h-7" style={{ color: 'var(--rose)' }} />,
        };
      case 'hospital':
        return {
          tint: 'var(--danger-soft)',
          icon: <Building2 className="w-7 h-7" style={{ color: 'var(--danger)' }} />,
        };
      case 'welcome':
      default:
        return {
          tint: 'var(--brand-soft)',
          icon: <HeartPulse className="w-7 h-7" style={{ color: 'var(--brand)' }} />,
        };
    }
  };

  if (hasError || !src) {
    const fallback = getFallbackVisual();
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative flex flex-col items-center justify-center p-4 text-center ${className}`}
        style={{ background: fallback.tint }}
      >
        <div
          className="p-2.5 rounded-xl mb-2"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--line)',
          }}
        >
          {fallback.icon}
        </div>
        <span
          className="text-xs font-semibold max-w-[22ch] line-clamp-2"
          style={{ color: 'var(--ink-2)' }}
        >
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: 'var(--surface-2)' }}
    >
      {!isLoaded && (
        <div
          className="absolute inset-0 skeleton"
          aria-hidden="true"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${imgClassName} transition-opacity duration-200 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};
