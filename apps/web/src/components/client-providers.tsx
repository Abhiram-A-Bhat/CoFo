"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/lib/toast-context";
import { ToastContainer } from "@/components/ui/toast";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastContainer />
    </ToastProvider>
  );
}
