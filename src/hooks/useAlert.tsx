"use client";

import { useState, useCallback } from "react";
import { AlertType } from "@/components/ui/Alert";

export interface AlertState {
  id: string;
  type: AlertType;
  message: string;
}

export function useAlert() {
  const [alerts, setAlerts] = useState<AlertState[]>([]);

  const showAlert = useCallback((type: AlertType, message: string) => {
    const id = crypto.randomUUID();
    setAlerts((prev) => [...prev, { id, type, message }]);
    return id;
  }, []);

  const hideAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const success = useCallback(
    (message: string) => showAlert("success", message),
    [showAlert]
  );

  const error = useCallback(
    (message: string) => showAlert("error", message),
    [showAlert]
  );

  const info = useCallback(
    (message: string) => showAlert("info", message),
    [showAlert]
  );

  const warning = useCallback(
    (message: string) => showAlert("warning", message),
    [showAlert]
  );

  return {
    alerts,
    showAlert,
    hideAlert,
    success,
    error,
    info,
    warning,
  };
}
