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
          gradient: 'from-sky-50 via-emerald-50 to-teal-100',
          icon: <Droplet className="w-8 h-8 text-sky-700" />,
        };
      case 'sponging':
        return {
          gradient: 'from-amber-50 via-stone-50 to-emerald-50',
          icon: <Thermometer className="w-8 h-8 text-amber-700" />,
        };
      case 'choking':
        return {
          gradient: 'from-emerald-50 via-teal-50 to-stone-100',
          icon: <ShieldAlert className="w-8 h-8 text-emerald-700" />,
        };
      case 'pregnancy':
        return {
          gradient: 'from-rose-50 via-emerald-50 to-stone-100',
          icon: <Baby className="w-8 h-8 text-rose-700" />,
        };
      case 'hospital':
        return {
          gradient: 'from-emerald-900 via-[#05472A] to-teal-900 text-white',
          icon: <Building2 className="w-8 h-8 text-emerald-200" />,
        };
      case 'welcome':
      default:
        return {
          gradient: 'from-emerald-50 via-[#F4F9F6] to-stone-100',
          icon: <HeartPulse className="w-8 h-8 text-[#008751]" />,
        };
    }
  };

  if (hasError || !src) {
    const fallback = getFallbackVisual();
    return (
      <div
        role="img"
        aria-label={alt}
        className={`relative flex flex-col items-center justify-center bg-gradient-to-br ${fallback.gradient} p-4 text-center ${className}`}
      >
        <div className="p-3 rounded-2xl bg-white/80 backdrop-blur-xs border border-stone-200/70 shadow-2xs mb-2">
          {fallback.icon}
        </div>
        <span className="text-xs font-semibold text-stone-700 max-w-[22ch] line-clamp-2">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-stone-100 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-stone-100 via-stone-200/60 to-stone-100" />
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
