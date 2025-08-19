import { useState, useCallback } from "react";

const toasts = [];
let toastId = 0;

export function useToast() {
  const [, forceUpdate] = useState(0);

  const toast = useCallback(({ title, description, variant = "default" }) => {
    const id = toastId++;
    const newToast = {
      id,
      title,
      description,
      variant,
      timestamp: Date.now(),
    };

    toasts.push(newToast);
    forceUpdate(prev => prev + 1);

    // Auto remove after 5 seconds
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        forceUpdate(prev => prev + 1);
      }
    }, 5000);

    return {
      id,
      dismiss: () => {
        const index = toasts.findIndex(t => t.id === id);
        if (index > -1) {
          toasts.splice(index, 1);
          forceUpdate(prev => prev + 1);
        }
      },
    };
  }, []);

  return { toast, toasts };
}