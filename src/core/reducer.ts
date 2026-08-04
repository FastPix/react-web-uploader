import type { UploaderError, UploaderState } from "../types";

export interface InternalState {
  readonly status: UploaderState;
  readonly file: File | null;
  readonly progress: number;
  readonly error: UploaderError | null;
  readonly isOffline: boolean;
}

export const initialState: InternalState = {
  status: "idle",
  file: null,
  progress: 0,
  error: null,
  isOffline: false,
};

export type Action =
  | { type: "SELECT_FILE"; file: File }
  | { type: "RESOLVE" }
  | { type: "UPLOAD_START" }
  | { type: "PROGRESS"; value: number }
  | { type: "PAUSE" }
  | { type: "RESUME" }
  | { type: "SUCCESS" }
  | { type: "ERROR"; error: UploaderError }
  | { type: "RESET" }
  | { type: "OFFLINE" }
  | { type: "ONLINE" };

export const ACTIVE = new Set<UploaderState>(["resolving", "uploading", "paused"]);

function isAllowed(state: InternalState, action: Action): boolean {
  switch (action.type) {
    case "SELECT_FILE":
      return !ACTIVE.has(state.status);
    case "RESOLVE":
      return (state.status === "ready" || state.status === "error") && !!state.file;
    case "UPLOAD_START":
      return state.status === "resolving";
    case "PROGRESS":
      return state.status === "uploading";
    case "PAUSE":
      return state.status === "uploading";
    case "RESUME":
      return state.status === "paused";
    case "SUCCESS":
      return state.status === "uploading";
    case "ERROR":
      return ACTIVE.has(state.status);
    default:
      return true; // RESET, OFFLINE, ONLINE
  }
}

export function reducer(state: InternalState, action: Action): InternalState {
  if (!isAllowed(state, action)) return state;

  switch (action.type) {
    case "SELECT_FILE":
      return { ...state, file: action.file, status: "ready", progress: 0, error: null };
    case "RESOLVE":
      return { ...state, status: "resolving", error: null };
    case "UPLOAD_START":
      return { ...state, status: "uploading", progress: 0 };
    case "PROGRESS":
      return { ...state, progress: action.value };
    case "PAUSE":
      return { ...state, status: "paused" };
    case "RESUME":
      return { ...state, status: "uploading" };
    case "SUCCESS":
      return { ...state, status: "success", progress: 100 };
    case "ERROR":
      return { ...state, status: "error", error: action.error };
    case "RESET":
      return { ...initialState, isOffline: state.isOffline };
    case "OFFLINE":
      return state.isOffline ? state : { ...state, isOffline: true };
    case "ONLINE":
      return state.isOffline ? { ...state, isOffline: false } : state;
    default:
      return state;
  }
}
