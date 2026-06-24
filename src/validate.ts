import type { FastPixUploaderProps } from "./types";

const CHUNK_MIN = 5120;
const CHUNK_MAX = 512000;
const CHUNK_STEP = 256;

const isFiniteNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const isInt = (v: unknown): v is number => isFiniteNumber(v) && Number.isInteger(v);

function describe(v: unknown): string {
  if (v === null) return "null";
  if (typeof v === "string") return `"${v}"`;
  if (typeof v === "object") return `${typeof v} (${JSON.stringify(v)})`;
  return `${typeof v} (${String(v)})`;
}

function validEndpoint(v: unknown): string | null {
  if ((typeof v === "string" && v.trim() !== "") || typeof v === "function") return null;
  return `endpoint must be a non-empty string or a function; received ${describe(v)}`;
}

function validChunkSize(v: unknown): string | null {
  if (v === undefined) return null;
  if (!isInt(v)) return `chunkSize must be an integer in KB; received ${describe(v)}`;
  if (v < CHUNK_MIN || v > CHUNK_MAX || v % CHUNK_STEP !== 0) {
    return `chunkSize must be a multiple of ${CHUNK_STEP} between ${CHUNK_MIN} and ${CHUNK_MAX} KB; received ${v}`;
  }
  return null;
}

function validPositive(name: string, v: unknown, unit: string): string | null {
  if (v === undefined) return null;
  if (!isFiniteNumber(v) || v <= 0) return `${name} must be a positive number in ${unit}; received ${describe(v)}`;
  return null;
}

function validNonNegInt(name: string, v: unknown): string | null {
  if (v === undefined) return null;
  if (!isInt(v) || v < 0) return `${name} must be a non-negative integer; received ${describe(v)}`;
  return null;
}

function validNonNeg(name: string, v: unknown, unit: string): string | null {
  if (v === undefined) return null;
  if (!isFiniteNumber(v) || v < 0) return `${name} must be a non-negative number in ${unit}; received ${describe(v)}`;
  return null;
}

function validEnum(name: string, v: unknown, allowed: readonly string[]): string | null {
  if (v === undefined) return null;
  if (typeof v !== "string" || !allowed.includes(v)) {
    const list = allowed.map((a) => '"' + a + '"').join(", ");
    return `${name} must be one of ${list}; received ${describe(v)}`;
  }
  return null;
}

function validBool(name: string, v: unknown): string | null {
  if (v === undefined || typeof v === "boolean") return null;
  return `${name} must be a boolean; received ${describe(v)}`;
}

function validString(name: string, v: unknown): string | null {
  if (v === undefined || typeof v === "string") return null;
  return `${name} must be a string; received ${describe(v)}`;
}

function validFile(v: unknown): string | null {
  if (v === undefined || (typeof File !== "undefined" && v instanceof File)) return null;
  return `file must be a File; received ${describe(v)}`;
}

const RULES: ReadonlyArray<(p: FastPixUploaderProps) => string | null> = [
  (p) => validEndpoint(p.endpoint),
  (p) => validChunkSize(p.chunkSize),
  (p) => validPositive("maxFileSize", p.maxFileSize, "KB"),
  (p) => validNonNegInt("retryChunkAttempt", p.retryChunkAttempt),
  (p) => validNonNeg("delayRetry", p.delayRetry, "seconds"),
  (p) => validEnum("size", p.size, ["sm", "md", "lg"]),
  (p) => validBool("autoStart", p.autoStart),
  (p) => validBool("disabled", p.disabled),
  (p) => validString("accept", p.accept),
  (p) => validFile(p.file),
];

export function validateConfig(props: FastPixUploaderProps): string | null {
  const errors = RULES.map((rule) => rule(props)).filter((e): e is string => e !== null);
  if (errors.length === 0) return null;
  return `Invalid props: - ${errors.join(" - ")}`;
}

export interface FileAccessResult {
  ok: boolean;
  message: string;
}

export async function checkFileReadable(file: File): Promise<FileAccessResult> {
  try {
    await file.slice(0, 8).arrayBuffer();
    return { ok: true, message: "" };
  } catch {
    const { browser, os } = detectClient();
    const hint =
      os === "Android"
        ? "On Android, pick the video from your device's Files / Internal storage instead of the Photos/Gallery picker."
        : "Re-select the file from your file manager and try again.";
    return {
      ok: false,
      message: `"${file.name}" couldn't be read by ${browser} on ${os}. ${hint}`,
    };
  }
}

function detectClient(): { browser: string; os: string } {
  // eslint-disable-next-line sonarjs/no-negated-condition
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  return { browser: detectBrowser(ua), os: detectOS(ua) };
}

const OS_TABLE: ReadonlyArray<[RegExp, string]> = [
  [/Android/i, "Android"],
  [/iPhone|iPad|iPod/i, "iOS"],
  [/Windows/i, "Windows"],
  [/Mac/i, "macOS"],
  [/Linux/i, "Linux"],
];

const BROWSER_TABLE: ReadonlyArray<[RegExp, string]> = [
  [/Edg\//i, "Edge"],       // must precede Chrome — Edge UA contains "Chrome"
  [/Chrome\//i, "Chrome"],
  [/Firefox\//i, "Firefox"],
  [/Safari\//i, "Safari"],
];

function matchTable(ua: string, table: ReadonlyArray<[RegExp, string]>, fallback: string): string {
  for (const [pattern, label] of table) {
    if (pattern.test(ua)) return label;
  }
  return fallback;
}

function detectOS(ua: string): string {
  return matchTable(ua, OS_TABLE, "your device");
}

function detectBrowser(ua: string): string {
  return matchTable(ua, BROWSER_TABLE, "your browser");
}