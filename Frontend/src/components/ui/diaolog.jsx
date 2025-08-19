import React, { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils";

const DialogContext = createContext();

export function Dialog({ children, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(open || false);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <DialogContext.Provider value={{ isOpen, onOpenChange: handleOpenChange }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => handleOpenChange(false)}
          />
          <div className="relative">
            {children}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function DialogContent({ className, children, ...props }) {
  const { isOpen } = useContext(DialogContext);
  
  if (!isOpen) return null;
  
  return (
    <div
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-gray-200 bg-white p-6 shadow-lg duration-200 rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm text-gray-600", className)} {...props} />
  );
}

export function DialogFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
      {...props}
    />
  );
}