/**
 * Sheet Component
 * 
 * A slide-in panel from the right side of the screen.
 * Used for forms, details, and configuration panels.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/hooks/useIcon';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const widthClasses = {
  sm: 'w-[320px]',
  md: 'w-[400px]',
  lg: 'w-[480px]',
  xl: 'w-[560px]',
  full: 'w-full max-w-[600px]',
};

export function Sheet({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  width = 'lg',
}: SheetProps) {
  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sheet is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Panel */}
      <div
        className={cn(
          'absolute top-0 right-0 h-full bg-[#0D0F0E] border-l border-[#252726] shadow-2xl flex flex-col',
          'animate-in slide-in-from-right duration-300 ease-out',
          widthClasses[width],
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#252726] flex items-start justify-between shrink-0">
          <div>
            <h2
              id="sheet-title"
              className="text-xl font-bold text-white tracking-tight"
            >
              {title}
            </h2>
            {description && (
              <p className="text-sm text-[#9CA3AF] mt-1 font-medium">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-white transition-colors p-1 rounded-md hover:bg-[#1C1E1D]"
            aria-label="Close sheet"
          >
            <Icon name="CancelIcon" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-[#252726] scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Sheet;
