"use client";

import { useEffect, useRef, useState } from "react";
import { getSlides } from "./info-modal-slides";
import { useAuthStore } from "../../features/auth/store/authStore";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  dismissible?: boolean;
  fromRegistration?: boolean;
  userName?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  dismissible = true,
  fromRegistration = false,
  userName = "",
}) => {
  const { role } = useAuthStore();
  const slides = getSlides(role || "");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const isLast = currentSlide === slides.length - 1;
  const isFirst = currentSlide === 0;

  // Reset slide on open
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
      setTimeout(() => modalRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    if (isOpen) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev || ""; };
  }, [isOpen]);

  // Escape key (only if dismissible)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissible) onClose();
    };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, dismissible, onClose]);

  // Reset drag on close
  useEffect(() => {
    if (!isOpen) { setDragY(0); setIsDragging(false); }
  }, [isOpen]);

  const goTo = (index: number, dir: "next" | "prev") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setAnimating(false);
    }, 200);
  };

  const handleNext = () => {
    if (isLast) { onClose(); return; }
    goTo(currentSlide + 1, "next");
  };

  const handlePrev = () => {
    if (isFirst) return;
    goTo(currentSlide - 1, "prev");
  };

  // Swipe to close on mobile (from handle only)
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.modal-body')) return;
    startY.current = e.touches[0].clientY;
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) setDragY(diff);
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragY > 100 && dismissible) onClose();
    setDragY(0);
  };

  if (!isOpen) return null;

  const slide = slides[currentSlide];

  const slideTitle = fromRegistration && currentSlide === 0
    ? `Welcome${userName ? `, ${userName}` : ""}!`
    : slide.title;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Overlay - only clickable if dismissible */}
        <div
            onClick={dismissible ? onClose : undefined}
            className={`absolute inset-0 z-[61] bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300 ${
            dismissible ? "cursor-pointer" : "cursor-default"
            }`}
        />

      {/* ── DESKTOP (centered modal) ── */}
       <div className="hidden md:flex items-center justify-center h-full p-4 pointer-events-none z-[62] absolute inset-0">
        <div
          role="dialog"
          aria-modal="true"
          ref={modalRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg pointer-events-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        >
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            />
          </div>

          {/* Header */}
          <div className="px-6 pt-6 pb-2 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {slide.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  {currentSlide + 1} of {slides.length}
                </p>
                <h2 className="text-xl font-bold text-gray-900">{slideTitle}</h2>
              </div>
            </div>

            {/* Close only if dismissible */}
            {dismissible && (
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none mt-1">
                ✕
              </button>
            )}
          </div>

          {/* Slide dots */}
          <div className="flex justify-center gap-1.5 pt-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > currentSlide ? "next" : "prev")}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentSlide ? "w-6 bg-primary" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div
            className={`px-6 py-4 transition-all duration-200 ${
              animating
                ? direction === "next"
                  ? "opacity-0 translate-x-4"
                  : "opacity-0 -translate-x-4"
                : "opacity-100 translate-x-0"
            }`}
          >
            <p className="text-gray-500 text-sm leading-relaxed">{slide.description}</p>
            {slide.visual}
          </div>

          {/* Final slide message (registration only) */}
          {isLast && fromRegistration && (
            <div className="mx-6 mb-4 flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-primary flex-shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <p className="text-xs text-primary/80">
                <span className="font-semibold">Need a reminder?</span> You can always reopen this guide by clicking the <span className="font-semibold">ⓘ info button</span> in the top navigation bar.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 pb-6 flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              disabled={isFirst}
              className={`flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                isFirst
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              Previous
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 text-sm font-semibold px-5 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all"
            >
              {isLast ? "Got it!" : "Next"}
              {!isLast && (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE (bottom sheet) ── */}
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ transform: `translateY(${dragY}px)`, transition: isDragging ? "none" : "transform 300ms ease-out" }}
          className="md:hidden fixed left-0 right-0 bottom-0 h-[58vh] z-[62] bg-white rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
        >
        {/* Drag handle (only show if dismissible) */}
        {dismissible && (
          <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing flex-shrink-0">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
        )}
        {!dismissible && <div className="pt-4" />}

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 flex-shrink-0">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-2 flex items-start justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {slide.icon}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {currentSlide + 1} of {slides.length}
              </p>
              <h2 className="text-xl font-bold text-gray-900">{slideTitle}</h2>
            </div>
          </div>
          {dismissible && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none mt-1">
              ✕
            </button>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 pb-2 flex-shrink-0">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > currentSlide ? "next" : "prev")}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? "w-6 bg-primary" : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Scrollable Content */}
        <div
          className={`modal-body flex-1 overflow-y-auto px-6 py-2 transition-all duration-200 ${
            animating
              ? direction === "next"
                ? "opacity-0 translate-x-4"
                : "opacity-0 -translate-x-4"
              : "opacity-100 translate-x-0"
          }`}
        >
          <p className="text-gray-500 text-sm leading-relaxed">{slide.description}</p>
          {slide.visual}

          {isLast && fromRegistration && (
            <div className="mt-4 flex items-start gap-2 p-3 bg-primary/5 border border-primary/20 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 text-primary flex-shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
              </svg>
              <p className="text-xs text-primary/80">
                <span className="font-semibold">Need a reminder?</span> You can always reopen this guide by clicking the <span className="font-semibold">ⓘ info button</span> in the top navigation bar.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-8 pt-3 flex items-center justify-between gap-3 flex-shrink-0 border-t border-gray-100">
          <button
            onClick={handlePrev}
            disabled={isFirst}
            className={`flex items-center gap-1 text-sm font-medium px-4 py-2.5 rounded-xl transition-all ${
              isFirst ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Previous
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-1 text-sm font-semibold px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-all"
          >
            {isLast ? "Got it!" : "Next"}
            {!isLast && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoModal;