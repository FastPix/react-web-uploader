# Changelog

All notable changes to `@fastpix/fp-react-uploader` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [[1.0.0-beta.1]]

Initial beta release of the FastPix React Uploader — a native React component
library for chunked, resumable file uploads, built on top of the
`@fastpix/resumable-uploads` engine.

### Added

#### Core

- `FastPixUploader` root component providing chunked, resumable uploads with
  file selection, progress, and pause/resume/abort — powered by the
  `@fastpix/resumable-uploads` engine (runtime dependency, not bundled).
- Two usage modes:
  - **Zero-config** — `<FastPixUploader endpoint={...} />` renders a complete
    built-in layout.
  - **Composed** — drop subcomponents as children in any order; they wire
    themselves together automatically via React Context, with no id or prop
    threading required.
- Explicit upload state machine: `idle → ready → resolving → uploading → success`,
  with `paused` reachable from `uploading` and a recoverable `error` state.
- `endpoint` accepts a static string, or a resolver function
  `(file: File) => string | Promise<string>` for eager or lazy URL minting;
  async resolution is covered by a dedicated `resolving` state.
- Edge-triggered auto-start (`autoStart`, default `true`) that fires once per
  selected file.

#### Components

- `FastPixFilePicker` — click-to-browse file selection.
- `FastPixDropZone` — drag-and-drop selection with an optional overlay and
  customizable label; implemented as a native `<button>` for built-in click,
  keyboard, and focus support.
- `FastPixTrack` — progress indicator with `linear` and `radial` variants and
  an optional percentage label.
- `FastPixStatus` — human-readable status text with per-state label overrides.
- `FastPixStartButton`, `FastPixPauseButton`, `FastPixResumeButton`,
  `FastPixAbortButton` — upload controls, each with sensible default labels and
  full `children` override support.

#### Events

- Lifecycle callbacks: `onFileSelect`, `onFileReject`, `onUploadStart`,
  `onProgress`, `onPause`, `onResume`, `onAbort`, `onError`, `onSuccess`,
  and `onStateChange`.
- Chunk-level callbacks: `onChunkAttempt`, `onChunkSuccess`, and
  `onChunkAttemptFailure`, carrying `ChunkInfo` / `ChunkFailureInfo` payloads.

#### Imperative API

- `FastPixUploaderRef` exposing `start`, `pause`, `resume`, `abort`, `reset`,
  `getState`, and `getFile` via `forwardRef` + `useImperativeHandle`.
- `useUploader` hook and `useUploaderContext` accessor for fully custom layouts.

#### Theming & styling

- `appearance` prop mapping camelCase keys (e.g. `accentColor`, `trackFill`)
  to `--fpx-*` CSS custom properties.
- Full theming surface via `--fpx-*` variables, plus `size` (`sm` / `md` / `lg`)
  and `data-fpx-*` attribute hooks for state-based styling.
- Separate, opt-in stylesheet published at `@fastpix/fp-react-uploader/styles.css`
  — SSR/RSC-safe and fully overridable, with zero styling dependencies.

#### Validation & resilience

- File validation before upload: type (`accept`), size (`maxFileSize`), and a
  readability pre-check that catches sandboxed/unreadable files (notably
  Android `accept="video/*"` picker cases) and surfaces a clear rejection reason
  instead of an opaque network failure.
- Configuration validation (`chunkSize` bounds and 256-multiple rule, and
  related options) performed at upload time; invalid configuration resolves to
  the `error` state and `onError` — it never throws or crashes the host tree.
- Offline/online awareness: a user's pause intent persists across network
  reconnects, so the engine is not silently resumed after coming back online.

#### Rendering & compatibility

- Server-safe rendering: per-file `"use client"` directives plus a build banner
  ensure React Server Components / Next.js App Router compatibility, with a
  deterministic initial render to avoid hydration mismatches.
- Full TypeScript support with exported public types
  (`FastPixUploaderProps`, `FastPixUploaderRef`, `FastPixAppearance`,
  `UploaderState`, `UploaderError`, `UploaderContextValue`, `Endpoint`,
  `EndpointResolver`, `FileRejection`, and per-component prop types).

#### Packaging

- Dual ESM and CommonJS builds with bundled type declarations.
- React and React DOM declared as peer dependencies (`>=18`, built against
  React 19) and kept external to avoid duplicate-React issues.
- Requires Node `>=18`.

[1.0.0-beta.1]: https://www.npmjs.com/package/@fastpix/fp-react-uploader/v/1.0.0-beta.1