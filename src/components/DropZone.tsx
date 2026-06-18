"use client";
import { useRef, useState } from "react";
import type { CSSProperties, DragEvent, ReactNode } from "react";
import { useUploaderContext } from "../context";

export interface FastPixDropZoneProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  overlay?: boolean;
}

export function FastPixDropZone({ className, style, children, overlay }: FastPixDropZoneProps) {
  const { selectFile, disabled } = useUploaderContext();
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  const reset = () => { depth.current = 0; setDragging(false); };

  const onDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    depth.current += 1;
    setDragging(true);
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    depth.current -= 1;
    if (depth.current <= 0) reset();
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    reset();
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) selectFile(f);
  };

  return (
    <div
      className={["fpx-dropzone", className].filter(Boolean).join(" ")}
      style={style}
      data-fpx-dragging={dragging ? "" : undefined}
      data-fpx-disabled={disabled ? "" : undefined}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
      {overlay && dragging && <div className="fpx-dropzone-overlay" aria-hidden="true" />}
    </div>
  );
}