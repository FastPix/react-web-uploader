"use client";
import type { CSSProperties } from "react";
import { useUploaderContext } from "../context";

export interface FastPixTrackProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly variant?: "linear" | "radial";
  readonly showLabel?: boolean;
}

export function FastPixTrack({ className, style, variant = "linear", showLabel }: FastPixTrackProps) {
  const { progress } = useUploaderContext();
  const pct = Math.min(100, Math.max(0, Math.round(progress)));

  if (variant === "radial") {
    const r = 42;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - pct / 100);
    return (
      <div className={["fpx-track", "fpx-track-radial", className].filter(Boolean).join(" ")} style={style}>
        <svg viewBox="0 0 100 100" className="fpx-radial-svg">
          <circle className="fpx-radial-bg" cx="50" cy="50" r={r} />
          <circle
            className="fpx-radial-fill"
            cx="50" cy="50" r={r}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {showLabel && <span className="fpx-track-label">{pct}%</span>}
      </div>
    );
  }

  return (
    <div className={["fpx-track", className].filter(Boolean).join(" ")} style={style}>
      <div className="fpx-track-bar">
        <div className="fpx-track-fill" /> {/* width: var(--fpx-progress) — set in CSS */}
      </div>
      {showLabel && <span className="fpx-track-label">{pct}%</span>}
    </div>
  );
}