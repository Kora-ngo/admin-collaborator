"use client";

import { useEffect, useRef, useState } from "react";

interface SettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
  className?: string;
}

const SettingModal: React.FC<SettingModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  widthClass = "w-full max-w-4xl",
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isOpen]);

  // Focus modal when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => modalRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Reset drag state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDragY(0);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Handle touch events for swipe to close (mobile only)
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    
    // Only allow swipe from header area, not from scrollable content
    if (target.closest('.modal-body')) return;
    
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    // Only allow dragging down
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    // Close if dragged down more than 100px
    if (dragY > 100) {
      onClose();
    }
    
    // Reset
    setDragY(0);
  };

  return (
    <div
      aria-hidden={!isOpen}
      className="fixed inset-0 z-50 pointer-events-none"
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          isOpen ? "bg-gray-900/50 opacity-100 pointer-events-auto" : "opacity-0"
        }`}
      />

      {/* Desktop Modal (centered) - Hidden on mobile */}
<div className="hidden md:flex md:items-center md:justify-center md:h-full md:p-4 pointer-events-none">
        <div
          role="dialog"
          aria-modal="true"
          ref={modalRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className={`${widthClass} ${className} max-h-[90vh] transform transition-all duration-300 ease-out pointer-events-auto bg-white rounded-2xl shadow-2xl overflow-hidden ${
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="flex flex-col max-h-[90vh]">
            {/* Header */}
            {title && (
              <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-gray-200 bg-white">
                <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
                <button
                  aria-label="Close modal"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 text-3xl leading-none ml-4"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet - Shown only on mobile */}
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isOpen ? `translateY(${dragY}px)` : 'translateY(100%)',
          transition: isDragging ? 'none' : 'transform 300ms ease-out',
        }}
        className="md:hidden fixed left-0 right-0 bottom-0 h-[95vh] pointer-events-auto bg-white rounded-t-3xl shadow-2xl flex flex-col"
      >
        {/* Drag Handle */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex-shrink-0 px-6 pb-3 flex items-center justify-between border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 pr-4">{title}</h2>
            <button
              aria-label="Close modal"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body - Scrollable with fixed height */}
        <div className="modal-body flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingModal;