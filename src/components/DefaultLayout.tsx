"use client";
import { useUploaderContext } from "../core/context";
import { FastPixDropZone } from "./input/DropZone";
import { FastPixTrack } from "./feedback/Track";
import { FastPixStatus } from "./feedback/Status";
import { FastPixStartButton } from "./controls/StartButton";
import { FastPixPauseButton } from "./controls/PauseButton";
import { FastPixResumeButton } from "./controls/ResumeButton";
import { FastPixAbortButton } from "./controls/AbortButton";

export function DefaultLayout() {
  const { state } = useUploaderContext();
  const isPicking = state === "idle" || state === "ready";
  const isActive = state === "resolving" || state === "uploading" || state === "paused";

  return (
    <div className="fpx-default">
      {isPicking && (
        <FastPixDropZone overlay className="fpx-default-drop">
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