"use client";
import type { CSSProperties, ReactNode } from "react";
import { useUploaderContext } from "../context";

export interface FastPixPauseButtonProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function FastPixPauseButton({ className, style, children }: FastPixPauseButtonProps) {
  const { state, pause, disabled } = useUploaderContext();
  return (
    <button
      type="button"
      className={["fpx-button", "fpx-pause-button", className].filter(Boolean).join(" ")}
      style={style}
      onClick={() => pause()}
      disabled={disabled || state !== "uploading"}
    >
      {children ?? "Pause"}
    </button>
  );
}