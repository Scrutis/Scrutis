import type { EngineResult } from '../types.js';
import { fetchJson } from '../utils.js';

export async function runPhishTank(url: string): Promise<EngineResult> {
  const apiKey = process.env.PHISHTANK_API_KEY;
  if (!apiKey) {
    return {
      engine: 'phishtank',
      detected: false,
      threatName: null,
      severity: null,
      details: {
        error: 'PHISHTANK_API_KEY not set',
      },
    };
  }

  const body = new URLSearchParams({
    url,
    format: 'json',
    app_key: apiKey,
  });

  const response = await fetchJson<{
    results?: { in_database?: boolean; valid?: boolean; verified?: boolean; phish_detail_url?: string };
  }>('https://checkurl.phishtank.com/checkurl/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const inDatabase = response.results?.in_database;
  const valid = response.results?.valid;
  const detected = Boolean(inDatabase && valid);

  return {
    engine: 'phishtank',
    detected,
    threatName: detected ? 'phishing' : null,
    severity: detected ? 'high' : null,
    details: response,
  };
}
