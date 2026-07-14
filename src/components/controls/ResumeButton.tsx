"use client";
import type { CSSProperties, ReactNode } from "react";
import { useUploaderContext } from "../../core/context";

export interface FastPixResumeButtonProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
}

export function FastPixResumeButton({ className, style, children }: FastPixResumeButtonProps) {
  const { state, resume, disabled } = useUploaderContext();
  return (
    <button
      type="button"
      className={["fpx-button", "fpx-resume-button", className].filter(Boolean).join(" ")}
      style={style}
      onClick={() => resume()}
      disabled={disabled || state !== "paused"}
    >
      {children ?? "Resume"}
    </button>
  );
}