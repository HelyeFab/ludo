"use client";

import React, { useEffect, useState } from "react";

export type AlertType = "success" | "error" | "info" | "warning";

interface AlertProps {
  type: AlertType;
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Alert({ type, message, duration = 5000, onClose }: AlertProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: "bg-gradient-to-br from-emerald-500 to-green-600",
      icon: "✓",
      shadow: "shadow-emerald-500/30",
    },
    error: {
      bg: "bg-gradient-to-br from-red-500 to-rose-600",
      icon: "✕",
      shadow: "shadow-red-500/30",
    },
    info: {
      bg: "bg-gradient-to-br from-blue-500 to-indigo-600",
      icon: "ℹ",
      shadow: "shadow-blue-500/30",
    },
    warning: {
      bg: "bg-gradient-to-br from-amber-500 to-orange-600",
      icon: "⚠",
      shadow: "shadow-amber-500/30",
    },
  };

  const style = typeStyles[type];

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md ${
        isExiting ? "animate-slide-out" : "animate-slide-in"
      }`}
    >
      <div
        className={`${style.bg} ${style.shadow} text-white px-6 py-4 rounded-3xl shadow-xl flex items-start gap-3`}
      >
        <span className="text-2xl flex-shrink-0">{style.icon}</span>
        <div className="flex-1">
          <p className="font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(onClose, 300);
          }}
          className="text-white/80 hover:text-white text-xl leading-none flex-shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// Toast container component to manage multiple alerts
interface ToastContainerProps {
  children: React.ReactNode;
}

export function ToastContainer({ children }: ToastContainerProps) {
  return <div className="fixed top-4 right-4 z-50 space-y-3">{children}</div>;
}
