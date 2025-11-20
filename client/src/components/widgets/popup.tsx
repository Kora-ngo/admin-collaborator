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
}: PopupProps) {
  // Render state to keep component mounted while exit animation plays
  const [render, setRender] = useState(open);
  // animation state (controls which animation class to apply)
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setRender(true);
      // next tick -> play enter animation
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      // play exit animation
      setIsVisible(false);
      // after animation finishes, unmount
      const t = setTimeout(() => setRender(false), 220); // match CSS durations
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
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 ${
          isVisible ? "animate-backdrop-in" : "animate-backdrop-out"
        }`}
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-50 w-full max-w-lg rounded-lg bg-white shadow-xl
          ${isVisible ? "animate-popup-in" : "animate-popup-out"}`}
      >
        <div className="px-6 py-5">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                {icon}
              </div>
            )}
            <div className="w-full">
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              {description && (
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              )}
            </div>
          </div>

          {children && <div className="mt-4">{children}</div>}
        </div>

        {showFooter && (
          <div className="flex rounded-b-md justify-end gap-3 bg-gray-50 px-6 py-3">
            <button
              className="rounded-md bg-gray-300 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-400"
              onClick={onClose}
            >
              {cancelText}
            </button>

            {onConfirm && (
              <button
                className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${confirmButtonClass}`}
                onClick={onConfirm}
              >
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
