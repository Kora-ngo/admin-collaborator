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

const SettingModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  widthClass = "w-full max-w-4xl rounded-2xl",
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

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isOpen]);

  // Focus modal
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => modalRef.current?.focus(), 80);
    }
  }, [isOpen]);

  return (
    <div
      aria-hidden={!isOpen}
      className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 transition-opacity duration-300 ${
          isOpen
            ? "bg-gray-900/50 opacity-100 pointer-events-auto"
            : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        ref={modalRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className={`
          pointer-events-auto bg-white shadow-2xl
          transform transition-all duration-300 ease-out
          ${widthClass} ${className}
          ${isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
      >
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          {title && (
            <div className="px-6 py-4 flex items-start justify-between border-b border-gray-100">
              <div className="text-2xl font-semibold text-gray-900">
                {title}
              </div>
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
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-6 border-t flex justify-end space-x-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingModal;
