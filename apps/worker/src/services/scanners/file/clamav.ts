import type { EngineResult } from '../types.js';
import { execFileAsync } from '../exec.js';
import { ensureFileWithinUploads, splitCommand } from '../utils.js';

async function runClamAVDocker(filePath: string): Promise<EngineResult> {
  const start = Date.now();
  const image = process.env.CLAMAV_DOCKER_IMAGE;
  if (!image) {
    throw new Error('CLAMAV_DOCKER_IMAGE not set');
  }
  const { uploadsDir, relative } = ensureFileWithinUploads(filePath);
  const containerPath = `/data/${relative.replace(/\\/g, '/')}`;
  const command = splitCommand(process.env.CLAMAV_DOCKER_CMD);
  const args = ['run', '--rm', '-v', `${uploadsDir}:/data:ro`, image, ...command, containerPath];
  try {
    const { stdout } = await execFileAsync('docker', args, {
      timeout: 60000,
    });
    const output = stdout.trim();
    return {
      engine: 'clamav',
      detected: false,
      threatName: null,
      severity: null,
      details: {
        scanDurationMs: Date.now() - start,
        output,
      },
    };
  } catch (error) {
    const err = error as { code?: number; stdout?: string; stderr?: string };
    if (err.code === 1) {
      const output = (err.stdout || '').trim();
      const match = output.match(/:\s+(.+)\s+FOUND$/);
      const threatName = match?.[1] || 'Malware.Detected';
      return {
        engine: 'clamav',
        detected: true,
        threatName,
        severity: 'high',
        details: {
          scanDurationMs: Date.now() - start,
          output,
        },
      };
    }
    throw new Error(`ClamAV scan failed: ${err.stderr || err.stdout || 'unknown error'}`);
  }
}

async function runClamAVLocal(filePath: string): Promise<EngineResult> {
  const start = Date.now();
  const clamscanPath = process.env.CLAMAV_PATH || 'clamscan';
  try {
    const { stdout } = await execFileAsync(clamscanPath, ['--no-summary', filePath], {
      timeout: 60000,
    });
    const output = stdout.trim();
    return {
      engine: 'clamav',
      detected: false,
      threatName: null,
      severity: null,
      details: {
        scanDurationMs: Date.now() - start,
        output,
      },
    };
  } catch (error) {
    const err = error as { code?: number; stdout?: string; stderr?: string };
    if (err.code === 1) {
      const output = (err.stdout || '').trim();
      const match = output.match(/:\s+(.+)\s+FOUND$/);
      const threatName = match?.[1] || 'Malware.Detected';
      return {
        engine: 'clamav',
        detected: true,
        threatName,
        severity: 'high',
        details: {
          scanDurationMs: Date.now() - start,
          output,
        },
      };
    }
    throw new Error(`ClamAV scan failed: ${err.stderr || err.stdout || 'unknown error'}`);
  }
}

export async function runClamAV(filePath: string) {
  if (process.env.CLAMAV_DOCKER_IMAGE) {
    return runClamAVDocker(filePath);
  }
  return runClamAVLocal(filePath);
}
