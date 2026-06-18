import type { UploaderState, UploaderError } from "./types";

export interface InternalState {
  status: UploaderState;
  file: File | null;
  progress: number;
  error: UploaderError | null;
  isOffline: boolean;
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

const ACTIVE: UploaderState[] = ["resolving", "uploading", "paused"];

export function reducer(state: InternalState, action: Action): InternalState {
  switch (action.type) {
    case "SELECT_FILE":
      return { ...state, file: action.file, status: "ready", progress: 0, error: null };

    case "RESOLVE":
      if (state.status !== "ready" && state.status !== "error") return state;
      if (!state.file) return state;
      return { ...state, status: "resolving", error: null };

    case "UPLOAD_START":
      if (state.status !== "resolving") return state;
      return { ...state, status: "uploading", progress: 0 };

    case "PROGRESS":
      if (state.status !== "uploading") return state;
      return { ...state, progress: action.value };

    case "PAUSE":
      if (state.status !== "uploading") return state;
      return { ...state, status: "paused" };

    case "RESUME":
      if (state.status !== "paused") return state;
      return { ...state, status: "uploading" };

    case "SUCCESS":
      if (state.status !== "uploading") return state;
      return { ...state, status: "success", progress: 100 };

    case "ERROR":
      if (!ACTIVE.includes(state.status)) return state;
      return { ...state, status: "error", error: action.error };

    case "RESET":
      return { ...initialState, isOffline: state.isOffline };

    case "OFFLINE":
      return { ...state, isOffline: true };

    case "ONLINE":
      return { ...state, isOffline: false };

    default:
      return state;
  }
}