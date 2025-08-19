import React, { createContext, useContext, useState } from "react";
import { cn } from "../../lib/utils";

const SelectContext = createContext();

export function Select({ children, value, onValueChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);

  const handleValueChange = (newValue) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
    setIsOpen(false);
  };

  return (
    <SelectContext.Provider value={{ 
      isOpen, 
      setIsOpen, 
      selectedValue, 
      onValueChange: handleValueChange 
    }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className, children, ...props }) {
  const { isOpen, setIsOpen } = useContext(SelectContext);
  
  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 opacity-50"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6,9 12,15 18,9"></polyline>
      </svg>
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const { selectedValue } = useContext(SelectContext);
  return <span>{selectedValue || placeholder}</span>;
}

export function SelectContent({ className, children, ...props }) {
  const { isOpen } = useContext(SelectContext);
  
  if (!isOpen) return null;
  
  return (
    <div
      className={cn(
        "absolute top-full z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md animate-in fade-in-0 zoom-in-95 mt-1 w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SelectItem({ className, children, value, ...props }) {
  const { onValueChange } = useContext(SelectContext);
  
  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </div>
  );
}