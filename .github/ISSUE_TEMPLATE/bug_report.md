---
name: Bug Report
about: Report an issue related to the FastPix React Uploader
title: '[BUG] '
labels: bug
assignees: ''
---

# Bug Description
Provide a clear and concise description of the issue you encountered with the FastPix React Uploader.

---

# Steps to Reproduce

### 1. **SDK Setup**

Install the FastPix React Uploader (currently in beta, so install from the `beta` tag):

```bash
npm install @fastpix/fp-react-uploader@beta
```

Import the stylesheet once, anywhere in your app:

```tsx
import "@fastpix/fp-react-uploader/styles.css";
```

**Basic usage:**

```tsx
import { FastPixUploader } from "@fastpix/fp-react-uploader";
import "@fastpix/fp-react-uploader/styles.css";

<FastPixUploader endpoint="https://your-fastpix-upload-url" />
```

### 2. **Example Code to Reproduce**

Provide a minimal reproducible snippet that shows the issue. Example:

```tsx
<FastPixUploader
  endpoint={getSignedUrl}
  accept="video/*"
  onSuccess={() => console.log("Upload complete")}
  onError={(err) => console.error("Upload error:", err.message)}
/>
```

Replace with the exact code where the bug occurs.

---

# Expected Behavior
```
<!-- Describe what you expected to happen -->
```

# Actual Behavior
```
<!-- Describe what actually happened -->
```

---

# Environment

- **Package Version**: [e.g., 1.0.0]
- **Browser**: [e.g., Chrome 120, Safari 17.2, Firefox 121]
- **OS**: [e.g., macOS 14, Windows 11, iOS 17]
- **Node/npm**: [e.g., Node 20, npm 10]
- **Framework**: [e.g., React 18, Next.js App Router, Vite, Create React App]
- **Integration**: [Default `<FastPixUploader />` / Composed with individual components / Headless via `useUploader`]

---

# Logs / Errors / Console Output
```
Paste browser console logs, network errors, or SDK errors here
```

---

# Additional Context
Add any information that might help, such as:

- Resumable upload behavior (pause / resume / cancel)
- Chunk size or retry configuration used
- Mobile file access issues (Android Photos/Gallery picker)
- Server-rendered (RSC / Next.js App Router) setup
- Custom appearance or CSS variable overrides

---

# Screenshots / Screen Recording
If applicable, attach screenshots or a short video demonstrating the issue.
