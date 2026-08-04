"use client";
import type { CSSProperties } from "react";

import { useUploaderContext } from "../../core/context";

export interface FastPixTrackProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly variant?: "linear" | "radial";
  readonly showLabel?: boolean;
}

export function FastPixTrack({
  className,
  style,
  variant = "linear",
  showLabel,
}: FastPixTrackProps) {
  const { progress } = useUploaderContext();
  const pct = Math.min(100, Math.max(0, Math.round(progress)));

  if (variant === "radial") {
    const r = 42;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - pct / 100);
    return (
      <div
        className={["fastpix-track", "fastpix-track-radial", className].filter(Boolean).join(" ")}
        style={style}
      >
        <svg viewBox="0 0 100 100" className="fastpix-radial-svg">
          <circle className="fastpix-radial-bg" cx="50" cy="50" r={r} />
          <circle
            className="fastpix-radial-fill"
            cx="50"
            cy="50"
            r={r}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        {showLabel && <span className="fastpix-track-label">{pct}%</span>}
      </div>
    );
  }

  return (
    <div className={["fastpix-track", className].filter(Boolean).join(" ")} style={style}>
      <div className="fastpix-track-bar">
        <div className="fastpix-track-fill" /> {/* width: var(--fastpix-progress) — set in CSS */}
      </div>
      {showLabel && <span className="fastpix-track-label">{pct}%</span>}
    </div>
  );
}
