import React, { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils";

const SheetContext = createContext();

export function Sheet({ children, open, onOpenChange }) {
  const [isOpen, setIsOpen] = useState(open || false);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  return (
    <SheetContext.Provider value={{ isOpen, onOpenChange: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({ children, asChild, ...props }) {
  const { onOpenChange } = useContext(SheetContext);
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true),
      ...props
    });
  }
  
  return (
    <button onClick={() => onOpenChange(true)} {...props}>
      {children}
    </button>
  );
}

export function SheetContent({ className, side = "right", children, ...props }) {
  const { isOpen, onOpenChange } = useContext(SheetContext);
  
  if (!isOpen) return null;
  
  const sideClasses = {
    left: "left-0 h-full w-3/4 sm:w-1/3",
    right: "right-0 h-full w-3/4 sm:w-1/3",
    top: "top-0 w-full h-3/4",
    bottom: "bottom-0 w-full h-3/4",
  };
  
  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-black/50" 
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "fixed z-50 bg-white shadow-lg transition-transform duration-200",
          sideClasses[side],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
}