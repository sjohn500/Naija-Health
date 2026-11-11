import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  /** milliseconds */
  delay?: number;
  /** animate children one after another instead of the wrapper itself */
  stagger?: boolean;
  className?: string;
  as?: 'div' | 'section' | 'ul' | 'article';
  id?: string;
}

/**
 * Reveals content when it scrolls into view, once.
 * Falls back to visible immediately when IntersectionObserver is missing or
 * when the user prefers reduced motion (the CSS also neutralises the transition).
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  stagger = false,
  className = '',
  as = 'div',
  id,
}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as as any;
  return (
    <Tag
      id={id}
      ref={ref as any}
      className={`${stagger ? 'stagger' : 'reveal'} ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
};
