import React, { useEffect, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'no_network';

export interface ToastProps {
  title: string;
  message: string;
  variant?: ToastVariant;
  isOpen: boolean;
  onClose: () => void;
  autoClose?: number;
  className?: string;
}

const variantStyles: Record<ToastVariant, {
  iconBg: string;
  iconColor: string;
  progressColor: string;
  iconPath: string;
  iconType: 'fill' | 'stroke';
}> = {
  success: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    progressColor: 'bg-green-500',
    iconPath: 'M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z',
    iconType: 'fill',
  },
  error: {
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    progressColor: 'bg-red-500',
    iconPath: 'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75Zm0-7.5a.75.75 0 1 1 1.5 0v1.5a.75.75 0 0 1-1.5 0V8.25Z',
    iconType: 'fill',
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    progressColor: 'bg-amber-500',
    iconPath: 'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75Zm0-7.5a.75.75 0 1 1 1.5 0v1.5a.75.75 0 0 1-1.5 0V8.25Z',
    iconType: 'fill',
  },
  info: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    progressColor: 'bg-blue-500',
    iconPath: 'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75Zm0-6.75a.75.75 0 1 1 1.5 0V9a.75.75 0 0 1-1.5 0V8.25Z',
    iconType: 'fill',
  },
  no_network: {
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
    progressColor: 'bg-gray-400',
    // This is an outline-style path (arcs + a slash) — must be stroked,
    // not filled, or it renders as near-invisible slivers.
    iconPath: "m3 3 8.735 8.735m0 0a.374.374 0 1 1 .53.53m-.53-.53.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 0 1 0 5.304m2.121-7.425a6.75 6.75 0 0 1 0 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 0 1-1.06-2.122m-1.061 4.243a6.75 6.75 0 0 1-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12Z",
    iconType: 'stroke',
  },
};

const Toast: React.FC<ToastProps> = ({
  title,
  message,
  variant = 'success',
  isOpen,
  onClose,
  autoClose = 4000,
  className = '',
}) => {
  const [visible, setVisible] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setProgressKey((k) => k + 1);

      if (autoClose > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          setTimeout(onClose, 300);
        }, autoClose);
        return () => clearTimeout(timer);
      }
    } else {
      setVisible(false);
    }
  }, [isOpen, autoClose, onClose]);

  const styles = variantStyles[variant];

  if (!visible && !isOpen) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        fixed bottom-6 sm:bottom-8 z-50
        max-w-[90%] sm:max-w-sm w-full
        left-1/2 -translate-x-1/2
        sm:left-auto sm:right-5 sm:translate-x-0
        transition-all duration-300 ease-out
        ${visible
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 translate-y-3 scale-95 pointer-events-none'
        }
        ${className}
      `}
    >
      <div className="relative overflow-hidden flex items-start gap-3 rounded-2xl shadow-lg shadow-black/10 border border-gray-100 bg-gray-50 px-4 py-3.5">

        {/* Icon badge */}
        <div className={`flex-shrink-0 flex items-center justify-center size-9 rounded-full ${styles.iconBg}`}>
          {styles.iconType === 'stroke' ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className={`size-5 ${styles.iconColor}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d={styles.iconPath} />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={`size-5 ${styles.iconColor}`}
            >
              <path fillRule="evenodd" d={styles.iconPath} clipRule="evenodd" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">{title}</h3>
          <p className="text-sm text-gray-600 mt-0.5 break-words leading-snug">{message}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors -mt-1 -mr-1"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Progress bar */}
        {autoClose > 0 && (
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-100">
            <div
              key={progressKey}
              className={`h-full ${styles.progressColor}`}
              style={{
                animation: `toast-shrink ${autoClose}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes toast-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Toast;