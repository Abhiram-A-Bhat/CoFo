"use client";
import { useEffect, useState } from "react";

export default function AnimatedCounter({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 2000; // milliseconds
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = timestamp - start;
      const ratio = Math.min(progress / duration, 1);
      setDisplay(Math.round(value * ratio));
      if (progress < duration) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
    return () => {
      // cleanup if needed
    };
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}
