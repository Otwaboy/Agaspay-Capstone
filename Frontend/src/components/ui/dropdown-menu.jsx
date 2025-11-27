import React, { createContext, useContext, useState, useRef } from "react";
import { cn } from "../../lib/utils";

const DropdownContext = createContext();

export function DropdownMenu({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen, triggerRef }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild, ...props }) {
  const { isOpen, setIsOpen, triggerRef } = useContext(DropdownContext);

  if (asChild) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onClick: () => setIsOpen(!isOpen),
      ...props
    });
  }

  return (
    <button ref={triggerRef} onClick={() => setIsOpen(!isOpen)} {...props}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ className, align = "start", children, side = "bottom", sideOffset = 4, ...props }) {
  const { isOpen, setIsOpen, triggerRef } = useContext(DropdownContext);

  if (!isOpen) return null;

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 transform -translate-x-1/2",
    end: "right-0",
  };

  // Get the trigger button position for better placement
  let style = {};

  if (triggerRef?.current && side === "top") {
    const rect = triggerRef.current.getBoundingClientRect();
    style = {
      position: 'fixed',
      bottom: `${window.innerHeight - rect.top + sideOffset}px`,
      minWidth: '8rem',
      zIndex: 9999,
    };

    if (align === "end") {
      style.right = `${window.innerWidth - rect.right}px`;
    } else if (align === "start") {
      style.left = `${rect.left}px`;
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setIsOpen(false)}
      />
      <div
        className={cn(
          triggerRef?.current && side === "top"
            ? "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md"
            : "absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md mt-1",
          alignClasses[align],
          className
        )}
        style={style}
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