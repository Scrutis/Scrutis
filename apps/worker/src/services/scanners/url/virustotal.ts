import type { EngineResult } from '../types.js';
import { fetchJson } from '../utils.js';

export async function runVirusTotal(url: string): Promise<EngineResult> {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  if (!apiKey) {
    return {
      engine: 'virustotal',
      detected: false,
      threatName: null,
      severity: null,
      details: {
        error: 'VIRUSTOTAL_API_KEY not set',
      },
    };
  }

  const submission = await fetchJson<{ data?: { id?: string } }>(
    'https://www.virustotal.com/api/v3/urls',
    {
      method: 'POST',
      headers: {
        'x-apikey': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ url }),
    }
  );

  const analysisId = submission.data?.id;
  if (!analysisId) {
    return {
      engine: 'virustotal',
      detected: false,
      threatName: null,
      severity: null,
      details: {
        error: 'VirusTotal did not return analysis id',
        response: submission,
      },
    };
  }

  const analysis = await fetchJson<{
    data?: { attributes?: { stats?: { malicious?: number; suspicious?: number } } };
  }>(`https://www.virustotal.com/api/v3/analyses/${analysisId}`, {
    method: 'GET',
    headers: { 'x-apikey': apiKey },
  });

  const stats = analysis.data?.attributes?.stats || {};
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;
  const detected = malicious > 0 || suspicious > 0;

  return {
    engine: 'virustotal',
    detected,
    threatName: detected ? `malicious:${malicious}, suspicious:${suspicious}` : null,
    severity: malicious > 0 ? 'high' : suspicious > 0 ? 'medium' : null,
    details: analysis,
  };
}
