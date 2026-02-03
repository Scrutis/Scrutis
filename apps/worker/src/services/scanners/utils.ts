import path from 'node:path';

const DEFAULT_TIMEOUT_MS = 15000;

const severityRank: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function getHighestSeverity(results: { severity: string | null }[]) {
  let highest: string | null = null;
  let highestRank = 0;
  for (const result of results) {
    if (!result.severity) continue;
    const rank = severityRank[result.severity] || 0;
    if (rank > highestRank) {
      highestRank = rank;
      highest = result.severity;
    }
  }
  return highest;
}

export function determineOverallResult(results: { detected: boolean }[]) {
  const anyDetected = results.some((result) => result.detected);
  return anyDetected ? 'infected' : 'clean';
}

export function getUploadsDir() {
  return process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(process.cwd(), '../web/uploads');
}

export function normalizeFilePath(filePath: string) {
  const uploadsDir = getUploadsDir();
  if (filePath.startsWith('/uploads/')) {
    return path.join(uploadsDir, filePath.replace(/^\/uploads\//, ''));
  }
  if (filePath.startsWith('uploads/')) {
    return path.join(uploadsDir, filePath.replace(/^uploads\//, ''));
  }
  if (path.isAbsolute(filePath)) return filePath;
  return path.join(uploadsDir, filePath);
}

export function ensureFileWithinUploads(filePath: string) {
  const uploadsDir = getUploadsDir();
  const relative = path.relative(uploadsDir, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('File path is outside uploads directory');
  }
  return { uploadsDir, relative };
}

export function splitCommand(value?: string) {
  if (!value) return [];
  return value.split(' ').map((item) => item.trim()).filter(Boolean);
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchJson<T>(
  url: string,
  options: RequestInit,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    const json = text ? JSON.parse(text) : {};
    if (!response.ok) {
      const message = json?.error?.message || json?.message || response.statusText;
      throw new Error(`Request failed (${response.status}): ${message}`);
    }
    return json as T;
  } finally {
    clearTimeout(timeout);
  }
}
