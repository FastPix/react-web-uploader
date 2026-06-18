"use client";
import { useUploaderContext } from "../context";
import { FastPixDropZone } from "./DropZone";
import { FastPixFilePicker } from "./FilePicker";
import { FastPixTrack } from "./Track";
import { FastPixStatus } from "./Status";
import { FastPixStartButton } from "./StartButton";
import { FastPixPauseButton } from "./PauseButton";
import { FastPixResumeButton } from "./ResumeButton";
import { FastPixAbortButton } from "./AbortButton";

export function DefaultLayout() {
  const { state } = useUploaderContext();
  const isPicking = state === "idle" || state === "ready";
  const isActive = state === "resolving" || state === "uploading" || state === "paused";

  return (
    <div className="fpx-default">
      {isPicking && (
        <FastPixDropZone overlay className="fpx-default-drop">
          <FastPixFilePicker />
          <FastPixStatus className="fpx-default-hint" />
        </FastPixDropZone>
      )}

      {state === "ready" && (
        <div className="fpx-controls">
          <FastPixStartButton />
        </div>
      )}

      {isActive && (
        <div className="fpx-default-progress">
          <FastPixStatus />
          <FastPixTrack showLabel />
          <div className="fpx-controls">
            {state === "paused" ? <FastPixResumeButton /> : <FastPixPauseButton />}
            <FastPixAbortButton />
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="fpx-default-error">
          <FastPixStatus />
          <FastPixStartButton>Retry</FastPixStartButton>
        </div>
      )}

      {state === "success" && (
        <div className="fpx-default-success">
          <FastPixStatus />
        </div>
      )}
    </div>
  );
}