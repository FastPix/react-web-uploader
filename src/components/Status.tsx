"use client";
import type { CSSProperties } from "react";
import { useUploaderContext } from "../context";
import type { UploaderState, UploaderError } from "../types";

export interface FastPixStatusProps {
  className?: string;
  style?: CSSProperties;
  labels?: Partial<Record<UploaderState, string>>;
}

export function FastPixStatus({ className, style, labels }: FastPixStatusProps) {
  const { state, error, progress, file } = useUploaderContext();
  const text = labels?.[state] ?? defaultLabel(state, { progress, file, error });

  return (
    <span
      className={["fpx-status", className].filter(Boolean).join(" ")}
      style={style}
      data-fpx-state={state}
      role="status"
      aria-live="polite"
    >
      {text}
    </span>
  );
}

function defaultLabel(
  state: UploaderState,
  ctx: { progress: number; file: File | null; error: UploaderError | null }
): string {
  switch (state) {
    case "idle":      return "Select a file to upload";
    case "ready":     return ctx.file ? ctx.file.name : "Ready to upload";
    case "resolving": return "Preparing…";
    case "uploading": return `Uploading… ${Math.round(ctx.progress)}%`;
    case "paused":    return "Paused";
    case "error":     return ctx.error?.message ?? "Upload failed";
    case "success":   return "Upload complete";
    default:          return "";
  }
}