export { FastPixUploader } from "./components/FastPixUploader";

export { FastPixFilePicker } from "./components/input/FilePicker";
export { FastPixDropZone } from "./components/input/DropZone";
export { FastPixTrack } from "./components/feedback/Track";
export { FastPixStatus } from "./components/feedback/Status";
export { FastPixStartButton } from "./components/controls/StartButton";
export { FastPixPauseButton } from "./components/controls/PauseButton";
export { FastPixResumeButton } from "./components/controls/ResumeButton";
export { FastPixAbortButton } from "./components/controls/AbortButton";

export { useUploader } from "./core/useUploader";
export { useUploaderContext } from "./core/context";

export type {
  FastPixUploaderProps,
  FastPixUploaderRef,
  FastPixAppearance,
  UploaderState,
  UploaderError,
  UploaderContextValue,
  Endpoint,
  EndpointResolver,
  FileRejection,
} from "./types";

export type { FastPixFilePickerProps } from "./components/input/FilePicker";
export type { FastPixDropZoneProps } from "./components/input/DropZone";
export type { FastPixTrackProps } from "./components/feedback/Track";
export type { FastPixStatusProps } from "./components/feedback/Status";
export type { FastPixStartButtonProps } from "./components/controls/StartButton";
export type { FastPixPauseButtonProps } from "./components/controls/PauseButton";
export type { FastPixResumeButtonProps } from "./components/controls/ResumeButton";
export type { FastPixAbortButtonProps } from "./components/controls/AbortButton";
