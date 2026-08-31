# `@fastpix/fp-react-uploader` — example

Minimal React + Vite app that consumes the published SDK and lets you run a real
resumable upload end to end — file select, progress, and pause/resume/abort.

## What this is

A plain [Vite](https://vite.dev) + React app that renders `<FastPixUploader />`
from the published [`@fastpix/fp-react-uploader`](https://www.npmjs.com/package/@fastpix/fp-react-uploader)
package. Nothing to configure in code — you paste a signed upload URL into the
page at runtime. Edits to `src/App.jsx` hot-reload as usual.

## One-time setup

```bash
cd example
npm install
```

This pulls React 19, Vite, **and** the published SDK (the
`"@fastpix/fp-react-uploader"` entry in `package.json`).

## Run

```bash
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## What to expect

1. The page shows a URL input and the uploader.
2. Paste a signed upload URL, then pick or drop a file.
3. As chunks upload, the track fills and the component reflects
   `resolving → uploading → success`.
4. Lifecycle events are logged to the browser console (`progress`, `success`,
   `error`) — see the callbacks in `src/App.jsx`.

## Configure before running

Nothing to edit — the signed upload URL is pasted into the input on the page.

You generate that URL server-side with the
[Upload media from device](https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media)
API, using your **Access Token** and **Secret Key** from
`https://dashboard.fastpix.com`. Keep that call on your server so your
credentials never reach the browser.

## Verifying the upload in the FastPix dashboard

After the uploader reports success:

1. Visit `https://dashboard.fastpix.com → Media`.
2. The new upload appears and moves to **Ready** once processing finishes.

## Troubleshooting

- **Uploader shows an error the moment you pick a file** — you didn't enter a
  URL first. The `endpoint` resolver in `src/App.jsx` throws when the input is
  empty; that surfaces as the recoverable error state by design. Enter a URL and
  pick the file again.
- **Upload fails immediately** — the signed URL is expired or malformed. Signed
  upload URLs are short-lived; generate a fresh one.
- **Want the local build instead of the published package** — this example is
  pinned to the published npm version on purpose. To test unreleased changes,
  add a Vite alias pointing `@fastpix/fp-react-uploader` at the repo's `../dist`.

## How this affects the published package

This example lives at `example/` inside the SDK repo. The SDK's `package.json`
uses `"files": ["dist"]`, so **the example never ships to npm** — it stays in
source control as documentation.
