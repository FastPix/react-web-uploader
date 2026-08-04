"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";

import { Uploader as Engine } from "@fastpix/resumable-uploads";
import { ACTIVE, initialState, reducer } from "./reducer";
import { checkFileReadable, validateConfig } from "./validate";

import type { 
  FastPixUploaderProps, 
  FileRejection, 
  UploaderContextValue
} from "../types";

function busyRejection(name: string): FileRejection {
  return {
    reason: "busy",
    message: `An upload is already in progress. Cancel it before selecting "${name}".`,
  };
}

export function useUploader(props: FastPixUploaderProps): UploaderContextValue {
  const {
    endpoint,
    file: fileProp,
    autoStart = true,
    accept,
    maxFileSize,
    chunkSize,
    retryChunkAttempt,
    delayRetry,
    disabled = false,
    onFileSelect,
    onFileReject,
    onUploadStart,
    onProgress,
    onChunkAttempt,
    onChunkSuccess,
    onChunkAttemptFailure,
    onPause,
    onResume,
    onAbort,
    onError,
    onSuccess,
    onStateChange,
    onOffline,
    onOnline,
  } = props;

  const [state, dispatch] = useReducer(reducer, initialState);

  const netCbRef = useRef({ onOnline, onOffline });
  netCbRef.current = { onOnline, onOffline };

  const propsRef = useRef(props);
  propsRef.current = props;

  const onStateChangeRef = useRef(onStateChange);
  onStateChangeRef.current = onStateChange;

  const stateRef = useRef(state);
  stateRef.current = state;

  const engineRef = useRef<Engine | null>(null);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);
  const autoStartedFor = useRef<File | null>(null);

  const clearEngine = useCallback(() => {
    startingRef.current = false;
    engineRef.current = null;
  }, []);

  const cancelEngine = useCallback(() => {
    try {
      engineRef.current?.abort();
    } catch {
      /* noop */
    }
    clearEngine();
  }, [clearEngine]);

  const selectFile = useCallback(
    async (f: File) => {
      if (disabled) return;

      if (ACTIVE.has(stateRef.current.status)) {
        onFileReject?.(f, busyRejection(f.name));
        return;
      }

      const access = await checkFileReadable(f);
      if (!access.ok) {
        onFileReject?.(f, { reason: "unreadable", message: access.message });
        return;
      }

      if (ACTIVE.has(stateRef.current.status)) {
        onFileReject?.(f, busyRejection(f.name));
        return;
      }

      if (accept && !matchesAccept(f, accept)) {
        onFileReject?.(f, {
          reason: "type",
          message: `${f.name} is not an accepted file type. Allowed: ${accept}.`,
        });
        return;
      }

      if (maxFileSize != null && f.size > maxFileSize * 1024) {
        const limitMB = (maxFileSize / 1024).toFixed(1);
        const fileMB = (f.size / (1024 * 1024)).toFixed(1);
        onFileReject?.(f, {
          reason: "size",
          message: `"${f.name}" is ${fileMB} MB, which exceeds the ${limitMB} MB limit.`,
        });
        return;
      }

      autoStartedFor.current = null;
      dispatch({ type: "SELECT_FILE", file: f });
      onFileSelect?.(f);
    },
    [disabled, accept, maxFileSize, onFileReject, onFileSelect],
  );

  const selectFileRef = useRef(selectFile);
  selectFileRef.current = selectFile;

  const start = useCallback(async () => {
    if (disabled) return;

    const configError = validateConfig(propsRef.current);
    if (configError) {
      dispatch({ type: "ERROR", error: { message: configError } });
      onError?.({ message: configError });
      return;
    }

    const f = stateRef.current.file;
    const status = stateRef.current.status;

    if (!f) {
      const message = "No file selected. Select a file before starting the upload.";
      dispatch({ type: "ERROR", error: { message } });
      onError?.({ message });
      return;
    }

    if (startingRef.current || engineRef.current) return;
    if (status !== "ready" && status !== "error") return;

    startingRef.current = true;
    dispatch({ type: "RESOLVE" });

    try {
      const url = typeof endpoint === "function" ? await endpoint(f) : endpoint;
      if (typeof url !== "string" || url.trim() === "") {
        throw new Error("endpoint did not resolve to a valid URL");
      }
      if (!mountedRef.current) {
        startingRef.current = false;
        return;
      }

      dispatch({ type: "UPLOAD_START" });

      const engine = Engine.init({
        file: f,
        endpoint: url,
        ...(chunkSize != null && { chunkSize }),
        ...(retryChunkAttempt != null && { retryChunkAttempt }),
        ...(delayRetry != null && { delayRetry }),
      });
      engineRef.current = engine;

      engine.on("progress", (e: CustomEvent) => {
        if (stateRef.current.status === "paused") return;
        const value = Math.round(e?.detail?.progress ?? 0);
        dispatch({ type: "PROGRESS", value });
        onProgress?.(value);
      });

      engine.on("chunkAttempt", (e: CustomEvent) => {
        const d = e?.detail ?? {};
        onChunkAttempt?.({
          chunkNumber: d.chunkNumber ?? 0,
          totalChunks: d.totalChunks,
          chunkSize: d.chunkSize,
        });
      });

      engine.on("chunkSuccess", (e: CustomEvent) => {
        const d = e?.detail ?? {};
        onChunkSuccess?.({
          chunkNumber: d.chunkNumber ?? 0,
          totalChunks: d.totalChunks,
          chunkSize: d.chunkSize,
        });
      });

      engine.on("chunkAttemptFailure", (e: CustomEvent) => {
        const d = e?.detail ?? {};
        onChunkAttemptFailure?.({
          chunkNumber: d.chunkNumber ?? 0,
          attempt: d.chunkAttempt ?? 0,
          totalAttempts: d.totalChunkFailureAttempts ?? 0,
        });
      });

      engine.on("success", () => {
        clearEngine();
        dispatch({ type: "SUCCESS" });
        onSuccess?.();
      });

      engine.on("error", (e: CustomEvent) => {
        const message = e?.detail?.message ?? "Upload failed";
        try {
          engine.abort();
        } catch {
          /* detach listeners, kill session */
        }
        clearEngine();
        dispatch({ type: "ERROR", error: { message } });
        onError?.({ message });
      });

      onUploadStart?.(f);
    } catch (err) {
      startingRef.current = false;
      const message = err instanceof Error ? err.message : "Could not resolve upload endpoint";
      dispatch({ type: "ERROR", error: { message } });
      onError?.({ message });
    }
  }, [
    disabled,
    endpoint,
    chunkSize,
    retryChunkAttempt,
    delayRetry,
    clearEngine,
    onProgress,
    onSuccess,
    onError,
    onUploadStart,
    onChunkAttempt,
    onChunkSuccess,
    onChunkAttemptFailure,
  ]);

  const startRef = useRef(start);
  startRef.current = start;

  const pause = useCallback(() => {
    if (stateRef.current.status !== "uploading") return;
    try {
      engineRef.current?.pause();
    } catch {
      /* noop */
    }
    dispatch({ type: "PAUSE" });
    onPause?.();
  }, [onPause]);

  const resume = useCallback(async () => {
    if (stateRef.current.status !== "paused") return;
    try {
      await engineRef.current?.resume();
    } catch {
      /* noop */
    }
    dispatch({ type: "RESUME" });
    onResume?.();
  }, [onResume]);

  const abort = useCallback(() => {
    autoStartedFor.current = null;
    cancelEngine();
    dispatch({ type: "RESET" });
    onAbort?.();
  }, [cancelEngine, onAbort]);

  const reset = useCallback(() => {
    autoStartedFor.current = null;
    cancelEngine();
    dispatch({ type: "RESET" });
  }, [cancelEngine]);

  useEffect(() => {
    if (globalThis.window === undefined) return;

    const handleOffline = () => {
      dispatch({ type: "OFFLINE" });
      netCbRef.current.onOffline?.();
    };

    const handleOnline = () => {
      dispatch({ type: "ONLINE" });
      netCbRef.current.onOnline?.();
    };

    // Sync initial connectivity without firing a transition callback.
    if (globalThis.navigator !== undefined && !globalThis.navigator.onLine) {
      dispatch({ type: "OFFLINE" });
    }

    globalThis.window.addEventListener("offline", handleOffline);
    globalThis.window.addEventListener("online", handleOnline);

    return () => {
      globalThis.window.removeEventListener("offline", handleOffline);
      globalThis.window.removeEventListener("online", handleOnline);
    };
  }, []);

  useEffect(() => {
    if (fileProp) selectFileRef.current(fileProp);
  }, [fileProp]);

  useEffect(() => {
    if (autoStart && state.status === "ready") {
      const f = stateRef.current.file;
      if (f && autoStartedFor.current !== f) {
        autoStartedFor.current = f;
        startRef.current();
      }
    }
  }, [autoStart, state.status]);

  useEffect(() => {
    onStateChangeRef.current?.(state.status);
  }, [state.status]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      try {
        engineRef.current?.abort();
      } catch {
        /* noop */
      }
      engineRef.current = null;
      startingRef.current = false;
    };
  }, []);

  return {
    state: state.status,
    progress: state.progress,
    file: state.file,
    error: state.error,
    isOffline: state.isOffline,
    busy: ACTIVE.has(state.status),
    disabled,
    accept,
    selectFile,
    start,
    pause,
    resume,
    abort,
    reset,
  };
}

// "video/*", ".mp4", "video/mp4", or comma-separated lists
function matchesAccept(file: File, accept: string): boolean {
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return true;

  const extensionToMimeFallback: Record<string, string> = {
    ".mkv": "video/x-matroska",
    ".avi": "video/x-msvideo",
    ".mov": "video/quicktime",
  };

  const fileName = file.name.toLowerCase();
  const fileExt = fileName.substring(fileName.lastIndexOf("."));
  const fileType = file.type.toLowerCase() || extensionToMimeFallback[fileExt] || "";

  return tokens.some((t) => {
    if (t.startsWith(".")) return fileName.endsWith(t);
    if (t.endsWith("/*")) return fileType.startsWith(t.slice(0, -1));
    return fileType === t;
  });
}
