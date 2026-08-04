"use client";
import { createContext, useContext } from "react";

import type { UploaderContextValue } from "../types";

const UploaderContext = createContext<UploaderContextValue | null>(null);

export const UploaderProvider = UploaderContext.Provider;

export function useUploaderContext(): UploaderContextValue {
  const ctx = useContext(UploaderContext);
  if (!ctx) {
    throw new Error("FastPix uploader subcomponents must be rendered inside <FastPixUploader>.");
  }
  return ctx;
}
