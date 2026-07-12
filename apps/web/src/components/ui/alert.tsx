import * as React from "react";

import { cn } from "@/lib/utils";

const Alert = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative w-full rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground shadow-sm",
        className
      )}
      role="alert"
      {...props}
    />
  )
);
Alert.displayName = "Alert";

export { Alert };
