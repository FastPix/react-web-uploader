"use client";
import type { CSSProperties, ReactNode } from "react";
import { useUploaderContext } from "../context";

export interface FastPixStartButtonProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

export function FastPixStartButton({ className, style, children }: FastPixStartButtonProps) {
  const { start, state, disabled } = useUploaderContext();
  const canStart = state === "ready" || state === "error";

  return (
    <button
      type="button"
      className={["fpx-button", "fpx-start-button", className].filter(Boolean).join(" ")}
      style={style}
      onClick={() => start()}
      disabled={disabled || !canStart}
    >
      {children ?? "Upload"}
    </button>
  );
}