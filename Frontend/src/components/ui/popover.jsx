import { useState, useRef, useEffect } from "react";
import { cn } from "../../lib/utils";

export function Popover({ children }) {
  return <div className="relative">{children}</div>;
}

export function PopoverTrigger({ children, ...props }) {
  return children;
}

export function PopoverContent({ className, children, ...props }) {
  const [open, setOpen] = useState(true);
  const ref = useRef();

  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute w-full z-[999] mt-1 rounded-md border bg-white shadow-md p-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
