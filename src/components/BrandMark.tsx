import React from 'react';

interface BrandMarkProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'md', className = '' }) => {
  const dimensions =
    size === 'xs'
      ? { width: 24, height: 24, borderRadius: 7 }
      : size === 'sm'
      ? { width: 34, height: 34, borderRadius: 10 }
      : size === 'lg'
      ? { width: 44, height: 44, borderRadius: 13 }
      : { width: 40, height: 40, borderRadius: 11 };

  const svgSize = size === 'xs' ? 15 : size === 'sm' ? 20 : size === 'lg' ? 26 : 23;

  return (
    <span
      className={`brand-mark ${className}`.trim()}
      style={dimensions}
      aria-hidden="true"
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M14.5 6C14.5 5.17157 15.1716 4.5 16 4.5H20C20.8284 4.5 21.5 5.17157 21.5 6V14.5H30C30.8284 14.5 31.5 15.1716 31.5 16V20C31.5 20.8284 30.8284 21.5 30 21.5H21.5V30C21.5 30.8284 20.8284 31.5 20 31.5H16C15.1716 31.5 14.5 30.8284 14.5 30V21.5H6C5.17157 21.5 4.5 20.8284 4.5 20V16C4.5 15.1716 5.17157 14.5 6 14.5H14.5V6Z"
          fill="currentColor"
        />
        <path
          d="M6.5 18H12.2L14.8 12.2L18.2 23.6L21.3 15.2L23.4 18H29.5"
          stroke="var(--brand)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};
