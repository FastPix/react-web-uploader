# Changelog

All notable changes to `@fastpix/fp-react-uploader` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
