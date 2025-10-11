import { useToast } from "../../hooks/use-toast";
import { cn } from "../../lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    // FIX: Changed position from "top-4 right-4" to "top-4 left-1/2 -translate-x-1/2" - centers toast notifications at top of screen
    // FIX: z-index set to z-[9999] - ensures toasts appear above dialogs/modals
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-full max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            // FIX: Added "animate-in slide-in-from-top-5" for smooth slide animation when toast appears
            "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-10 shadow-lg transition-all animate-in slide-in-from-top-5",
            {
              "bg-white border-gray-200": toast.variant === "default",
              "bg-red-50 border-red-200": toast.variant === "destructive",
            }
          )}
        >
          {/* FIX: Added flex-1 to allow text to take remaining space */}
          <div className="grid gap-1 flex-1">
            {toast.title && (
              <div className="text-sm font-semibold text-gray-900">{toast.title}</div>
            )}
            {toast.description && (
              <div className="text-sm text-gray-600">{toast.description}</div>
            )}
          </div>
          <button
            className="absolute right-2 top-2 rounded-md p-1 text-gray-400 hover:text-gray-900 transition-colors"
            onClick={() => toast.dismiss?.()}
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}