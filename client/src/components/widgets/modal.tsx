import { useEffect, useRef, useState } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
  className?: string;
  mobileHeight?: "full" | "auto" | "large" | "medium" | "small";
  enableSwipeToClose?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  widthClass = "sm:w-[450px] lg:w-[520px] w-[90%] max-w-[95%]",
  className = "",
  mobileHeight = "large", // Default to large
  enableSwipeToClose = true,
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);

  // Get mobile height class
  const getMobileHeightClass = () => {
    switch (mobileHeight) {
      case "full":
        return "h-[100vh]";
      case "large":
        return "h-[85vh]";
      case "medium":
        return "h-[70vh]";
      case "small":
        return "h-[50vh]";
      case "auto":
        return "max-h-[90vh]";
      default:
        return "h-[85vh]";
    }
  };

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
    if (!enableSwipeToClose) return;
    const target = e.target as HTMLElement;
    
    // Only allow swipe from header area, not from scrollable content
    if (target.closest('.modal-body')) return;
    
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enableSwipeToClose || !isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;
    
    // Only allow dragging down
    if (diff > 0) {
      setDragY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!enableSwipeToClose) return;
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

      {/* Desktop Modal (side panel) - Hidden on mobile */}
      <div
        role="dialog"
        aria-modal="true"
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`hidden md:block absolute top-4 bottom-4 right-4 ${widthClass} ${className} transform transition-all duration-500 ease-in-out pointer-events-auto bg-white rounded-xl shadow-2xl ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          {title && (
            <div className="flex-shrink-0 p-4 sm:p-6 flex items-start justify-between border-b border-gray-200">
              <div className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</div>
              <button
                aria-label="Close modal"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-900 text-2xl leading-none ml-4"
              >
                ✕
              </button>
            </div>
          )}

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200 flex justify-end space-x-3">
              {footer}
            </div>
          )}
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
        className={`md:hidden fixed left-0 right-0 bottom-0 ${getMobileHeightClass()} pointer-events-auto bg-white rounded-t-3xl shadow-2xl flex flex-col`}
      >
        {/* Drag Handle */}
        <div className="flex-shrink-0 flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex-shrink-0 px-6 pb-4 flex items-start justify-between border-b border-gray-200">
            <div className="text-xl font-semibold text-gray-900 pr-4">{title}</div>
            <button
              aria-label="Close modal"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 text-2xl leading-none flex-shrink-0"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body - Scrollable with fixed height */}
        <div className="modal-body flex-1 overflow-y-auto px-6 py-4 overscroll-contain">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-white">
            <div className="flex flex-col space-y-2">
              {footer}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;