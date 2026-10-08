import React, { useState, useEffect, useRef, memo } from 'react';
import { X } from 'lucide-react';

interface CertificationTooltipProps {
  title: string;
  code: string;
  definition: string;
  accentColor?: '#00B8D4' | '#1E4FD8' | '#F39C12';
  position?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
}

export const CertificationTooltip: React.FC<CertificationTooltipProps> = memo(({
  title,
  code,
  definition,
  accentColor = '#00B8D4',
  position = 'top',
  align = 'center',
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideTouch = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideTouch, { passive: true });
    document.addEventListener('touchstart', handleOutsideTouch, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutsideTouch);
      document.removeEventListener('touchstart', handleOutsideTouch);
    };
  }, [isOpen]);

  const positionClasses =
    position === 'top' ? 'sm:bottom-full sm:mb-2.5' : 'sm:top-full sm:mt-2.5';

  const alignClasses =
    align === 'start'
      ? 'sm:left-0 sm:translate-x-0'
      : align === 'end'
      ? 'sm:right-0 sm:left-auto sm:translate-x-0'
      : 'sm:left-1/2 sm:-translate-x-1/2';

  return (
    <span
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={() => setIsOpen(false)}
    >
      <span
        tabIndex={0}
        role="button"
        aria-expanded={isOpen}
        aria-label={`${title} (${code}): ${definition}`}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false);
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className="inline-flex items-center gap-1.5 min-h-[36px] sm:min-h-0 py-1 sm:py-0 cursor-help focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00B8D4] rounded-[4px]"
      >
        {children}
      </span>

      {isOpen && (
        <span
          role="tooltip"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          className={`
            fixed left-4 right-4 bottom-5 z-50
            sm:absolute sm:bottom-auto sm:left-auto sm:right-auto
            ${positionClasses} ${alignClasses}
            sm:w-80 p-4 sm:p-3.5
            bg-[#0A1F44] text-white
            rounded-[6px] sm:rounded-[4px] border border-white/25 border-t-[3px]
            ${
              accentColor === '#1E4FD8'
                ? 'border-t-[#1E4FD8]'
                : accentColor === '#F39C12'
                ? 'border-t-[#F39C12]'
                : 'border-t-[#00B8D4]'
            }
            shadow-[0_20px_48px_-8px_rgba(10,31,68,0.65)]
            text-left
            transition-opacity duration-150 opacity-100
          `}
        >
          <span className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-white/15">
            <span className="font-display text-xs font-bold text-white tracking-tight">
              {title}
            </span>
            <span className="inline-flex items-center gap-1.5 shrink-0">
              <span className="font-mono text-[10px] font-semibold text-[#00B8D4] tabular-nums">
                {code}
              </span>
              <X className="w-3.5 h-3.5 text-white/60 sm:hidden" />
            </span>
          </span>
          <span className="block font-sans text-xs text-white/90 leading-relaxed font-normal">
            {definition}
          </span>
        </span>
      )}
    </span>
  );
});
CertificationTooltip.displayName = 'CertificationTooltip';
