import { useState, useCallback, useEffect } from "react";

// Global toast state with subscribers
let toastId = 0;
const toastListeners = new Set();
let globalToasts = [];

function notifyListeners() {
  toastListeners.forEach(listener => listener());
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Subscribe to toast updates
    const listener = () => {
      setToasts([...globalToasts]);
    };
    
    toastListeners.add(listener);
    setToasts([...globalToasts]);
    
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  const toast = useCallback(({ title, description, variant = "default" }) => {
    const id = toastId++;
    const newToast = {
      id,
      title,
      description,
      variant,
      timestamp: Date.now(),
      dismiss: () => {
        globalToasts = globalToasts.filter(t => t.id !== id);
        notifyListeners();
      }
    };

    globalToasts.push(newToast);
    notifyListeners();

    // Auto remove after 5 seconds
    setTimeout(() => {
      globalToasts = globalToasts.filter(t => t.id !== id);
      notifyListeners();
    }, 5000);

    return newToast;
  }, []);

  return { toast, toasts };
}