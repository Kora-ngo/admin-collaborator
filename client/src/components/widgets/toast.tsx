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
  iconColor: string; 
  bgColor: string;
  borderColor: string;
  iconPath: string 
}> = {
  success: {
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconPath: 'M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z',
  },
  error: {
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconPath: 'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75Zm0-7.5a.75.75 0 1 1 1.5 0v1.5a.75.75 0 0 1-1.5 0V8.25Z',
  },
  warning: {
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconPath: 'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 1.5 0v4.5a.75.75 0 0 1-.75.75Zm0-7.5a.75.75 0 1 1 1.5 0v1.5a.75.75 0 0 1-1.5 0V8.25Z',
  },
  info: {
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconPath: 'M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 0 1-.75-.75v-3a.75.75 0 0 1 1.5 0v3a.75.75 0 0 1-.75.75Zm0-6.75a.75.75 0 1 1 1.5 0V9a.75.75 0 0 1-1.5 0V8.25Z',
  },

  no_network: {
    iconColor: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-blue-200',
    iconPath: 'm3 3 8.735 8.735m0 0a.374.374 0 1 1 .53.53m-.53-.53.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 0 1 0 5.304m2.121-7.425a6.75 6.75 0 0 1 0 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 0 1-1.06-2.122m-1.061 4.243a6.75 6.75 0 0 1-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12Z',
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

  useEffect(() => {
    if (isOpen) {
      setVisible(true);

      if (autoClose > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          setTimeout(onClose, 300); // Allow exit animation
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
      className={`fixed bottom-8 right-5 z-50 max-w-sm w-full transition-all duration-500 ease-in-out ${
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none'
      } ${className}`}
    >
      <div
        className={`flex items-center gap-4 rounded-xl shadow-xl px-5 py-4 border ${styles.bgColor} ${styles.borderColor}`}
      >

        {/* Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`size-10 flex-shrink-0 ${styles.iconColor}`}
        >
          <path fillRule="evenodd" d={styles.iconPath} clipRule="evenodd" />
        </svg>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
          <p className="text-sm text-gray-700 mt-1 break-words">{message}</p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-4 text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
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
      </div>
    </div>
  );
};

export default Toast;