import React, { useEffect } from 'react';
import Toast from '../components/widgets/toast';
import { useToastStore } from '../store/toastStore';
import { getMessage } from './getMessage';

const GlobalToast: React.FC = () => {
  const { toast, hideToast } = useToastStore();

  // Auto-hide after duration (if specified in the toast message)
  useEffect(() => {
    if (toast?.show && toast?.autoClose !== false) {
      const timer = setTimeout(() => {
        hideToast();
      }, toast.autoClose || 4000); // Default 4 seconds

      return () => clearTimeout(timer);
    }
  }, [toast?.show, toast?.autoClose, hideToast]);

  // If no toast or not shown → render nothing
  if (!toast || !toast.show) return null;

  // ← Safely get title
  const title = toast.title || 
    (toast.type 
      ? toast.type.charAt(0).toUpperCase() + toast.type.slice(1) 
      : "Notification"
    );

  return (
    <Toast
      title={title}
      message={getMessage(toast.message) || "No message"}
      variant={toast.type || "info"}
      isOpen={true}
      onClose={hideToast}
      autoClose={toast.autoClose || 4000} // Optional: let individual toasts override duration
    />
  );
};

export default GlobalToast;