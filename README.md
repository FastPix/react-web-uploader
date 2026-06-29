# Introduction

A FastPix React component for resumable uploads, built on the [FastPix resumable web uploads SDK](https://github.com/FastPix/web-uploads-sdk).

`<FastPixUploader />` renders a complete upload experience - file selection, drag and drop, progress, and pause, resume, and cancel controls - and can be composed from individual components when you want control over layout. You provide an upload URL; the component uploads the file in resumable chunks, reports progress, and calls `onSuccess` when it finishes.

## Key Features

- **Resumable** - pause, resume, and cancel an in-progress upload.
- **Eager or lazy URL** - pass a URL string, or a function that returns one when a file is selected.
- **Customizable appearance** - accent color, radius, sizing, and every surface through CSS variables or an `appearance` prop, with no styling library required.
- **Server-rendering ready** - works in React Server Component setups (such as the Next.js App Router) without extra configuration.
- **Headless option** - a hook exposes the upload state and controls when you want to render the markup yourself.
- **Typed** - ships with TypeScript definitions.
- **Accessible** - status changes are announced to assistive technology, and controls are keyboard accessible.

## Prerequisites

### Getting Started with FastPix

To use this component you will need a signed upload URL.

To make API requests, you'll need a valid **Access Token** and **Secret Key**. See the [Basic Authentication Guide](https://fastpix.com/docs/getting-started/activate-your-account) for details on retrieving these credentials.

Once you have your credentials, use the [Upload media from device](https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media) API to generate a signed URL. You pass that URL to the component, and it uploads the file in resumable chunks. Creating the upload URL, checking when the media is ready for playback, and rendering the player are handled in your own application.

```
your app ──── upload URL ────▶ <FastPixUploader /> ──── onSuccess ────▶ your app
```

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
  - [Import](#import)
  - [Integration](#integration)
  - [Providing the upload URL](#providing-the-upload-url)
- [Lifecycle Events](#lifecycle-events)
- [Composition](#composition)
- [Concepts](#concepts)
- [Parameters Accepted](#parameters-accepted)
  - [Events](#events)
  - [Ref (imperative control)](#ref-imperative-control)
- [Components](#components)
- [Hooks](#hooks)
- [Appearance](#appearance)
- [Types](#types)
- [File access on mobile](#file-access-on-mobile)
- [Framework and browser support](#framework-and-browser-support)
- [Accessibility](#accessibility)
- [Stability](#stability)
- [References](#references)
- [Detailed Usage](#detailed-usage)
- [License](#license)

## Installation

Install the component using your preferred package manager:

### Using npm

```
npm install @fastpix/react-uploader
```

### Using pnpm

```
pnpm add @fastpix/react-uploader
```

### Using yarn

```
yarn add @fastpix/react-uploader
```

`react` and `react-dom` (v18 or later) are peer dependencies and should already be in your app.

Import the stylesheet once, anywhere in your app (for example, your root layout or entry file):

```
import "@fastpix/react-uploader/styles.css";
```

## Basic Usage

### Import

```
import { FastPixUploader } from "@fastpix/react-uploader";
import "@fastpix/react-uploader/styles.css";
```

### Integration

The fastest path - a complete uploader with sensible defaults:

```
export default function UploadPage() {
  return (
    <FastPixUploader endpoint="https://your-fastpix-upload-url" />
  );
}
```

### Providing the upload URL

In practice you'll create the upload URL once a file is selected. Pass a function to `endpoint` instead of a string - it receives the selected `File` and returns the URL (it may be async). Here `getSignedUrl` is your own function that returns a FastPix upload URL for the file:

```
<FastPixUploader endpoint={getSignedUrl} />
```

> **Note:** The signed URL is created through the [Upload media from device](https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media) API. Keep that call on your server so your credentials are never exposed to the browser.

## Lifecycle Events

Pass callback props to respond to the upload lifecycle. All are optional.

```
<FastPixUploader
  endpoint={getSignedUrl}
  accept="video/*"
  onProgress={(percent) => console.log("Progress:", percent)}
  onChunkSuccess={({ chunkNumber, totalChunks }) =>
    console.log(`Chunk ${chunkNumber}${totalChunks ? ` of ${totalChunks}` : ""}`)
  }
  onSuccess={() => console.log("Upload complete")}
  onError={(err) => console.error("Upload error:", err.message)}
/>
```

`onSuccess` fires when the upload finishes. Anything after that - waiting for the media to be processed, then playing it - belongs to your application.

See [Events](#events) for the full list.

## Composition

Render the individual components as children to control layout and styling. Each one reads the upload state automatically, so they work wherever you place them and in any order.

```
import {
  FastPixUploader,
  FastPixDropZone,
  FastPixStatus,
  FastPixTrack,
  FastPixStartButton,
  FastPixPauseButton,
  FastPixResumeButton,
  FastPixAbortButton,
} from "@fastpix/react-uploader";

<FastPixUploader endpoint={getSignedUrl} autoStart={false}>
  <FastPixDropZone overlay>
    <p>Drag a video here, or click to browse</p>
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

```
<FastPixUploader
  endpoint={getSignedUrl}
  size="lg"
  appearance={{ accentColor: "#00d1ff", radius: "12px" }}
/>
```

Drive it programmatically with a ref:

```
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

## Concepts

**Upload states.** The component is always in exactly one state. Child components and styling react to it.

| State | Meaning |
| ----- | ------- |
| `idle` | No file selected yet. |
| `ready` | A file is selected but the upload hasn't started (only when `autoStart` is `false`). |
| `resolving` | Preparing the upload (resolving the URL from your `endpoint` function). |
| `uploading` | Sending chunks. |
| `paused` | Upload held; it can be resumed from where it stopped. |
| `error` | The upload failed; it can be retried. |
| `success` | All bytes delivered. |

Typical flow: `idle → ready → resolving → uploading → success`, with `paused` reachable from `uploading`, and `error` recoverable into a new attempt.

**Endpoint.** The `endpoint` prop is either a URL string (known up front) or a function `(file) => string | Promise<string>` that runs when the upload starts. Use the function form to create the URL per file.

**Controlled file.** If your app already has a `File` (for example, from your own picker), pass it via the `file` prop instead of using the built-in picker or drop zone.

## Parameters Accepted

The `<FastPixUploader>` component accepts the following props:

| Name | Type | Required | Description |
| ---- | ---- | -------- | ----------- |
| `endpoint` | `string` or `(file: File) => string \| Promise<string>` | Required | The upload URL, or a function returning it when the upload starts. |
| `file` | `File` | Optional | Supply a file directly instead of using the picker / drop zone. |
| `autoStart` | `boolean` | Optional | Start uploading as soon as a valid file is available. Default is `true`. Set `false` to require an explicit start. |
| `accept` | `string` | Optional | Allowed file types (e.g. `"video/*"`, `".mp4"`), enforced for both the picker and the drop zone. See [File access on mobile](#file-access-on-mobile). |
| `maxFileSize` | `number` (in KB) | Optional | Reject files larger than this before uploading. |
| `chunkSize` | `number` (in KB) | Optional | Size of each upload chunk. **Minimum:** 5120 KB (5 MB), **Maximum:** 512000 KB (500 MB), in multiples of 256 KB. |
| `retryChunkAttempt` | `number` | Optional | Number of retry attempts per chunk on failure. |
| `delayRetry` | `number` (in seconds) | Optional | Delay between retry attempts. |
| `disabled` | `boolean` | Optional | Disable all interaction. Default is `false`. |
| `size` | `"sm" \| "md" \| "lg"` | Optional | Overall size of the rendered components. Default is `"md"`. |
| `appearance` | `FastPixAppearance` | Optional | Appearance values applied as CSS variables (see [Appearance](#appearance)). |
| `className` | `string` | Optional | Class applied to the root element. |
| `style` | `CSSProperties` | Optional | Inline style applied to the root element. |
| `children` | `ReactNode` | Optional | Provide components to compose your own layout. Omit for the default rendering. |

### Example usage of integrating all parameters

```
<FastPixUploader
  endpoint={getSignedUrl}
  autoStart={false}
  accept="video/*"
  maxFileSize={2_000_000}   // 2 GB
  chunkSize={16_384}        // 16 MB chunks
  retryChunkAttempt={6}
  delayRetry={2}
  size="lg"
  appearance={{ accentColor: "#00d1ff" }}
/>
```

### Events

All events are optional callback props on `<FastPixUploader>`.

| Name | Signature | Fires when |
| ---- | --------- | ---------- |
| `onFileSelect` | `(file: File) => void` | A valid, readable file is picked or dropped. |
| `onFileReject` | `(file: File, rejection: FileRejection) => void` | A file fails `accept`, `maxFileSize`, or can't be read. |
| `onUploadStart` | `(file: File) => void` | The upload begins. |
| `onProgress` | `(percent: number) => void` | Progress updates (0–100). |
| `onChunkAttempt` | `(info: ChunkInfo) => void` | A chunk upload is attempted. |
| `onChunkSuccess` | `(info: ChunkInfo) => void` | A chunk finishes successfully. |
| `onChunkAttemptFailure` | `(info: ChunkFailureInfo) => void` | A chunk attempt fails and will be retried. |
| `onPause` | `() => void` | The upload is paused. |
| `onResume` | `() => void` | The upload is resumed. |
| `onAbort` | `() => void` | The upload is cancelled. |
| `onError` | `(error: { message: string }) => void` | The upload fails. |
| `onSuccess` | `() => void` | The upload completes. |
| `onStateChange` | `(state: UploaderState) => void` | The state changes. |

`onFileReject` receives a `FileRejection` with a `reason` (`"type" | "size" | "unreadable"`) and a ready-to-display `message`. The `"unreadable"` reason covers files the browser hands over but won't let the page read - see [File access on mobile](#file-access-on-mobile).

The chunk events report which chunk is in flight and how many there are: `ChunkInfo` carries `{ chunkNumber, totalChunks?, chunkSize? }`, and `ChunkFailureInfo` carries `{ chunkNumber, attempt, totalAttempts }`. A failure event reports counters only; the underlying cause arrives on `onError`.

### Ref (imperative control)

Pass a `ref` typed as `FastPixUploaderRef` to control the component from outside.

| Method | Description |
| ------ | ----------- |
| `start()` | Start the upload (use with `autoStart={false}`). |
| `pause()` | Pause the active upload. |
| `resume()` | Resume a paused upload. |
| `abort()` | Cancel the upload and return to idle. |
| `reset()` | Clear the file and return to idle ("upload another"). |
| `getState()` | Returns the current `UploaderState`. |
| `getFile()` | Returns the current `File`, or `null`. |

```
const ref = useRef<FastPixUploaderRef>(null);
// later:
ref.current?.start();
if (ref.current?.getState() === "error") ref.current.reset();
```

## Components

All components accept `className` and `style`. They must be rendered inside `<FastPixUploader>`.

### `<FastPixFilePicker>`

A standalone button that opens the file dialog. Use it on its own or alongside a `FastPixDropZone` - not inside one (the drop zone already opens the dialog when clicked).

| Name | Type | Description |
| ---- | ---- | ----------- |
| `children` | `ReactNode` | Custom button label (default: `"Browse…"`). |

```
<FastPixFilePicker>Select a video</FastPixFilePicker>
```

### `<FastPixDropZone>`

A drop area that also opens the file dialog when clicked or activated with the keyboard. Put inline, non-interactive content inside it (text or an icon) - not another button.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `overlay` | `boolean` | Show a highlight overlay while a file is dragged over. |
| `label` | `string` | Accessible label for the zone (default: `"Drag a file here, or press to browse"`). |
| `children` | `ReactNode` | Inline content shown inside the zone. |

```
<FastPixDropZone overlay>
  <p>Drag a video here, or click to browse</p>
</FastPixDropZone>
```

### `<FastPixTrack>`

The progress indicator.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `variant` | `"linear" \| "radial"` | Bar or circular indicator. Default is `"linear"`. |
| `showLabel` | `boolean` | Show the percentage. Default is `false`. |

```
<FastPixTrack variant="radial" showLabel />
```

### `<FastPixStatus>`

Text describing the current state.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `labels` | `Partial<Record<UploaderState, string>>` | Override the text shown for any state (for wording or translation). |

```
<FastPixStatus
  labels={{
    idle: "Pick a video to begin",
    uploading: "Uploading your video…",
    success: "All done!",
  }}
/>
```

### `<FastPixStartButton>`

Starts the upload. Active when a file is ready (or to retry after an error). Pair with `autoStart={false}`.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `children` | `ReactNode` | Custom label (default: `"Upload"`). |

```
<FastPixStartButton>Start upload</FastPixStartButton>
```

### `<FastPixPauseButton>`

Pauses an active upload.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `children` | `ReactNode` | Custom label (default: `"Pause"`). |

```
<FastPixPauseButton>Hold</FastPixPauseButton>
```

### `<FastPixResumeButton>`

Resumes a paused upload.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `children` | `ReactNode` | Custom label (default: `"Resume"`). |

```
<FastPixResumeButton>Continue</FastPixResumeButton>
```

### `<FastPixAbortButton>`

Cancels the upload and returns to idle.

| Name | Type | Description |
| ---- | ---- | ----------- |
| `children` | `ReactNode` | Custom label (default: `"Cancel"`). |

```
<FastPixAbortButton>Cancel</FastPixAbortButton>
```

## Hooks

### `useUploaderContext()`

Read the upload state and controls inside a custom child of `<FastPixUploader>`. Use it to build your own components that still plug into the uploader.

```
import { useUploaderContext } from "@fastpix/react-uploader";

function MyProgress() {
  const { state, progress } = useUploaderContext();
  return <div>{state === "uploading" ? `${progress}%` : state}</div>;
}

// then render <MyProgress /> inside <FastPixUploader>…</FastPixUploader>
```

It returns:

| Name | Type | Description |
| ---- | ---- | ----------- |
| `state` | `UploaderState` | Current state. |
| `progress` | `number` | 0–100. |
| `file` | `File \| null` | Selected file. |
| `error` | `{ message: string } \| null` | Last error. |
| `isOffline` | `boolean` | Whether the connection is currently offline. |
| `disabled` | `boolean` | Whether interaction is disabled. |
| `accept` | `string \| undefined` | The configured file filter. |
| `selectFile` | `(file: File) => void` | Select a file (runs validation). |
| `start` / `pause` / `resume` / `abort` / `reset` | `() => void` | Control actions. |

### `useUploader(props)`

Build a completely custom uploader with no provided markup. It takes the same options as `<FastPixUploader>` and returns the same controls as `useUploaderContext()`, for you to wire into your own components.

```
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

## Appearance

There are three ways to customize the appearance, from lightest to most involved. They can be combined.

**1. CSS variables.** Set any `--fpx-*` variable on the component (or globally on `:root`). This covers most cases.

```
.fpx-uploader {
  --fpx-accent-color: #00d1ff;
  --fpx-radius: 12px;
  --fpx-surface: #111;
}
```

**2. The `appearance` prop.** The same variables as a typed object, when you'd rather not write CSS.

```
<FastPixUploader endpoint={getSignedUrl} appearance={{ accentColor: "#00d1ff", radius: "12px" }} />
```

**3. `className` / `style`.** Every component accepts these for full control.

### CSS variables

| Variable | Controls | Default |
| -------- | -------- | ------- |
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

```
.fpx-uploader[data-fpx-state="error"]   { /* error look */ }
.fpx-uploader[data-fpx-state="success"] { /* success look */ }
.fpx-dropzone[data-fpx-dragging]        { /* while dragging */ }
```

Available hooks: `data-fpx-state` (the current state), `data-fpx-dragging` (on the drop zone), `data-fpx-size` (`sm`/`md`/`lg`), and `data-fpx-disabled`.

### Size

The `size` prop (`"sm" | "md" | "lg"`) scales padding, spacing, text, and control sizes together.

```
<FastPixUploader endpoint={getSignedUrl} size="sm" />
```

## Types

All types are exported for use in your own code:

`FastPixUploaderProps`, `FastPixUploaderRef`, `FastPixAppearance`, `UploaderState`, `UploaderError`, `UploaderContextValue`, `Endpoint`, `EndpointResolver`, `FileRejection`, `ChunkInfo`, `ChunkFailureInfo`, and the prop types for each component (`FastPixFilePickerProps`, `FastPixDropZoneProps`, `FastPixTrackProps`, `FastPixStatusProps`, `FastPixStartButtonProps`, `FastPixPauseButtonProps`, `FastPixResumeButtonProps`, `FastPixAbortButtonProps`).

## File access on mobile

A browser can hand a page a `File` it is not actually allowed to read. The most common case is **Android with `accept="video/*"`**: this routes the user to the Photos/Gallery picker, and the resulting file reference is sometimes sandboxed so the bytes can't be read for upload.

The component guards against this: when a file is selected, it verifies the bytes are readable before accepting it. If they aren't, the file is rejected through `onFileReject` with `reason: "unreadable"` and a message that names the user's browser and OS and tells them to pick the video from their device's file manager instead of the Photos/Gallery picker.

> **Note:** To reduce how often this happens, you can broaden `accept` (for example `"video/*,audio/*"`) or omit it entirely, which makes Android open the system file manager rather than the media picker. Since you can't force a particular `accept`, the readability check is always on as a safety net.

## Framework and browser support

- **React** 18 and later.
- **Next.js (App Router) and other RSC setups** - the components are client components and can be rendered directly inside server components with no extra setup.
- **Vite, Create React App, and other bundlers** - supported with no configuration.
- **Browsers** - modern evergreen browsers. The default styles use `color-mix()` for accent tints; if you target older browsers, override the affected variables with explicit colors.

## Accessibility

- Status text is announced to assistive technology (`role="status"`, `aria-live="polite"`), so screen-reader users hear state and progress changes.
- All controls - including the drop zone - are real buttons: keyboard focusable, activatable with Enter or Space, and shown with visible focus rings.
- The `disabled` state is reflected for both pointer and assistive interaction.

## Stability

This package is pre-1.0. The API is settling but minor releases may include breaking changes until `1.0.0`. Pin a version if you need stability, and check the changelog before upgrading.

## References

[FastPix Homepage](https://www.fastpix.com/)

[FastPix Dashboard](https://dashboard.fastpix.com/)

[Resumable Web Uploads SDK](https://github.com/FastPix/web-uploads-sdk)

[Basic Authentication Guide](https://fastpix.com/docs/getting-started/activate-your-account)

[FastPix Documentation](https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media)

## Detailed Usage

For more detailed steps and advanced usage of the underlying upload engine, refer to the official [FastPix Documentation](https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media).

## License

[MIT](./LICENSE)