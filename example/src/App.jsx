import { useState } from "react";
import { FastPixUploader } from "@fastpix/fp-react-uploader";

export default function App() {
  const [url, setUrl] = useState("");

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <h1>FastPix React Uploader</h1>
      <p>
        Paste a FastPix signed upload URL (created server-side via the{" "}
        <a href="https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media">
          Upload media from device
        </a>{" "}
        API), then pick a file.
      </p>

      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://your-fastpix-upload-url"
        style={{ width: "100%", padding: 8, marginBottom: 16, boxSizing: "border-box" }}
      />

      <FastPixUploader
        // Resolver reads the latest input when a file is selected. Throwing here
        // (no URL yet) surfaces as the uploader's error state — no host crash.
        endpoint={() => {
          if (!url) throw new Error("Enter an upload URL first.");
          return url;
        }}
        accept="video/*"
        onProgress={(p) => console.log("progress:", p)}
        onSuccess={() => console.log("upload complete")}
        onError={(err) => console.error("upload error:", err.message)}
      />
    </main>
  );
}
