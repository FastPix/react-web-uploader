"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { Uploader as Engine } from "@fastpix/resumable-uploads";
import { reducer, initialState } from "./reducer";
import type { FastPixUploaderProps, UploaderContextValue } from "./types";
import { validateConfig, checkFileReadable } from "./validate";

export function useUploader(props: FastPixUploaderProps): UploaderContextValue {
  const {
    endpoint, file: fileProp, autoStart = true, accept, maxFileSize,
    chunkSize, retryChunkAttempt, delayRetry, disabled = false,
    onFileSelect, onFileReject, onUploadStart, onProgress,
    onChunkAttempt, onChunkSuccess, onChunkAttemptFailure, 
    onPause, onResume, onAbort, onError, onSuccess, onStateChange,
  } = props;

  const [state, dispatch] = useReducer(reducer, initialState);

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
    try { engineRef.current?.abort(); } catch { /* noop */ }
    clearEngine();
  }, [clearEngine]);

  const selectFile = useCallback(async (f: File) => {
    if (disabled) return;

    const access = await checkFileReadable(f);
    if (!access.ok) {
      onFileReject?.(f, { reason: "unreadable", message: access.message });
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

    dispatch({ type: "SELECT_FILE", file: f });
    onFileSelect?.(f);
  }, [disabled, accept, maxFileSize, onFileReject, onFileSelect]);

  const start = useCallback(async () => {
    if (disabled) return;

    const configError = validateConfig(props);
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
      if (!mountedRef.current) { startingRef.current = false; return; }

      dispatch({ type: "UPLOAD_START" });

      const engine = Engine.init({
        file: f,
        endpoint: url,
        ...(chunkSize != null && { chunkSize }),
        ...(retryChunkAttempt != null && { retryChunkAttempt }),
        ...(delayRetry != null && { delayRetry }),
      });
      engineRef.current = engine;

      engine.on("progress", (e: any) => {
        if (stateRef.current.status === "paused") {
          if (pauseIntentRef.current) {
            try { engineRef.current?.pause(); } catch { /* noop */ }
          }
          return;
        }
        const value = Math.round(e?.detail?.progress ?? 0);
        dispatch({ type: "PROGRESS", value });
        onProgress?.(value);
      });

      engine.on("chunkAttempt", (e: any) => {
        const d = e?.detail ?? {};
        onChunkAttempt?.({
          chunkNumber: d.chunkNumber ?? 0,
          totalChunks: d.totalChunks,
          chunkSize: d.chunkSize,
        });
      });

      engine.on("chunkSuccess", (e: any) => {
        const d = e?.detail ?? {};
        onChunkSuccess?.({
          chunkNumber: d.chunkNumber ?? 0,
          totalChunks: d.totalChunks,
          chunkSize: d.chunkSize,
        });
      });

      engine.on("chunkAttemptFailure", (e: any) => {
        const d = e?.detail ?? {};
        onChunkAttemptFailure?.({
          chunkNumber: d.chunkNumber ?? 0,
          attempt: d.chunkAttempt ?? 0,
          totalAttempts: d.totalChunkFailureAttempts ?? 0,
        });
      });

      engine.on("offline", () => {
        dispatch({ type: "OFFLINE" });
      });

      engine.on("online", () => {
        dispatch({ type: "ONLINE" });
        if (pauseIntentRef.current) {
          try { engineRef.current?.pause(); } catch { /* noop */ }
        }
      });

      engine.on("success", () => {
        clearEngine();
        dispatch({ type: "SUCCESS" });
        onSuccess?.();
      });

      engine.on("error", (e: any) => {
        const message = e?.detail?.message ?? "Upload failed";
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
  }, [disabled, endpoint, chunkSize, retryChunkAttempt, delayRetry,
    clearEngine, onProgress, onSuccess, onError, onUploadStart,
    onChunkAttempt, onChunkSuccess, onChunkAttemptFailure]);

  const startRef = useRef(start);
  startRef.current = start;

  const pauseIntentRef = useRef(false);

  const pause = useCallback(() => {
    if (stateRef.current.status !== "uploading") return;
    pauseIntentRef.current = true;
    try { engineRef.current?.pause(); } catch { /* noop */ }
    dispatch({ type: "PAUSE" });
    onPause?.();
  }, [onPause]);

  const resume = useCallback(() => {
    if (stateRef.current.status !== "paused") return;
    pauseIntentRef.current = false;
    try { engineRef.current?.resume(); } catch { /* noop */ }
    dispatch({ type: "RESUME" });
    onResume?.();
  }, [onResume]);

  const abort = useCallback(() => {
    pauseIntentRef.current = false;
    autoStartedFor.current = null;
    cancelEngine();
    dispatch({ type: "RESET" });
    onAbort?.();
  }, [cancelEngine, onAbort]);

  const reset = useCallback(() => {
    pauseIntentRef.current = false;
    autoStartedFor.current = null;
    cancelEngine();
    dispatch({ type: "RESET" });
  }, [cancelEngine]);

  useEffect(() => {
    if (fileProp) selectFile(fileProp);
  }, [fileProp]);

  useEffect(() => {
    if (autoStart && state.status === "ready") {
      const f = stateRef.current.file;
      if (f && autoStartedFor.current !== f) {
        autoStartedFor.current = f;
        void startRef.current();
      }
    }
  }, [autoStart, state.status]);

  useEffect(() => {
    onStateChange?.(state.status);
  }, [state.status]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      try { engineRef.current?.abort(); } catch { /* noop */ }
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
    disabled, accept,
    selectFile, start, pause, resume, abort, reset,
  };
}

// "video/*", ".mp4", "video/mp4", or comma-separated lists
function matchesAccept(file: File, accept: string): boolean {
  const tokens = accept.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (tokens.length === 0) return true;

  const extensionToMimeFallback: Record<string, string> = {
    '.mkv': 'video/x-matroska',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
  };

  const fileName = file.name.toLowerCase();
  const fileExt = fileName.substring(fileName.lastIndexOf('.'));
  const fileType = file.type.toLowerCase() || extensionToMimeFallback[fileExt] || "";

  return tokens.some((t) => {
    if (t.startsWith(".")) return fileName.endsWith(t);
    if (t.endsWith("/*")) return fileType.startsWith(t.slice(0, -1));
    return fileType === t;
  });
}