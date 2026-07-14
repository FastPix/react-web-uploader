"use client";
import type { CSSProperties, ReactNode } from "react";
import { useUploaderContext } from "../../core/context";

export interface FastPixAbortButtonProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
}

export function FastPixAbortButton({ className, style, children }: FastPixAbortButtonProps) {
  const { state, abort, disabled } = useUploaderContext();
  const active = state === "resolving" || state === "uploading" || state === "paused";

  return (
    <button
      type="button"
      className={["fpx-button", "fpx-abort-button", className].filter(Boolean).join(" ")}
      style={style}
      onClick={() => abort()}
      disabled={disabled || !active}
    >
      {children ?? "Cancel"}
    </button>
  );
}