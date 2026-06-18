<div align="center">

# `<FastPixUploader />`

A FastPix React component for resumable uploads, built on the [FastPix resumable web uploads SDK](https://github.com/FastPix/web-uploads-sdk).

[![npm version](https://img.shields.io/npm/v/@fastpix/react-uploader.svg)](https://www.npmjs.com/package/@fastpix/react-uploader)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/@fastpix/react-uploader)](https://bundlephobia.com/package/@fastpix/react-uploader)
![types included](https://img.shields.io/npm/types/@fastpix/react-uploader)
[![license: MIT](https://img.shields.io/npm/l/@fastpix/react-uploader.svg)](./LICENSE)

</div>

`<FastPixUploader />` renders a complete upload experience — file selection, drag and drop, progress, and pause, resume, and cancel controls — and can be composed from individual components when you want control over layout. You provide an upload URL; the component uploads the file in resumable chunks, reports progress, and calls `onSuccess` when it finishes.

---

## Table of contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Composition](#composition)
- [Concepts](#concepts)
- [API reference](#api-reference)
  - [`<FastPixUploader>`](#fastpixuploader)
  - [Events](#events)
  - [Ref (imperative control)](#ref-imperative-control)
  - [Components](#components)
  - [Hooks](#hooks)
  - [Types](#types)
- [Appearance](#appearance)
- [Recipes](#recipes)
- [Framework & browser support](#framework--browser-support)
- [Accessibility](#accessibility)
- [Stability](#stability)
- [License](#license)

---

## Overview

`<FastPixUploader />` is a React component for resumable uploads. It renders the upload experience and runs the upload through the [FastPix resumable web uploads SDK](https://github.com/FastPix/web-uploads-sdk).

You provide an upload URL — created through the [FastPix direct upload API](https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media) — and the component uploads the file in resumable chunks and reports progress through callbacks. When the upload completes it calls `onSuccess`. Creating the upload URL, checking when the media is ready for playback, and rendering the player are handled in your own application.

```
your app ──── upload URL ────▶ <FastPixUploader /> ──── onSuccess ────▶ your app
```

---

## Features

- **Ready-made or composable** — render `<FastPixUploader />` on its own for a complete uploader, or compose it from individual components.
- **Resumable** — pause, resume, and cancel an in-progress upload.
- **Eager or lazy URL** — pass a URL string, or a function that returns one when a file is selected.
- **Customizable appearance** — accent color, radius, sizing, and every surface through CSS variables or an `appearance` prop, with no styling library required.
- **Server-rendering ready** — works in React Server Component setups (such as the Next.js App Router) without extra configuration.
- **Headless option** — a hook exposes the upload state and controls when you want to render the markup yourself.
- **Typed** — ships with TypeScript definitions.
- **Accessible** — status changes are announced to assistive technology, and controls are keyboard accessible.

---

## Installation

```bash
npm install @fastpix/react-uploader
# or
pnpm add @fastpix/react-uploader
# or
yarn add @fastpix/react-uploader
```

`react` and `react-dom` (v18 or later) are peer dependencies and should already be in your app.

Import the stylesheet once, anywhere in your app (for example, your root layout or entry file):

```ts
import "@fastpix/react-uploader/styles.css";
```

---

## Quick start

The fastest path — a complete uploader with sensible defaults:

```tsx
import { FastPixUploader } from "@fastpix/react-uploader";
import "@fastpix/react-uploader/styles.css";

export default function UploadPage() {
  return (
    <FastPixUploader endpoint="https://your-fastpix-upload-url" />
  );
}
```

In practice you'll create the upload URL once a file is selected. Pass a function to `endpoint` instead of a string — it receives the selected `File` and returns the URL (it may be async). Here `getSignedUrl` is your own function that returns a FastPix upload URL for the file:

```tsx
<FastPixUploader endpoint={getSignedUrl} />
```

Respond to the lifecycle with callbacks:

```tsx
<FastPixUploader
  endpoint={getSignedUrl}
  accept="video/*"
  onProgress={(percent) => console.log(percent)}
  onSuccess={() => console.log("Upload complete")}
  onError={(err) => console.error(err.message)}
/>
```

That's everything needed for a working uploader.

---

## Composition

Render the individual components as children to control layout and styling. Each one reads the upload state automatically, so they work wherever you place them and in any order.

```tsx
import {
  FastPixUploader,
  FastPixDropZone,
  FastPixFilePicker,
  FastPixStatus,
  FastPixTrack,
  FastPixStartButton,
  FastPixPauseButton,
  FastPixResumeButton,
  FastPixAbortButton,
} from "@fastpix/react-uploader";

<FastPixUploader endpoint={getSignedUrl} autoStart={false}>
  <FastPixDropZone overlay>
    <FastPixFilePicker>Choose a video</FastPixFilePicker>
  </FastPixDropZone>

  <FastPixStatus />
  <FastPixTrack showLabel />

  <FastPixStartButton />
  <FastPixPauseButton />
  <FastPixResumeButton />
  <FastPixAbortButton />
</FastPixUploader>
```

Apply an appearance without writing any CSS:

```tsx
<FastPixUploader
  endpoint={getSignedUrl}
  size="lg"
  appearance={{ accentColor: "#00d1ff", radius: "12px" }}
/>
```

Drive it programmatically with a ref:

```tsx
import { useRef } from "react";
import { FastPixUploader, type FastPixUploaderRef } from "@fastpix/react-uploader";

function Example() {
  const uploader = useRef<FastPixUploaderRef>(null);

  return (
    <>
      <FastPixUploader ref={uploader} endpoint={getSignedUrl} />
      <button onClick={() => uploader.current?.pause()}>Pause</button>
      <button onClick={() => uploader.current?.reset()}>Start over</button>
    </>
  );
}
```

---

## Concepts

**Upload states.** The component is always in exactly one state. Child components and styling react to it.

| State | Meaning |
|---|---|
| `idle` | No file selected yet. |
| `ready` | A file is selected but the upload hasn't started (only when `autoStart` is `false`). |
| `resolving` | Preparing the upload (resolving the URL from your `endpoint` function). |
| `uploading` | Sending chunks. |
| `paused` | Upload held; it can be resumed from where it stopped. |
| `error` | The upload failed; it can be retried. |
| `success` | All bytes delivered. |

Typical flow: `idle → ready → resolving → uploading → success`, with `paused` reachable from `uploading`, and `error` recoverable into a new attempt.

**Endpoint.** The `endpoint` prop is either a URL string (known up front) or a function `(file) => string | Promise<string>` that runs when the upload starts. Use the function form to create the URL per file.

**The success boundary.** `onSuccess` fires when the upload finishes. Anything after that — waiting for the media to be processed, then playing it — belongs to your application.

**Controlled file.** If your app already has a `File` (for example, from your own picker), pass it via the `file` prop instead of using the built-in picker or drop zone.

---

## API reference

### `<FastPixUploader>`

The root component. It runs the upload and provides state to all child components.

| Prop | Type | Default | Description |
|---|---|---|---|
| `endpoint` | `string \| (file: File) => string \| Promise<string>` | — (required) | The upload URL, or a function returning it when the upload starts. |
| `file` | `File` | — | Supply a file directly instead of using the picker / drop zone. |
| `autoStart` | `boolean` | `true` | Start uploading as soon as a valid file is available. Set `false` to require an explicit start. |
| `accept` | `string` | — | Allowed file types (e.g. `"video/*"`, `".mp4"`), enforced for both the picker and the drop zone. |
| `maxFileSize` | `number` (KB) | — | Reject files larger than this before uploading. |
| `chunkSize` | `number` (KB) | — | Size of each upload chunk. |
| `retryChunkAttempt` | `number` | — | How many times to retry a failed chunk. |
| `delayRetry` | `number` (s) | — | Delay between retries. |
| `disabled` | `boolean` | `false` | Disable all interaction. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Overall size of the rendered components. |
| `appearance` | `FastPixAppearance` | — | Appearance values applied as CSS variables (see [Appearance](#appearance)). |
| `className` | `string` | — | Class applied to the root element. |
| `style` | `CSSProperties` | — | Inline style applied to the root element. |
| `children` | `ReactNode` | — | Provide components to compose your own layout. Omit for the default rendering. |

```tsx
<FastPixUploader
  endpoint={getSignedUrl}
  autoStart={false}
  accept="video/*"
  maxFileSize={2_000_000}   // 2 GB
  chunkSize={16_384}        // 16 MB chunks
  size="lg"
  appearance={{ accentColor: "#00d1ff" }}
/>
```

### Events

All events are optional callback props on `<FastPixUploader>`.

| Event | Signature | Fires when |
|---|---|---|
| `onFileSelect` | `(file: File) => void` | A valid file is picked or dropped. |
| `onFileReject` | `(file: File, reason: "type" \| "size") => void` | A file fails `accept` or `maxFileSize`. |
| `onUploadStart` | `(file: File) => void` | The upload begins. |
| `onProgress` | `(percent: number) => void` | Progress updates (0–100). |
| `onPause` | `() => void` | The upload is paused. |
| `onResume` | `() => void` | The upload is resumed. |
| `onAbort` | `() => void` | The upload is cancelled. |
| `onError` | `(error: { message: string }) => void` | The upload fails. |
| `onSuccess` | `() => void` | The upload completes. |
| `onStateChange` | `(state: UploaderState) => void` | The state changes. |

```tsx
<FastPixUploader
  endpoint={getSignedUrl}
  onFileReject={(file, reason) => alert(`${file.name} rejected: ${reason}`)}
  onProgress={(p) => setProgress(p)}
  onSuccess={() => router.push("/done")}
/>
```

### Ref (imperative control)

Pass a `ref` typed as `FastPixUploaderRef` to control the component from outside.

| Method | Description |
|---|---|
| `start()` | Start the upload (use with `autoStart={false}`). |
| `pause()` | Pause the active upload. |
| `resume()` | Resume a paused upload. |
| `abort()` | Cancel the upload and return to idle. |
| `reset()` | Clear the file and return to idle ("upload another"). |
| `getState()` | Returns the current `UploaderState`. |
| `getFile()` | Returns the current `File`, or `null`. |

```tsx
const ref = useRef<FastPixUploaderRef>(null);
// later:
ref.current?.start();
if (ref.current?.getState() === "error") ref.current.reset();
```

### Components

All components accept `className` and `style`. They must be rendered inside `<FastPixUploader>`.

#### `<FastPixFilePicker>`

A button that opens the file dialog.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | Custom button label (default: `"Browse…"`). |

```tsx
<FastPixFilePicker>Select a video</FastPixFilePicker>
```

#### `<FastPixDropZone>`

A drag-and-drop area. Place a picker or any content inside it.

| Prop | Type | Description |
|---|---|---|
| `overlay` | `boolean` | Show a highlight overlay while a file is dragged over. |
| `children` | `ReactNode` | Content shown inside the zone. |

```tsx
<FastPixDropZone overlay>
  <FastPixFilePicker />
  <p>or drop a file here</p>
</FastPixDropZone>
```

#### `<FastPixTrack>`

The progress indicator.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"linear" \| "radial"` | `"linear"` | Bar or circular indicator. |
| `showLabel` | `boolean` | `false` | Show the percentage. |

```tsx
<FastPixTrack variant="radial" showLabel />
```

#### `<FastPixStatus>`

Text describing the current state.

| Prop | Type | Description |
|---|---|---|
| `labels` | `Partial<Record<UploaderState, string>>` | Override the text shown for any state (for wording or translation). |

```tsx
<FastPixStatus
  labels={{
    idle: "Pick a video to begin",
    uploading: "Uploading your video…",
    success: "All done!",
  }}
/>
```

#### `<FastPixStartButton>`

Starts the upload. Active when a file is ready (or to retry after an error). Pair with `autoStart={false}`.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | Custom label (default: `"Upload"`). |

```tsx
<FastPixStartButton>Start upload</FastPixStartButton>
```

#### `<FastPixPauseButton>`

Pauses an active upload.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | Custom label (default: `"Pause"`). |

```tsx
<FastPixPauseButton>Hold</FastPixPauseButton>
```

#### `<FastPixResumeButton>`

Resumes a paused upload.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | Custom label (default: `"Resume"`). |

```tsx
<FastPixResumeButton>Continue</FastPixResumeButton>
```

#### `<FastPixAbortButton>`

Cancels the upload and returns to idle.

| Prop | Type | Description |
|---|---|---|
| `children` | `ReactNode` | Custom label (default: `"Cancel"`). |

```tsx
<FastPixAbortButton>Cancel</FastPixAbortButton>
```

### Hooks

#### `useUploaderContext()`

Read the upload state and controls inside a custom child of `<FastPixUploader>`. Use it to build your own components that still plug into the uploader.

```tsx
import { useUploaderContext } from "@fastpix/react-uploader";

function MyProgress() {
  const { state, progress } = useUploaderContext();
  return <div>{state === "uploading" ? `${progress}%` : state}</div>;
}

// then render <MyProgress /> inside <FastPixUploader>…</FastPixUploader>
```

It returns:

| Field | Type | Description |
|---|---|---|
| `state` | `UploaderState` | Current state. |
| `progress` | `number` | 0–100. |
| `file` | `File \| null` | Selected file. |
| `error` | `{ message: string } \| null` | Last error. |
| `isOffline` | `boolean` | Whether the connection is currently offline. |
| `disabled` | `boolean` | Whether interaction is disabled. |
| `accept` | `string \| undefined` | The configured file filter. |
| `selectFile` | `(file: File) => void` | Select a file (runs validation). |
| `start` / `pause` / `resume` / `abort` / `reset` | `() => void` | Control actions. |

#### `useUploader(props)`

Build a completely custom uploader with no provided markup. It takes the same options as `<FastPixUploader>` and returns the same controls as `useUploaderContext()`, for you to wire into your own components.

```tsx
import { useUploader } from "@fastpix/react-uploader";

function HeadlessUploader() {
  const { state, progress, selectFile, start } = useUploader({
    endpoint: getSignedUrl,
    autoStart: false,
  });

  return (
    <div>
      <input type="file" onChange={(e) => e.target.files?.[0] && selectFile(e.target.files[0])} />
      <button onClick={start} disabled={state !== "ready"}>Upload</button>
      <progress value={progress} max={100} />
    </div>
  );
}
```

### Types

All types are exported for use in your own code:

`FastPixUploaderProps`, `FastPixUploaderRef`, `FastPixAppearance`, `UploaderState`, `UploaderError`, `UploaderContextValue`, `Endpoint`, `EndpointResolver`, `FileRejectReason`, and the prop types for each component (`FastPixFilePickerProps`, `FastPixDropZoneProps`, `FastPixTrackProps`, `FastPixStatusProps`, `FastPixStartButtonProps`, `FastPixPauseButtonProps`, `FastPixResumeButtonProps`, `FastPixAbortButtonProps`).

---

## Appearance

There are three ways to customize the appearance, from lightest to most involved. They can be combined.

**1. CSS variables.** Set any `--fpx-*` variable on the component (or globally on `:root`). This covers most cases.

```css
.fpx-uploader {
  --fpx-accent-color: #00d1ff;
  --fpx-radius: 12px;
  --fpx-surface: #111;
}
```

**2. The `appearance` prop.** The same variables as a typed object, when you'd rather not write CSS.

```tsx
<FastPixUploader endpoint={getSignedUrl} appearance={{ accentColor: "#00d1ff", radius: "12px" }} />
```

**3. `className` / `style`.** Every component accepts these for full control.

### CSS variables

| Variable | Controls | Default |
|---|---|---|
| `--fpx-accent-color` | Accent: progress fill, active borders, primary buttons | `#3b82f6` |
| `--fpx-bg` | Component background | `transparent` |
| `--fpx-surface` | Inner surfaces (drop zone) | `#0f0f0f` |
| `--fpx-text-color` | Primary text | `#e5e5e5` |
| `--fpx-text-muted` | Secondary text | `#8a8a8a` |
| `--fpx-border-color` | Borders | `#333` |
| `--fpx-border-color-hover` | Hover border | `#555` |
| `--fpx-radius` | Corner radius | `8px` |
| `--fpx-font-family` | Font stack | `system-ui, sans-serif` |
| `--fpx-error-color` | Error text / border | `#ef4444` |
| `--fpx-success-color` | Success text / border | `#22c55e` |
| `--fpx-gap` | Internal spacing | `1rem` |
| `--fpx-padding` | Component padding | `2rem` |
| `--fpx-track-height` | Progress bar thickness | `8px` |
| `--fpx-track-bg` | Empty track | `#222` |
| `--fpx-track-fill` | Filled track | `var(--fpx-accent-color)` |
| `--fpx-track-radius` | Track radius | `999px` |
| `--fpx-dropzone-border` | Drop zone border (idle) | `2px dashed var(--fpx-border-color)` |
| `--fpx-dropzone-border-active` | Drop zone border (dragging) | `var(--fpx-accent-color)` |
| `--fpx-dropzone-bg` | Drop zone background (idle) | `var(--fpx-surface)` |
| `--fpx-dropzone-bg-active` | Drop zone background (dragging) | accent tint |
| `--fpx-overlay-bg` | Drag overlay | `rgba(0,0,0,.6)` |
| `--fpx-button-bg` | Button background | `var(--fpx-accent-color)` |
| `--fpx-button-text` | Button label | `#fff` |
| `--fpx-button-bg-hover` | Button hover background | darker accent |
| `--fpx-button-radius` | Button radius | `var(--fpx-radius)` |

### `appearance` prop keys

`accentColor`, `background`, `surface`, `textColor`, `mutedColor`, `borderColor`, `radius`, `fontFamily`, `trackHeight`, `trackFill`, `errorColor`, `successColor`.

### Styling by state

The root carries the current state as a data attribute, so you can style any phase in plain CSS:

```css
.fpx-uploader[data-fpx-state="error"]   { /* error look */ }
.fpx-uploader[data-fpx-state="success"] { /* success look */ }
.fpx-dropzone[data-fpx-dragging]        { /* while dragging */ }
```

Available hooks: `data-fpx-state` (the current state), `data-fpx-dragging` (on the drop zone), `data-fpx-size` (`sm`/`md`/`lg`), and `data-fpx-disabled`.

### Size

The `size` prop (`"sm" | "md" | "lg"`) scales padding, spacing, text, and control sizes together.

```tsx
<FastPixUploader endpoint={getSignedUrl} size="sm" />
```

---

## Recipes

**Create the upload URL when a file is selected.** Have your `endpoint` function request a FastPix upload URL from your backend (created through the [FastPix direct upload API](https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media)) and return it. It receives the selected file, so the URL can be specific to it:

```tsx
<FastPixUploader endpoint={getSignedUrl} />
```

**Restrict file type and size.** Validation runs for both the picker and drag-and-drop:

```tsx
<FastPixUploader
  endpoint={getSignedUrl}
  accept="video/*"
  maxFileSize={1_000_000}  // 1 GB, in KB
  onFileReject={(file, reason) => toast(`Rejected (${reason}): ${file.name}`)}
/>
```

**Require an explicit start.** Turn off auto-start and add a start button:

```tsx
<FastPixUploader endpoint={getSignedUrl} autoStart={false}>
  <FastPixFilePicker />
  <FastPixStartButton />
</FastPixUploader>
```

**Build a fully custom uploader.** Use `useUploader` (no provided markup) or `useUploaderContext` (custom components inside the provided root) — see [Hooks](#hooks).

---

## Framework & browser support

- **React** 18 and later.
- **Next.js (App Router) and other RSC setups** — the components are client components and can be rendered directly inside server components with no extra setup.
- **Vite, Create React App, and other bundlers** — supported with no configuration.
- **Browsers** — modern evergreen browsers. The default styles use `color-mix()` for accent tints; if you target older browsers, override the affected variables with explicit colors.

---

## Accessibility

- Status text is announced to assistive technology (`role="status"`, `aria-live="polite"`), so screen-reader users hear state and progress changes.
- All controls are real buttons — keyboard focusable, with visible focus rings.
- The `disabled` state is reflected for both pointer and assistive interaction.

---

## Stability

This package is pre-1.0. The API is settling but minor releases may include breaking changes until `1.0.0`. Pin a version if you need stability, and check the changelog before upgrading.

---

## License

[MIT](./LICENSE)