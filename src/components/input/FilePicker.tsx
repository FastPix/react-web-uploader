"use client";
import type { ChangeEvent, CSSProperties, ReactNode } from "react";
import { useRef } from "react";

import { useUploaderContext } from "../../core/context";

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
        className={["fastpix-file-picker", className].filter(Boolean).join(" ")}
        style={style}
        onClick={() => !blocked && inputRef.current?.click()}
        disabled={blocked}
        data-fastpix-disabled={blocked ? "" : undefined}
      >
        {children ?? "Browse…"}
      </button>
      <input ref={inputRef} type="file" accept={accept} hidden onChange={onChange} />
    </>
  );
}
