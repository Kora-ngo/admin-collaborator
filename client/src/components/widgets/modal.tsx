import { useEffect, useRef } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  widthClass?: string;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  widthClass = "sm:w-[450px] lg:w-[500px] w-full rounded-xl",
  className = "",
}) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div
      aria-hidden={!isOpen}
      className="fixed inset-0 z-40 pointer-events-none"
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
          isOpen ? "bg-gray-900/50 opacity-100 pointer-events-auto" : "opacity-0"
        }`}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`absolute top-4 bottom-4 right-4 ${widthClass} ${className} transform transition-all duration-500 ease-in-out pointer-events-auto bg-white rounded shadow-2xl ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          {title && (
            <div className="p-4 sm:p-6  flex items-start justify-between">
              <div className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</div>
              <button
                aria-label="Close modal"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end space-x-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;