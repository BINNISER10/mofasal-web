'use client';
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showClose = true,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#00373E]/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full animate-slide-up',
          // Background
          'bg-white dark:bg-slate-800',
          // Border
          'border border-[#D0D6D7]/30 dark:border-slate-700',
          // Shadow
          'shadow-[0_8px_32px_rgba(0,55,62,0.15),0_2px_8px_rgba(0,55,62,0.1)]',
          // Rounded
          'rounded-2xl overflow-hidden',
          sizes[size]
        )}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between p-5 border-b border-[#D0D6D7]/20 dark:border-slate-700 bg-gradient-to-l from-[#F2E8D4]/20 to-transparent">
            {title && (
              <h3 className="text-lg font-bold text-[#00373E] dark:text-slate-100">{title}</h3>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[#481719]/10 text-[#735B4D]/60 hover:text-[#481719] transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-5 border-t border-[#D0D6D7]/20 dark:border-slate-700 bg-[#F2E8D4]/10">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
