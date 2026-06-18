"use client";
import { forwardRef, useImperativeHandle } from "react";
import type { CSSProperties } from "react";
import { UploaderProvider } from "./context";
import { DefaultLayout } from "./components/DefaultLayout";
import { useUploader } from "./useUploader";
import type {
  FastPixUploaderProps,
  FastPixUploaderRef,
  FastPixAppearance,
} from "./types";

const SIZE_SCALE = { sm: "0.875", md: "1", lg: "1.125" } as const;

export const FastPixUploader = forwardRef<FastPixUploaderRef, FastPixUploaderProps>(
  function FastPixUploader(props, ref) {
    const { children, className, style, appearance, size = "md" } = props;

    const ctx = useUploader(props);

    useImperativeHandle(
      ref,
      () => ({
        start: ctx.start,
        pause: ctx.pause,
        resume: ctx.resume,
        abort: ctx.abort,
        reset: ctx.reset,
        getState: () => ctx.state,
        getFile: () => ctx.file,
      }),
      [ctx]
    );

    const hostStyle = {
      ...appearanceToVars(appearance),
      "--fpx-size": SIZE_SCALE[size],
      "--fpx-progress": `${ctx.progress}%`,
      ...style,
    } as CSSProperties;

    return (
      <UploaderProvider value={ctx}>
        <div
          className={["fpx-uploader", className].filter(Boolean).join(" ")}
          style={hostStyle}
          data-fpx-state={ctx.state}
          data-fpx-size={size}
          data-fpx-disabled={ctx.disabled ? "" : undefined}
        >
          {children ?? <DefaultLayout />}
        </div>
      </UploaderProvider>
    );
  }
);

function appearanceToVars(appearance?: FastPixAppearance): Record<string, string> {
  if (!appearance) return {};
  const map: Record<keyof FastPixAppearance, string> = {
    accentColor: "--fpx-accent-color",
    background: "--fpx-bg",
    surface: "--fpx-surface",
    textColor: "--fpx-text-color",
    mutedColor: "--fpx-text-muted",
    borderColor: "--fpx-border-color",
    radius: "--fpx-radius",
    fontFamily: "--fpx-font-family",
    trackHeight: "--fpx-track-height",
    trackFill: "--fpx-track-fill",
    errorColor: "--fpx-error-color",
    successColor: "--fpx-success-color",
  };
  const out: Record<string, string> = {};
  (Object.keys(appearance) as (keyof FastPixAppearance)[]).forEach((k) => {
    const v = appearance[k];
    if (v != null) out[map[k]] = v;
  });
  return out;
}