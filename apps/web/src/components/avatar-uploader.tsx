"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { AxiosError } from "axios";

type AvatarUploaderProps = {
  storageKey: string;
  initials: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  label?: string;
  // Server-provided URL (takes priority over localStorage)
  serverSrc?: string | null;
  // Called after a successful server upload returns a new URL
  onServerUpload?: (file: File) => Promise<{ url: string | null }>;
};

const SIZE_MAP = {
  sm:  "h-12 w-12 text-sm",
  md:  "h-20 w-20 text-xl",
  lg:  "h-24 w-24 text-2xl",
};

const SHAPE_MAP = {
  circle:  "rounded-full",
  rounded: "rounded-2xl",
};

export function AvatarUploader({
  storageKey,
  initials,
  size = "md",
  shape = "circle",
  label,
  serverSrc,
  onServerUpload,
}: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Priority: serverSrc → localStorage → null
  const cached = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
  const [src, setSrc] = useState<string | null>(serverSrc ?? cached);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }
    
    // Enforce 2MB size limit to prevent localStorage or server payload limit issues
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("Image must be smaller than 2MB.");
      return;
    }

    setUploading(true);

    // Optimistic preview immediately from local FileReader
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setSrc(dataUrl);
      localStorage.setItem(storageKey, dataUrl);

      // Attempt server upload if handler provided
      if (onServerUpload) {
        try {
          const result = await onServerUpload(file);
          if (result.url) {
            // Replace local cache with final CDN url
            setSrc(result.url);
            localStorage.removeItem(storageKey); // no longer needed
          }
        } catch (err) {
          // Server upload failed — base64 localStorage copy stays as fallback
          if (err instanceof AxiosError && err.response?.status !== 404) {
            console.warn("Avatar upload failed, using local fallback:", err.message);
          }
        }
      }

      setUploading(false);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group">
        <div
          className={`
            ${SIZE_MAP[size]} ${SHAPE_MAP[shape]}
            relative overflow-hidden
            border-2 border-white/10 bg-emerald-500/10
            flex items-center justify-center
            font-bold text-emerald-400
            cursor-pointer select-none
            transition-all duration-200 group-hover:border-emerald-500/40
          `}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-white/60" />
          ) : src ? (
            <img src={src} alt="avatar" className="h-full w-full object-cover" />
          ) : (
            <span>{initials}</span>
          )}

          {/* Hover camera overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Camera className="h-4 w-4 text-white" />
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {label && (
        <span className="text-[11px] text-white/30">{label}</span>
      )}
    </div>
  );
}
