"use client";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { Uploader as Engine } from "@fastpix/resumable-uploads";
import { reducer, initialState } from "./reducer";
import type { FastPixUploaderProps, UploaderContextValue } from "./types";

export function useUploader(props: FastPixUploaderProps): UploaderContextValue {
  const {
    endpoint, file: fileProp, autoStart = true, accept, maxFileSize,
    chunkSize, retryChunkAttempt, delayRetry, disabled = false,
    onFileSelect, onFileReject, onUploadStart, onProgress,
    onPause, onResume, onAbort, onError, onSuccess, onStateChange,
  } = props;

  const [state, dispatch] = useReducer(reducer, initialState);

  const stateRef = useRef(state);
  stateRef.current = state;

  const engineRef = useRef<Engine | null>(null);
  const startingRef = useRef(false);
  const mountedRef = useRef(true);

  const clearEngine = useCallback(() => {
    startingRef.current = false;
    engineRef.current = null;
  }, []);

  const cancelEngine = useCallback(() => {
    try { engineRef.current?.abort(); } catch { /* noop */ }
    clearEngine();
  }, [clearEngine]);

  const selectFile = useCallback((f: File) => {
    if (disabled) return;
    if (accept && !matchesAccept(f, accept)) { onFileReject?.(f, "type"); return; }
    if (maxFileSize != null && f.size > maxFileSize * 1024) { onFileReject?.(f, "size"); return; }
    dispatch({ type: "SELECT_FILE", file: f });
    onFileSelect?.(f);
  }, [disabled, accept, maxFileSize, onFileReject, onFileSelect]);

  const start = useCallback(async () => {
    if (disabled) return;
    const f = stateRef.current.file;
    const status = stateRef.current.status;
    if (!f) return;
    if (startingRef.current || engineRef.current) return;
    if (status !== "ready" && status !== "error") return;

    startingRef.current = true;
    dispatch({ type: "RESOLVE" });

    try {
      const url = typeof endpoint === "function" ? await endpoint(f) : endpoint;
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
        const value = Math.round(e?.detail?.progress ?? 0);
        dispatch({ type: "PROGRESS", value });
        onProgress?.(value);
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
      clearEngine, onProgress, onSuccess, onError, onUploadStart]);

  const pause = useCallback(() => {
    if (stateRef.current.status !== "uploading") return;
    try { engineRef.current?.pause(); } catch { /* noop */ }
    dispatch({ type: "PAUSE" });
    onPause?.();
  }, [onPause]);

  const resume = useCallback(() => {
    if (stateRef.current.status !== "paused") return;
    try { engineRef.current?.resume(); } catch { /* noop */ }
    dispatch({ type: "RESUME" });
    onResume?.();
  }, [onResume]);

  const abort = useCallback(() => {
    cancelEngine();
    dispatch({ type: "RESET" });
    onAbort?.();
  }, [cancelEngine, onAbort]);

  const reset = useCallback(() => {
    cancelEngine();
    dispatch({ type: "RESET" });
  }, [cancelEngine]);

  useEffect(() => {
    if (fileProp) selectFile(fileProp);
  }, [fileProp]);

  useEffect(() => {
    if (autoStart && state.status === "ready") void start();
  }, [autoStart, state.status, start]);

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