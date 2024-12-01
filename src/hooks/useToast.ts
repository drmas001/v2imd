import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastOptions {
  title: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(({ title, message, type, duration = 5000 }: ToastOptions) => {
    const id = Math.random().toString(36).substr(2, 9);
    const toast: Toast = { id, title, message, type, duration };
    
    setToasts(current => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(current => current.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    dismissToast
  };
};