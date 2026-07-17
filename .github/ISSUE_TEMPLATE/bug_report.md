---
name: Bug Report
about: Report an issue related to the FastPix React Uploader
title: '[BUG] '
labels: bug
assignees: ''
---
Report an issue with the FastPix React Uploader.

**Important**

Never include secrets such as signed upload URLs, API tokens, or access credentials. Redact any sensitive values before submitting the report.

# Bug Description
Provide a clear and concise description of the issue you encountered with the FastPix React Uploader.

## Severity

How severely does this issue affect your application?

- [ ] Blocks production
- [ ] High
- [ ] Medium
- [ ] Low

# Steps to Reproduce

### 1. **SDK Setup**

Install the FastPix React Uploader:

```bash
npm install @fastpix/fp-react-uploader
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

Package manager used:

- npm
- pnpm
- Yarn
- Bun

## Logs or Errors Messages
```
Paste browser console logs, network errors, or SDK errors here
```

# Additional Context
Provide any additional information that might help reproduce the issue, such as:

- Resumable upload behavior (pause / resume / cancel)
- Chunk size or retry configuration used
- Mobile file access issues (Android Photos/Gallery picker)
- Server-rendered (RSC / Next.js App Router) setup
- Custom appearance or CSS variable overrides

## Checklist

- [ ] Included a minimal reproduction
- [ ] Included environment details
- [ ] Included logs or error messages (if available)
- [ ] Redacted all sensitive information
- [ ] Checked for existing issues

# Screenshots / Screen Recording
If applicable, attach screenshots or a short video demonstrating the issue.
