"use client";
import { useUploaderContext } from "../core/context";
import { FastPixAbortButton } from "./controls/AbortButton";
import { FastPixPauseButton } from "./controls/PauseButton";
import { FastPixResumeButton } from "./controls/ResumeButton";
import { FastPixStartButton } from "./controls/StartButton";
import { FastPixStatus } from "./feedback/Status";
import { FastPixTrack } from "./feedback/Track";
import { FastPixDropZone } from "./input/DropZone";

export function DefaultLayout() {
  const { state } = useUploaderContext();
  const isPicking = state === "idle" || state === "ready";
  const isActive = state === "resolving" || state === "uploading" || state === "paused";

  return (
    <div className="fastpix-default">
      {isPicking && (
        <FastPixDropZone overlay className="fastpix-default-drop">
          <FastPixStatus className="fastpix-default-hint" />
        </FastPixDropZone>
      )}

      {state === "ready" && (
        <div className="fastpix-controls">
          <FastPixStartButton />
        </div>
      )}

      {isActive && (
        <div className="fastpix-default-progress">
          <FastPixStatus />
          <FastPixTrack showLabel />
          <div className="fastpix-controls">
            {state === "paused" ? <FastPixResumeButton /> : <FastPixPauseButton />}
            <FastPixAbortButton />
          </div>
        </div>
      )}

      {state === "error" && (
        <div className="fastpix-default-error">
          <FastPixStatus />
          <FastPixStartButton>Retry</FastPixStartButton>
        </div>
      )}

      {state === "success" && (
        <div className="fastpix-default-success">
          <FastPixStatus />
        </div>
      )}
    </div>
  );
}
