import type { EngineResult } from '../types.js';
import { fetchJson } from '../utils.js';

export async function runSafeBrowsing(url: string): Promise<EngineResult> {
  const apiKey = process.env.SAFE_BROWSING_API_KEY;
  if (!apiKey) {
    return {
      engine: 'google-safe-browsing',
      detected: false,
      threatName: null,
      severity: null,
      details: {
        error: 'SAFE_BROWSING_API_KEY not set',
      },
    };
  }

  const body = {
    client: {
      clientId: 'scrutis-worker',
      clientVersion: '1.0.0',
    },
    threatInfo: {
      threatTypes: [
        'MALWARE',
        'SOCIAL_ENGINEERING',
        'UNWANTED_SOFTWARE',
        'POTENTIALLY_HARMFUL_APPLICATION',
      ],
      platformTypes: ['ANY_PLATFORM'],
      threatEntryTypes: ['URL'],
      threatEntries: [{ url }],
    },
  };

  const response = await fetchJson<{ matches?: Array<{ threatType: string }> }>(
    `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  const match = response.matches?.[0];
  return {
    engine: 'google-safe-browsing',
    detected: Boolean(match),
    threatName: match?.threatType || null,
    severity: match ? 'high' : null,
    details: response,
  };
}
