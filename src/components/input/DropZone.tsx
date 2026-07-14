"use client";
import { useRef, useState } from "react";
import type { ChangeEvent, CSSProperties, DragEvent, ReactNode } from "react";
import { useUploaderContext } from "../../core/context";

export interface FastPixDropZoneProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
  readonly overlay?: boolean;
  readonly label?: string;
}

export function FastPixDropZone({
  className,
  style,
  children,
  overlay,
  label = "Drag a file here, or press to browse",
}: FastPixDropZoneProps) {
  const { selectFile, accept, disabled, busy } = useUploaderContext();
  const blocked = disabled || busy;

  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { depth.current = 0; setDragging(false); };
  const browse = () => { if (!blocked) inputRef.current?.click(); };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) selectFile(f);
    e.target.value = "";
  };

  const onDragEnter = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (blocked) return;
    depth.current += 1;
    setDragging(true);
  };
  const onDragOver = (e: DragEvent<HTMLButtonElement>) => { e.preventDefault(); };
  const onDragLeave = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (blocked) return;
    depth.current -= 1;
    if (depth.current <= 0) reset();
  };
  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    reset();
    if (blocked) return;
    const f = e.dataTransfer.files?.[0];
    if (f) selectFile(f);
  };

  return (
    <div className="fpx-dropzone-wrapper">
      <button
        type="button"
        className={["fpx-dropzone", className].filter(Boolean).join(" ")}
        style={style}
        disabled={blocked}
        aria-label={label}
        data-fpx-dragging={dragging ? "" : undefined}
        onClick={browse}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {children}
      </button>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={onChange} />
      {overlay && dragging && <div className="fpx-dropzone-overlay" aria-hidden="true" />}
    </div>
  );
}