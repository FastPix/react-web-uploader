# React file upload component - resumable, chunked uploads with drag-and-drop

[![npm version](https://img.shields.io/npm/v/@fastpix/fp-react-uploader)](https://www.npmjs.com/package/@fastpix/fp-react-uploader)
[![npm downloads](https://img.shields.io/npm/dm/@fastpix/fp-react-uploader)](https://www.npmjs.com/package/@fastpix/fp-react-uploader)
[![license](https://img.shields.io/npm/l/@fastpix/fp-react-uploader)](https://github.com/FastPix/react-web-uploader/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

A FastPix React component for resumable uploads, built on the [FastPix resumable web uploads SDK](https://github.com/FastPix/web-uploads-sdk).

`<FastPixUploader />` provides a complete upload experience, including file selection, drag-and-drop, upload progress, and pause, resume, and cancel controls. You can also compose it from individual components to customize the layout. Provide an upload URL, and the component uploads the file in resumable chunks, reports progress, and calls `onSuccess` when the upload completes.

**Works with:** React 18+ · Next.js App Router / RSC · Vite · Create React App · TypeScript · any FastPix signed upload URL

📖 **Docs:** https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media &nbsp;·&nbsp; 🚀 **Free account:** https://dashboard.fastpix.com

## Jump to

Skip straight to a section without scrolling:

| Get started | Customize | Reference & help |
|---|---|---|
| [Getting started](#getting-started) | [Composition](#composition) | [Parameters accepted](#parameters-accepted) |
| [Installation](#installation) | [Appearance](#appearance) | [Components](#components) |
| [Basic usage](#basic-usage) | [Hooks](#hooks) | [Which upload tool?](#which-fastpix-upload-tool-should-i-use) |
| [Lifecycle events](#lifecycle-events) | [Concepts](#concepts) | [FAQ](#faq) |
| [Key features](#key-features) | [Types](#types) | [Example app](https://github.com/FastPix/react-web-uploader/tree/main/example) |

## Why FastPix React Uploader?

- **Drop-in, not a toolkit.** One `<FastPixUploader />` gives you file selection, drag-and-drop, progress, and pause/resume/cancel - no wiring required.
- **Resumable, chunked uploads.** Large video files upload in configurable chunks and failed chunks retry automatically, so a dropped connection does not restart the whole upload.
- **Composable or headless.** Compose the individual parts for a custom layout, or use the `useUploader` hook to build your own UI while FastPix handles the upload engine.
- **Styling without a CSS library.** Theme it with CSS variables or the `appearance` prop; it ships TypeScript types and is React Server Component ready.

## Key Features

- **Resumable** - pause, resume, and cancel an in-progress upload.
- **Eager or lazy URL** - pass a URL string, or a function that returns one when a file is selected.
- **Customizable appearance** - customize the accent color, border radius, sizing, and other UI elements using CSS variables or the `appearance` prop. No styling library is required.
- **Server-rendering ready** - works in React Server Component setups (such as the Next.js App Router) without extra configuration.
- **Headless option** - use a hook to access the upload state and controls while rendering your own UI.
- **Typed** - ships with TypeScript definitions.
- **Accessible** - status changes are announced to assistive technology, supports keyboard navigation.

## Getting started

Run the example application to test the FastPix React Uploader.

Your app creates a signed upload URL on the server, hands it to the component, and the component uploads the file and calls back on success:

```text
your app ──── upload URL ────▶ <FastPixUploader /> ──── onSuccess ────▶ your app
```

Follow these steps in order:

1. [Clone the repository](#1-clone-the-repository)
2. [Open the example project](#2-open-the-example-project)
3. [Install dependencies](#3-install-dependencies)
4. [Start the example application](#4-start-the-example-application)
5. [Generate a FastPix signed upload URL](#5-generate-a-fastpix-signed-upload-url)
6. [Test the uploader](#6-test-the-uploader)
7. [Stop the example application](#7-stop-the-example-application)

### Before you begin

Make sure you have:

- Node.js 18 or later.
- npm.
- Git.
- Internet access.
- A FastPix account.
- A FastPix Access Token.
- A FastPix Secret Key.

FastPix uses HTTP Basic Authentication:

| SDK value | FastPix credential |
|---|---|
| `username` | Access Token |
| `password` | Secret Key |

You can obtain your credentials from the FastPix Dashboard. Follow the [Authentication with Basic Auth](https://fastpix.com/docs/getting-started/activate-your-account) guide for information about obtaining your credentials.

> **Security:** Never commit your Access Token or Secret Key to source control. Generate signed upload URLs server-side and keep your Secret Key out of your React application and browser.

## 1. Clone the repository

Clone the FastPix React Uploader repository:

```bash
git clone https://github.com/FastPix/react-web-uploader.git
```

Change to the repository directory:

```bash
cd react-web-uploader
```

## 2. Open the example project

The repository includes a minimal React + Vite example application.

```bash
cd example
```

## 3. Install dependencies

Install the dependencies:

```bash
npm install
```

Wait for the installation to complete successfully.

## 4. Start the example application

Start the development server:

```bash
npm run dev
```

The terminal displays a local URL similar to:

```text
Local: http://localhost:5173/
```

Open the URL in your browser.

If port `5173` is already in use, Vite may provide a different port. Use the URL displayed in your terminal.

## 5. Generate a FastPix signed upload URL

The example application requires a **FastPix signed upload URL** to upload a file.

Generate the signed upload URL using the FastPix **Upload media from device** API.

**5.1 Get your FastPix credentials**

You need the following FastPix credentials:

- Access Token ID
- Secret Key

Keep both values private. You will use them to authenticate the API request.

**5.2 Send a request to the FastPix API**

For this test, you can use curl from your terminal.

Run:

```bash
curl -X POST "https://api.fastpix.io/v1/on-demand/upload" \
  -u "ACCESS_TOKEN_ID:SECRET_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Client-Type: web-browser" \
  -d '{
    "corsOrigin": "*",
    "pushMediaSettings": {
      "accessPolicy": "public",
      "maxResolution": "1080p",
      "mediaQuality": "standard"
    }
  }'
```

Replace:

- `ACCESS_TOKEN_ID` with your FastPix Access Token ID.
- `SECRET_KEY` with your FastPix Secret Key.

For example:

```text
-u "your-access-token-id:your-secret-key"
```

Do not share your credentials or include them in client-side code.

**5.3 Verify the API response**

A successful request returns a response similar to:

```json
{
  "success": true,
  "data": {
    "uploadId": "040454fd-2242-4d42-ad06-0f51eb272083",
    "trial": true,
    "status": "waiting",
    "url": "https://storage.googleapis.com/...",
    "timeout": 14400
  }
}
```

Verify that `success` is `true` and that the response contains `data.url`.

The `data.url` value is the signed upload URL required by the React uploader.

**5.4 Copy the signed upload URL**

Copy the entire value of `data.url`.

For example:

```text
https://storage.googleapis.com/fastpix-uploads-asia/...?...&X-Goog-Signature=...
```

The signed URL includes the authorization information required for the upload, so copy the complete URL, including everything after `?`.

Keep the signed URL private. Treat the signed URL as temporary upload access. Do not publish it, commit it to Git, or include it in your source code. The signed URL expires after the timeout specified by the API response.

## 6. Test the uploader

The example application displays:

> FastPix React Uploader

and prompts you to:

> Paste a FastPix signed upload URL, then pick a file.

To test the uploader:

1. Copy the signed upload URL generated by your server.
2. Paste the URL into the **FastPix signed upload URL** field.
3. Select a video file.
4. Start the upload.
5. Verify that the upload progresses and completes successfully.

**Do not expose your FastPix Secret Key in the browser or client-side application.**

For more information, see the [Upload media from device](https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media) API documentation.

## 7. Stop the example application

When you finish testing, return to the terminal and press:

```text
Ctrl+C
```

This stops the development server.

## Installation

Install the component using your preferred package manager.

### Using npm

```bash
npm install @fastpix/fp-react-uploader@latest
```

### Using pnpm

```bash
pnpm add @fastpix/fp-react-uploader@latest
```

### Using yarn

```bash
yarn add @fastpix/fp-react-uploader@latest
```

`react` and `react-dom` (v18 or later) are peer dependencies and should already be in your app.

Import the stylesheet once, anywhere in your app (for example, your root layout or entry file):

```tsx
import "@fastpix/fp-react-uploader/styles.css";
```

## Basic Usage

### Import

```tsx
import { FastPixUploader } from "@fastpix/fp-react-uploader";
import "@fastpix/fp-react-uploader/styles.css";
```

### Integration

The fastest path - a complete uploader with sensible defaults:

```tsx
export default function UploadPage() {
  return <FastPixUploader endpoint="https://your-fastpix-upload-url" />;
}
```

### Providing the upload URL

In practice you'll create the upload URL once a file is selected. Pass a function to `endpoint` instead of a string - it receives the selected `File` and returns the URL (it may be async). Here `getSignedUrl` is your own function that returns a FastPix upload URL for the file:

```tsx
<FastPixUploader endpoint={getSignedUrl} />
```

> **Note:** The signed URL is created through the [Upload media from device](https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media) API. Keep that call on your server so your credentials are never exposed to the browser.

### Example project

A minimal, runnable React + Vite example lives in [`example/`](https://github.com/FastPix/react-web-uploader/tree/main/example). Run `npm install && npm run dev` in that folder to try the uploader end to end.

## Lifecycle Events

Pass callback props to respond to the upload lifecycle. All are optional.

```tsx
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

```tsx
import {
  FastPixUploader,
  FastPixDropZone,
  FastPixStatus,
  FastPixTrack,
  FastPixStartButton,
  FastPixPauseButton,
  FastPixResumeButton,
  FastPixAbortButton,
} from "@fastpix/fp-react-uploader";

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
</FastPixUploader>;
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
import { FastPixUploader, type FastPixUploaderRef } from "@fastpix/fp-react-uploader";

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

| State       | Meaning                                                                              |
| ----------- | ------------------------------------------------------------------------------------ |
| `idle`      | No file selected yet.                                                                |
| `ready`     | A file is selected but the upload hasn't started (only when `autoStart` is `false`). |
| `resolving` | Preparing the upload (resolving the URL from your `endpoint` function).              |
| `uploading` | Sending chunks.                                                                      |
| `paused`    | Upload held; it can be resumed from where it stopped.                                |
| `error`     | The upload failed; it can be retried.                                                |
| `success`   | All bytes delivered.                                                                 |

Typical flow: `idle → ready → resolving → uploading → success`, with `paused` reachable from `uploading`, and `error` recoverable into a new attempt.

**Endpoint.**
The `endpoint` prop is either a URL string (known up front) or a function `(file) => string | Promise<string>` that runs when the upload starts. Use the function form to create the URL per file.

**Controlled file.**
If your app already has a `File` (for example, from your own picker), pass it via the `file` prop instead of using the built-in picker or drop zone.

## Parameters Accepted

The `<FastPixUploader>` component accepts the following props:

| Name                | Type                                                    | Required | Description                                                                                                                                           |
| ------------------- | ------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `endpoint`          | `string` or `(file: File) => string \| Promise<string>` | Required | The upload URL, or a function returning it when the upload starts.                                                                                    |
| `file`              | `File`                                                  | Optional | Supply a file directly instead of using the picker / drop zone.                                                                                       |
| `autoStart`         | `boolean`                                               | Optional | Start uploading as soon as a valid file is available. Default is `true`. Set `false` to require an explicit start.                                    |
| `accept`            | `string`                                                | Optional | Allowed file types (e.g. `"video/*"`, `".mp4"`), enforced for both the picker and the drop zone. See [File access on mobile](#file-access-on-mobile). |
| `maxFileSize`       | `number` (in KB)                                        | Optional | Reject files larger than this before uploading.                                                                                                       |
| `chunkSize`         | `number` (in KB)                                        | Optional | Size of each upload chunk. **Minimum:** 5120 KB (5 MB), **Maximum:** 512000 KB (500 MB), in multiples of 256 KB.                                      |
| `retryChunkAttempt` | `number`                                                | Optional | Number of retry attempts per chunk on failure.                                                                                                        |
| `delayRetry`        | `number` (in seconds)                                   | Optional | Delay between retry attempts.                                                                                                                         |
| `disabled`          | `boolean`                                               | Optional | Disable all interaction. Default is `false`.                                                                                                          |
| `size`              | `"sm" \| "md" \| "lg"`                                  | Optional | Overall size of the rendered components. Default is `"md"`.                                                                                           |
| `appearance`        | `FastPixAppearance`                                     | Optional | Appearance values applied as CSS variables (see [Appearance](#appearance)).                                                                           |
| `className`         | `string`                                                | Optional | Class applied to the root element.                                                                                                                    |
| `style`             | `CSSProperties`                                         | Optional | Inline style applied to the root element.                                                                                                             |
| `children`          | `ReactNode`                                             | Optional | Provide components to compose your own layout. Omit for the default rendering.                                                                        |

### Example usage of integrating all parameters

```tsx
<FastPixUploader
  endpoint={getSignedUrl}
  autoStart={false}
  accept="video/*"
  maxFileSize={2_000_000} // 2 GB
  chunkSize={16_384} // 16 MB chunks
  retryChunkAttempt={6}
  delayRetry={2}
  size="lg"
  appearance={{ accentColor: "#00d1ff" }}
/>
```

### Events

All events are optional callback props on `<FastPixUploader>`.

| Name                    | Signature                                        | Fires when                                                                |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------- |
| `onFileSelect`          | `(file: File) => void`                           | A valid, readable file is picked or dropped.                              |
| `onFileReject`          | `(file: File, rejection: FileRejection) => void` | A file fails `accept`, `maxFileSize`, or can't be read.                   |
| `onUploadStart`         | `(file: File) => void`                           | The upload begins.                                                        |
| `onProgress`            | `(percent: number) => void`                      | Progress updates (0–100).                                                 |
| `onChunkAttempt`        | `(info: ChunkInfo) => void`                      | A chunk upload is attempted.                                              |
| `onChunkSuccess`        | `(info: ChunkInfo) => void`                      | A chunk finishes successfully.                                            |
| `onChunkAttemptFailure` | `(info: ChunkFailureInfo) => void`               | A chunk attempt fails and will be retried.                                |
| `onPause`               | `() => void`                                     | The upload is paused.                                                     |
| `onResume`              | `() => void`                                     | The upload is resumed.                                                    |
| `onAbort`               | `() => void`                                     | The upload is cancelled.                                                  |
| `onError`               | `(error: { message: string }) => void`           | The upload fails.                                                         |
| `onSuccess`             | `() => void`                                     | The upload completes.                                                     |
| `onStateChange`         | `(state: UploaderState) => void`                 | The state changes.                                                        |
| `onOffline`             | `() => void`                                     | The browser loses its network connection (fires while idle or uploading). |
| `onOnline`              | `() => void`                                     | The browser regains its network connection.                               |

`onFileReject` receives a `FileRejection` with a `reason` (`"type" | "size" | "unreadable" | "busy"`) and a ready-to-display `message`. The `"unreadable"` reason covers files the browser hands over but won't let the page read - see [File access on mobile](#file-access-on-mobile). The `"busy"` reason fires when a file is selected while an upload is already in progress; cancel the current upload before selecting another.

The chunk events report which chunk is in flight and how many there are: `ChunkInfo` carries `{ chunkNumber, totalChunks?, chunkSize? }`, and `ChunkFailureInfo` carries `{ chunkNumber, attempt, totalAttempts }`. Failure events report only chunk counters. To determine the cause of a failure, use the `onError` callback.

### Ref (imperative control)

Pass a `ref` typed as `FastPixUploaderRef` to control the component from outside.

| Method       | Description                                           |
| ------------ | ----------------------------------------------------- |
| `start()`    | Start the upload (use with `autoStart={false}`).      |
| `pause()`    | Pause the active upload.                              |
| `resume()`   | Resume a paused upload.                               |
| `abort()`    | Cancel the upload and return to idle.                 |
| `reset()`    | Clear the file and return to idle ("upload another"). |
| `getState()` | Returns the current `UploaderState`.                  |
| `getFile()`  | Returns the current `File`, or `null`.                |

```tsx
const ref = useRef<FastPixUploaderRef>(null);
// later:
ref.current?.start();
if (ref.current?.getState() === "error") ref.current.reset();
```

## Components

All components accept `className` and `style`. They must be rendered inside `<FastPixUploader>`.

### `<FastPixFilePicker>`

A standalone button that opens the file picker. Use it on its own or alongside `FastPixDropZone`. Do not place it inside `FastPixDropZone`, because the drop zone already opens the file picker when clicked.

| Name       | Type        | Description                                 |
| ---------- | ----------- | ------------------------------------------- |
| `children` | `ReactNode` | Custom button label (default: `"Browse…"`). |

```tsx
<FastPixFilePicker>Select a video</FastPixFilePicker>
```

### `<FastPixDropZone>`

A drop area that also opens the file dialog when clicked or activated with the keyboard. Put inline, non-interactive content inside it (text or an icon) - not another button.

| Name       | Type        | Description                                                                        |
| ---------- | ----------- | ---------------------------------------------------------------------------------- |
| `overlay`  | `boolean`   | Show a highlight overlay while a file is dragged over.                             |
| `label`    | `string`    | Accessible label for the zone (default: `"Drag a file here, or press to browse"`). |
| `children` | `ReactNode` | Inline content shown inside the zone.                                              |

```tsx
<FastPixDropZone overlay>
  <p>Drag a video here, or click to browse</p>
</FastPixDropZone>
```

### `<FastPixTrack>`

The progress indicator.

| Name        | Type                   | Description                                       |
| ----------- | ---------------------- | ------------------------------------------------- |
| `variant`   | `"linear" \| "radial"` | Bar or circular indicator. Default is `"linear"`. |
| `showLabel` | `boolean`              | Show the percentage. Default is `false`.          |

```tsx
<FastPixTrack variant="radial" showLabel />
```

### `<FastPixStatus>`

Text describing the current state.

| Name     | Type                                     | Description                                                         |
| -------- | ---------------------------------------- | ------------------------------------------------------------------- |
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

### `<FastPixStartButton>`

Starts the upload. Active when a file is ready (or to retry after an error). Pair with `autoStart={false}`.

| Name       | Type        | Description                         |
| ---------- | ----------- | ----------------------------------- |
| `children` | `ReactNode` | Custom label (default: `"Upload"`). |

```tsx
<FastPixStartButton>Start upload</FastPixStartButton>
```

### `<FastPixPauseButton>`

Pauses an active upload.

| Name       | Type        | Description                        |
| ---------- | ----------- | ---------------------------------- |
| `children` | `ReactNode` | Custom label (default: `"Pause"`). |

```tsx
<FastPixPauseButton>Hold</FastPixPauseButton>
```

### `<FastPixResumeButton>`

Resumes a paused upload.

| Name       | Type        | Description                         |
| ---------- | ----------- | ----------------------------------- |
| `children` | `ReactNode` | Custom label (default: `"Resume"`). |

```tsx
<FastPixResumeButton>Continue</FastPixResumeButton>
```

### `<FastPixAbortButton>`

Cancels the upload and returns to idle.

| Name       | Type        | Description                         |
| ---------- | ----------- | ----------------------------------- |
| `children` | `ReactNode` | Custom label (default: `"Cancel"`). |

```tsx
<FastPixAbortButton>Cancel</FastPixAbortButton>
```

## Hooks

### `useUploaderContext()`

Access the upload state and controls from within a custom child component of `<FastPixUploader>`. Use this hook to build custom components that integrate with the uploader.

```tsx
import { useUploaderContext } from "@fastpix/fp-react-uploader";

function MyProgress() {
  const { state, progress } = useUploaderContext();
  return <div>{state === "uploading" ? `${progress}%` : state}</div>;
}

// then render <MyProgress /> inside <FastPixUploader>…</FastPixUploader>
```

It returns:

| Name                                             | Type                          | Description                                                |
| ------------------------------------------------ | ----------------------------- | ---------------------------------------------------------- |
| `state`                                          | `UploaderState`               | Current state.                                             |
| `progress`                                       | `number`                      | 0–100.                                                     |
| `file`                                           | `File \| null`                | Selected file.                                             |
| `error`                                          | `{ message: string } \| null` | Last error.                                                |
| `isOffline`                                      | `boolean`                     | Live network status, tracked in all states including idle. |
| `disabled`                                       | `boolean`                     | Whether interaction is disabled.                           |
| `accept`                                         | `string \| undefined`         | The configured file filter.                                |
| `selectFile`                                     | `(file: File) => void`        | Select a file (runs validation).                           |
| `start` / `pause` / `resume` / `abort` / `reset` | `() => void`                  | Control actions.                                           |

### `useUploader(props)`

Build a completely custom uploader with no provided markup. It takes the same options as `<FastPixUploader>` and returns the same controls as `useUploaderContext()`, for you to wire into your own components.

```tsx
import { useUploader } from "@fastpix/fp-react-uploader";

function HeadlessUploader() {
  const { state, progress, selectFile, start } = useUploader({
    endpoint: getSignedUrl,
    autoStart: false,
  });

  return (
    <div>
      <input type="file" onChange={(e) => e.target.files?.[0] && selectFile(e.target.files[0])} />
      <button onClick={start} disabled={state !== "ready"}>
        Upload
      </button>
      <progress value={progress} max={100} />
    </div>
  );
}
```

## Appearance

There are three ways to customize the appearance, from lightest to most involved. They can be combined.

**1. CSS variables.** Set any `--fastpix-*` variable on the component (or globally on `:root`). This covers most cases.

```css
.fastpix-uploader {
  --fastpix-accent-color: #00d1ff;
  --fastpix-radius: 12px;
  --fastpix-surface: #111;
}
```

**2. The `appearance` prop.** The same variables as a typed object, when you'd rather not write CSS.

```tsx
<FastPixUploader endpoint={getSignedUrl} appearance={{ accentColor: "#00d1ff", radius: "12px" }} />
```

**3. `className` / `style`.** Every component accepts these for full control.

### CSS variables

| Variable                           | Controls                                               | Default                                  |
| ---------------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `--fastpix-accent-color`           | Accent: progress fill, active borders, primary buttons | `#3b82f6`                                |
| `--fastpix-bg`                     | Component background                                   | `transparent`                            |
| `--fastpix-surface`                | Inner surfaces (drop zone)                             | `#0f0f0f`                                |
| `--fastpix-text-color`             | Primary text                                           | `#e5e5e5`                                |
| `--fastpix-text-muted`             | Secondary text                                         | `#8a8a8a`                                |
| `--fastpix-border-color`           | Borders                                                | `#333`                                   |
| `--fastpix-border-color-hover`     | Hover border                                           | `#555`                                   |
| `--fastpix-radius`                 | Corner radius                                          | `8px`                                    |
| `--fastpix-font-family`            | Font stack                                             | `system-ui, sans-serif`                  |
| `--fastpix-error-color`            | Error text / border                                    | `#ef4444`                                |
| `--fastpix-success-color`          | Success text / border                                  | `#22c55e`                                |
| `--fastpix-gap`                    | Internal spacing                                       | `1rem`                                   |
| `--fastpix-padding`                | Component padding                                      | `2rem`                                   |
| `--fastpix-track-height`           | Progress bar thickness                                 | `8px`                                    |
| `--fastpix-track-bg`               | Empty track                                            | `#222`                                   |
| `--fastpix-track-fill`             | Filled track                                           | `var(--fastpix-accent-color)`            |
| `--fastpix-track-radius`           | Track radius                                           | `999px`                                  |
| `--fastpix-dropzone-border`        | Drop zone border (idle)                                | `2px dashed var(--fastpix-border-color)` |
| `--fastpix-dropzone-border-active` | Drop zone border (dragging)                            | `var(--fastpix-accent-color)`            |
| `--fastpix-dropzone-bg`            | Drop zone background (idle)                            | `var(--fastpix-surface)`                 |
| `--fastpix-dropzone-bg-active`     | Drop zone background (dragging)                        | accent tint                              |
| `--fastpix-overlay-bg`             | Drag overlay                                           | `rgba(0,0,0,.6)`                         |
| `--fastpix-button-bg`              | Button background                                      | `var(--fastpix-accent-color)`            |
| `--fastpix-button-text`            | Button label                                           | `#fff`                                   |
| `--fastpix-button-bg-hover`        | Button hover background                                | darker accent                            |
| `--fastpix-button-radius`          | Button radius                                          | `var(--fastpix-radius)`                  |

### `appearance` prop keys

`accentColor`, `background`, `surface`, `textColor`, `mutedColor`, `borderColor`, `radius`, `fontFamily`, `trackHeight`, `trackFill`, `errorColor`, `successColor`.

### Styling by state

The root carries the current state as a data attribute, so you can style any phase in plain CSS:

```css
.fastpix-uploader[data-fastpix-state="error"] {
  /* error look */
}
.fastpix-uploader[data-fastpix-state="success"] {
  /* success look */
}
.fastpix-dropzone[data-fastpix-dragging] {
  /* while dragging */
}
```

Available hooks: `data-fastpix-state` (the current state), `data-fastpix-dragging` (on the drop zone), `data-fastpix-size` (`sm`/`md`/`lg`), and `data-fastpix-disabled`.

### Size

The `size` prop (`"sm" | "md" | "lg"`) scales padding, spacing, text, and control sizes together.

```tsx
<FastPixUploader endpoint={getSignedUrl} size="sm" />
```

## Types

All types are exported for use in your own code:

`FastPixUploaderProps`, `FastPixUploaderRef`, `FastPixAppearance`, `UploaderState`, `UploaderError`, `UploaderContextValue`, `Endpoint`, `EndpointResolver`, `FileRejection`, `ChunkInfo`, `ChunkFailureInfo`, and the prop types for each component (`FastPixFilePickerProps`, `FastPixDropZoneProps`, `FastPixTrackProps`, `FastPixStatusProps`, `FastPixStartButtonProps`, `FastPixPauseButtonProps`, `FastPixResumeButtonProps`, `FastPixAbortButtonProps`).

## File access on mobile

A browser provides a `File` object that your application cannot read. This commonly occurs on Android when using `accept="video/*"`, which opens the Photos or Gallery app. The selected file might be sandboxed, preventing the browser from reading its contents for upload.

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

## Which FastPix upload tool should I use?

| If you're building with... | Use |
|---|---|
| **React** - a drop-in uploader component (this repo) | **react-web-uploader** - `@fastpix/fp-react-uploader` |
| **Any JavaScript / framework-agnostic** - the headless upload engine | [web-uploads-sdk](https://github.com/FastPix/web-uploads-sdk) - `@fastpix/resumable-uploads` |
| **Playing** the uploaded video on the web | [web-player-component](https://github.com/FastPix/web-player-component) - `@fastpix/fp-player` |

Browse every SDK and tool in the [FastPix organization](https://github.com/orgs/FastPix/repositories).

## FAQ

**How do I add a resumable file uploader to my React app?**
Install `@fastpix/fp-react-uploader`, import the stylesheet once, and render `<FastPixUploader endpoint={getSignedUrl} />`. See [Installation](#installation) and [Basic Usage](#basic-usage).

**How do I upload large video files in chunks from the browser?**
The component uploads in resumable chunks and retries failed chunks automatically. Tune `chunkSize`, `maxFileSize`, and `retryChunkAttempt`. See [Parameters Accepted](#parameters-accepted).

**How do I let users pause and resume an upload?**
Use the built-in `FastPixPauseButton` / `FastPixResumeButton`, or drive it from a ref with `pause()` / `resume()`. See [Composition](#composition) and [Ref (imperative control)](#ref-imperative-control).

**Does it work with Next.js App Router and React Server Components?**
Yes. The pieces are client components and render directly inside server components with no extra setup. See [Framework and browser support](#framework-and-browser-support).

**How do I show upload progress?**
Read the `onProgress` callback (0-100) or drop in `<FastPixTrack showLabel />`. See [Lifecycle Events](#lifecycle-events) and [Components](#components).

**How do I build a fully custom uploader UI?**
Use the `useUploader` hook - it returns the upload state and controls with no provided markup, so you render your own UI. See [Hooks](#hooks).

**Where does the upload URL come from?**
Create a signed upload URL on your server with the Upload media from device API, then pass it (or a function that returns it per file) to `endpoint`. See [Generate a FastPix signed upload URL](#5-generate-a-fastpix-signed-upload-url).

**How do I restrict file types or maximum size?**
Set the `accept` and `maxFileSize` props; both the picker and the drop zone enforce them. See [Parameters Accepted](#parameters-accepted).

**Is it written in TypeScript?**
Yes - it ships TypeScript definitions and exports every prop and state type. See [Types](#types).

**How do I match it to my brand?**
Set `--fastpix-*` CSS variables or the `appearance` prop (accent color, radius, surfaces, and more) - no styling library needed. See [Appearance](#appearance).

**Why does a file fail to upload on Android?**
The Photos/Gallery picker can hand the browser a file it cannot read. The component detects this and rejects it via `onFileReject` with `reason: "unreadable"`, telling the user to pick from their file manager instead. See [File access on mobile](#file-access-on-mobile).

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
