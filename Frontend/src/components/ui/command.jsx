import { cn } from "../../lib/utils";

export function Command({ children, className }) {
  return <div className={cn("w-full", className)}>{children}</div>;
}

export function CommandInput({ value, onValueChange, placeholder }) {
  return (
    <input
      className="w-full border-b px-3 py-2 text-sm outline-none"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    />
  );
}

export function CommandEmpty({ children }) {
  return <div className="px-3 py-2 text-sm text-gray-500">{children}</div>;
}

export function CommandGroup({ children, className }) {
  return <div className={cn("py-1 max-h-[260px] overflow-y-auto", className)}>{children}</div>;
}

export function CommandItem({ children, onSelect, className }) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex justify-between items-center px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
