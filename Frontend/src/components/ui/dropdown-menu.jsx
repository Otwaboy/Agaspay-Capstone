import React, { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils";

const DropdownContext = createContext();

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild, ...props }) {
  const { isOpen, setIsOpen } = useContext(DropdownContext);
  
  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => setIsOpen(!isOpen),
      ...props
    });
  }
  
  return (
    <button onClick={() => setIsOpen(!isOpen)} {...props}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ className, align = "start", children, ...props }) {
  const { isOpen, setIsOpen } = useContext(DropdownContext);
  
  if (!isOpen) return null;
  
  const alignClasses = {
    start: "left-0",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-0",
  };
  
  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setIsOpen(false)}
      />
      <div
        className={cn(
          "absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md mt-1",
          alignClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </>
  );
}

export function DropdownMenuItem({ className, children, onClick, ...props }) {
  const { setIsOpen } = useContext(DropdownContext);
  
  const handleClick = (e) => {
    onClick?.(e);
    setIsOpen(false);
  };
  
  return (
    <div
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({ className, ...props }) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold text-gray-900", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({ className, ...props }) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
      {...props}
    />
  );
}