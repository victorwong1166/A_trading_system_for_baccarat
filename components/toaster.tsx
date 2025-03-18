"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-xs">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-4 rounded-md shadow-lg transition-all transform translate-y-0 opacity-100 ${
            toast.variant === "destructive"
              ? "bg-red-600 text-white"
              : toast.variant === "success"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-white"
          }`}
          role="alert"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{toast.title}</h3>
              {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
            </div>
            <button onClick={() => dismiss(toast.id)} className="ml-4 inline-flex text-white" aria-label="關閉">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
        </div>
      ))}
    </div>
  )
}

