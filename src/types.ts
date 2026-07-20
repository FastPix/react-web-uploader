import type { CSSProperties, ReactNode } from "react";

export type UploaderState =
  | "idle" | "ready" | "resolving" | "uploading" | "paused" | "error" | "success";

export interface UploaderError { message: string; }

export type EndpointResolver = (file: File) => string | Promise<string>;
export type Endpoint = string | EndpointResolver;

export interface FastPixAppearance {
  accentColor?: string;
  background?: string;
  surface?: string;
  textColor?: string;
  mutedColor?: string;
  borderColor?: string;
  radius?: string;
  fontFamily?: string;
  trackHeight?: string;
  trackFill?: string;
  errorColor?: string;
  successColor?: string;
}

export interface FastPixUploaderProps {
  endpoint: Endpoint;
  file?: File;
  autoStart?: boolean;
  accept?: string;
  chunkSize?: number;
  maxFileSize?: number;
  retryChunkAttempt?: number;
  delayRetry?: number;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  appearance?: FastPixAppearance;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;

  onFileSelect?: (file: File) => void;
  onFileReject?: (file: File, rejection: FileRejection) => void;
  onUploadStart?: (file: File) => void;
  onProgress?: (progress: number) => void;
  onChunkAttempt?: (info: ChunkInfo) => void;
  onChunkSuccess?: (info: ChunkInfo) => void;
  onChunkAttemptFailure?: (info: ChunkFailureInfo) => void;
  onPause?: () => void;
  onResume?: () => void;
  onAbort?: () => void;
  onError?: (error: UploaderError) => void;
  onSuccess?: () => void;
  onStateChange?: (state: UploaderState) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

export interface FastPixUploaderRef {
  start: () => void;
  pause: () => void;
  resume: () => void;
  abort: () => void;
  reset: () => void;
  getState: () => UploaderState;
  getFile: () => File | null;
}

export interface UploaderContextValue {
  state: UploaderState;
  progress: number;
  file: File | null;
  error: UploaderError | null;
  isOffline: boolean;
  busy: boolean;
  disabled: boolean;
  accept?: string;
  selectFile: (file: File) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  abort: () => void;
  reset: () => void;
}

export interface ChunkInfo {
  chunkNumber: number;
  totalChunks?: number;
  chunkSize?: number;
}

export interface ChunkFailureInfo {
  chunkNumber: number;
  attempt: number;
  totalAttempts: number;
}

export interface FileRejection {
  reason: "type" | "size" | "unreadable" | "busy";
  message: string;
}