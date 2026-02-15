"use client";

import React, { useEffect, useState } from "react";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmButtonClass?: string;
  children?: React.ReactNode;
  showFooter?: boolean;
  loading?: boolean;               // ← new prop
}

export default function Popup({
  open,
  onClose,
  title,
  description,
  icon,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  confirmButtonClass = "bg-red-500 hover:bg-red-400",
  children,
  showFooter = true,
  loading = false,                 // ← default false
}: PopupProps) {
  // Render state to keep component mounted while exit animation plays
  const [render, setRender] = useState(open);
  // animation state (controls which animation class to apply)
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setRender(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      const t = setTimeout(() => setRender(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (render) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [render, onClose]);

  if (!render) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4 sm:px-0">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 ${
          isVisible ? "animate-backdrop-in" : "animate-backdrop-out"
        }`}
        onClick={onClose}
      />

      {/* Modal panel – responsive width */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-50 w-full max-w-[90%] sm:max-w-lg rounded-lg bg-white shadow-xl
          ${isVisible ? "animate-popup-in" : "animate-popup-out"}`}
      >
        <div className="px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-red-500/10 flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="w-full">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h3>
              {description && (
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              )}
            </div>
          </div>

          {children && <div className="mt-4 sm:mt-5">{children}</div>}
        </div>

        {showFooter && (
          <div className="flex rounded-b-md justify-end gap-3 bg-gray-50 px-5 py-3 sm:px-6 sm:py-4">
            <button
              className={`rounded-md bg-gray-300 px-4 py-2 text-sm font-semibold text-white ${!loading && "hover:bg-gray-400"}`}
              onClick={onClose}
              disabled={loading}           // ← optional: prevent closing while loading
              type="button"
            >
              {cancelText}
            </button>

            {onConfirm && (
              <button
                className={`
                    rounded-md px-4 py-2 text-sm font-semibold text-white 
                    ${confirmButtonClass}
                    flex items-center justify-center gap-2 min-w-[100px]
                    ${loading ? 'opacity-80 cursor-no-drop' : 'hover:opacity-90'}
                  `}
                onClick={onConfirm}
                disabled={loading}
                type="button"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Please wait...</span>
                  </>
                ) : (
                  confirmText
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}