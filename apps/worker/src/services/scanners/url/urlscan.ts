import type { EngineResult } from '../types.js';
import { fetchJson, sleep } from '../utils.js';

export async function runUrlScan(url: string): Promise<EngineResult> {
  const apiKey = process.env.URLSCAN_API_KEY;
  if (!apiKey) {
    return {
      engine: 'urlscan',
      detected: false,
      threatName: null,
      severity: null,
      details: {
        error: 'URLSCAN_API_KEY not set',
      },
    };
  }

  const submission = await fetchJson<{ uuid?: string }>('https://urlscan.io/api/v1/scan/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': apiKey,
    },
    body: JSON.stringify({ url, visibility: 'private' }),
  });

  if (!submission.uuid) {
    return {
      engine: 'urlscan',
      detected: false,
      threatName: null,
      severity: null,
      details: {
        error: 'urlscan did not return uuid',
        response: submission,
      },
    };
  }

  let result: any = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      result = await fetchJson(`https://urlscan.io/api/v1/result/${submission.uuid}/`, {
        method: 'GET',
        headers: { 'API-Key': apiKey },
      });
      break;
    } catch (error) {
      if (attempt < 2) {
        await sleep(2000);
        continue;
      }
      throw error;
    }
  }

  const verdicts = result?.verdicts?.overall || {};
  const score = verdicts.score || 0;
  const malicious = verdicts.malicious || verdicts.malware || false;

  return {
    engine: 'urlscan',
    detected: Boolean(malicious) || score < 0,
    threatName: malicious ? 'malicious' : score < 0 ? 'suspicious' : null,
    severity: malicious ? 'high' : score < 0 ? 'medium' : null,
    details: result || {},
  };
}
