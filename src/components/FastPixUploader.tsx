"use client";
import type { CSSProperties } from "react";
import { forwardRef, useImperativeHandle } from "react";

import { UploaderProvider } from "../core/context";
import { useUploader } from "../core/useUploader";
import { DefaultLayout } from "./DefaultLayout";

import type {
  FastPixUploaderProps,
  FastPixUploaderRef,
  FastPixAppearance,
} from "../types";

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
      [ctx],
    );

    const hostStyle = {
      ...appearanceToVars(appearance),
      "--fastpix-size": SIZE_SCALE[size],
      "--fastpix-progress": `${ctx.progress}%`,
      ...style,
    } as CSSProperties;

    return (
      <UploaderProvider value={ctx}>
        <div
          className={["fastpix-uploader", className].filter(Boolean).join(" ")}
          style={hostStyle}
          data-fastpix-state={ctx.state}
          data-fastpix-size={size}
          data-fastpix-disabled={ctx.disabled ? "" : undefined}
        >
          {children ?? <DefaultLayout />}
        </div>
      </UploaderProvider>
    );
  },
);

function appearanceToVars(appearance?: FastPixAppearance): Record<string, string> {
  if (!appearance) return {};
  const map: Record<keyof FastPixAppearance, string> = {
    accentColor: "--fastpix-accent-color",
    background: "--fastpix-bg",
    surface: "--fastpix-surface",
    textColor: "--fastpix-text-color",
    mutedColor: "--fastpix-text-muted",
    borderColor: "--fastpix-border-color",
    radius: "--fastpix-radius",
    fontFamily: "--fastpix-font-family",
    trackHeight: "--fastpix-track-height",
    trackFill: "--fastpix-track-fill",
    errorColor: "--fastpix-error-color",
    successColor: "--fastpix-success-color",
  };
  const out: Record<string, string> = {};
  (Object.keys(appearance) as (keyof FastPixAppearance)[]).forEach((k) => {
    const v = appearance[k];
    if (v != null) out[map[k]] = v;
  });
  return out;
}
