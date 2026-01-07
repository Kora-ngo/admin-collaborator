// src/components/widgets/setting-modal.tsx (or wherever you keep it)

"use client";

import { useEffect, useRef, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
  className?: string;
}

const SettingModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  widthClass = "w-full max-w-4xl",
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Handle open/close with smooth animation
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Focus modal when open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen && !isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal Panel */}
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`
          relative ${widthClass} ${className}
          bg-white rounded-2xl shadow-2xl overflow-hidden
          transition-all duration-300 ease-out
          ${isVisible 
            ? "opacity-100 scale-100 translate-y-0" 
            : "opacity-0 scale-95 -translate-y-4"
          }
        `}
      >
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-4xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}

          {/* Body - scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingModal;