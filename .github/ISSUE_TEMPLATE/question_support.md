---
name: Question/Support
about: Ask questions or get help with the FastPix React Uploader
title: '[QUESTION] '
labels: ['question', 'needs-triage']
assignees: ''
---

# Question/Support

Need help with the FastPix React Uploader?

Complete the sections below so we can understand your question and help you more quickly.

**Important**

Never include signed upload URLs, API keys, access tokens, or other secrets. Redact any sensitive information before submitting your issue.

## Question Type
- [ ] How to use a specific component or prop
- [ ] Integration help
- [ ] Configuration question (chunk size, retries, appearance)
- [ ] Performance question
- [ ] Troubleshooting help
- [ ] Other: _______________

## Question
**What would you like to know?**

<!-- Provide a clear and specific question about the React Uploader -->

## What You've Tried
**Describe what you've already tried.**

```tsx
import { FastPixUploader } from "@fastpix/fp-react-uploader";
import "@fastpix/fp-react-uploader/styles.css";

<FastPixUploader
  endpoint={getSignedUrl}
  accept="video/*"
/>
```

## Current Setup
**Describe your current setup:**
- Framework (React, Next.js App Router, Vite, CRA, etc.), and whether you're using the default `<FastPixUploader />`, composing individual components, or the headless `useUploader` hook.

## Environment
- **Package Version**: [e.g., 1.0.0]
- **Browser**: [e.g., Chrome 120, Safari 17]
- **OS**: [e.g., macOS 14, Windows 11]
- **Node/npm**: [e.g., Node 20, npm 10]
- **Framework**: [e.g., React 18, Next.js App Router, Vite, CRA]
- **Integration**: [Default component / Composed components / Headless hook]

## Configuration
**Current uploader configuration:**

```tsx
<FastPixUploader
  endpoint={getSignedUrl}
  autoStart={false}
  accept="video/*"
  maxFileSize={2_000_000}
  chunkSize={16_384}
  retryChunkAttempt={6}
/>
```

## Expected Outcome
**What are you trying to achieve?**

<!-- Example: Custom layout with composed components, resumable uploads, custom appearance, mobile file access, etc. -->

## Error Messages (if any)
```
<!-- Paste any console errors or unexpected behavior -->
```

## Additional Context

### Use Case
**What type of application are you building?**
- [ ] Web app (React, Next.js, etc.)
- [ ] Content management / upload dashboard
- [ ] Video streaming product
- [ ] Other: _______________

### Resources Checked
**What resources have you already checked?**
- [ ] README.md
- [ ] CHANGELOG.md
- [ ] Code examples
- [ ] GitHub Issues
- [ ] Other: _______________

## Priority
Please indicate the urgency:
- [ ] Critical (Blocking production deployment)
- [ ] High (Blocking development)
- [ ] Medium (Would like to know soon)
- [ ] Low (Just curious)

## Checklist
Before submitting, please ensure:
- [ ] I have provided a clear question
- [ ] I have described what I've tried
- [ ] I have included my current setup and environment
- [ ] I have checked existing documentation
- [ ] I have provided sufficient context

---

**We'll do our best to help you get unstuck!**

**Helpful Resources:**
- [FastPix Documentation](https://fastpix.com/docs/video-on-demand-api/upload-and-import-videos/direct-upload-video-media)
- [React Uploader README](https://github.com/FastPix/react-web-uploader#readme)
- [GitHub Discussions](https://github.com/FastPix/react-web-uploader/issues)
