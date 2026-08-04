# Changelog

All notable changes to `@fastpix/fp-react-uploader` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0]

### Added

- `onOnline` and `onOffline` connectivity callbacks, plus an `isOffline` flag on
  the uploader context, so consumers can react to the browser going on/offline.
  Connectivity is now tracked even while the uploader is idle, before an upload
  has started.
- Prettier + ESLint tooling with committed configs and `lint`/`format` scripts.

### Changed

- Renamed the CSS public surface from the `fpx` abbreviation to the
  full `fastpix` brand — CSS classes (`.fpx-*` → `.fastpix-*`), custom properties
  (`--fpx-*` → `--fastpix-*`), and data attributes (`data-fpx-*` → `data-fastpix-*`).
  Consumers who wrote custom CSS against `.fpx-*` selectors or set `--fpx-*`
  variables must update those names.
- Access `window` and `navigator` through `globalThis` so the package imports
  cleanly in server-side/SSR environments where those globals may be absent.

### Fixed

- Pause/resume state is now owned by the upload engine; removed the wrapper's
  internal `pauseIntentRef` workaround that could re-pause a freshly started
  upload and leave it stalled.
- Re-selecting the same file after an error now restarts the upload (when
  `autoStart` is on) instead of dead-ending on the ready state.

## [0.1.0] - beta release

### Added

- `FastPixUploader` root component for chunked, resumable uploads (file
  selection, progress, pause/resume/abort), powered by `@fastpix/resumable-uploads`.
- Zero-config and composable usage modes.
- Explicit upload state machine (`idle → ready → resolving → uploading → success`,
  plus `paused` and `error`).
- Static or async (resolver function) `endpoint` support.
- Auto-start on file selection.
- Components: `FastPixFilePicker`, `FastPixDropZone`, `FastPixTrack`,
  `FastPixStatus`, `FastPixStartButton`, `FastPixPauseButton`,
  `FastPixResumeButton`, `FastPixAbortButton`.
- Lifecycle and chunk-level event callbacks.
- Imperative API (`FastPixUploaderRef`) and `useUploader` hook.
- Theming via `appearance` prop and `--fpx-*` CSS variables, with an
  opt-in, overridable stylesheet.
- File and configuration validation with graceful error handling.
- Offline/online-aware pause behavior.
- Server-safe (RSC/Next.js App Router compatible) rendering.
- Full TypeScript support with exported public types.
- Dual ESM/CommonJS builds; React/React DOM as peer dependencies; Node `>=18`.
