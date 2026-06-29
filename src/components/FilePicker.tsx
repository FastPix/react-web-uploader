"use client";
import { useRef } from "react";
import type { ChangeEvent, CSSProperties, ReactNode } from "react";
import { useUploaderContext } from "../context";

export interface FastPixFilePickerProps {
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly children?: ReactNode;
}

export function FastPixFilePicker({ className, style, children }: FastPixFilePickerProps) {
  const { selectFile, accept, disabled, busy } = useUploaderContext();
  const blocked = disabled || busy;

  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) selectFile(f);
    e.target.value = "";
  };

  return (
    <>
      <button
        type="button"
        className={["fpx-file-picker", className].filter(Boolean).join(" ")}
        style={style}
        onClick={() => !blocked && inputRef.current?.click()}
        disabled={blocked}
        data-fpx-disabled={blocked ? "" : undefined}
      >
        {children ?? "Browse…"}
      </button>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={onChange} />
    </>
  );
}