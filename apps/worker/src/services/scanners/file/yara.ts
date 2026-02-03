import path from 'node:path';
import type { EngineResult } from '../types.js';
import { execFileAsync } from '../exec.js';
import { ensureFileWithinUploads, splitCommand } from '../utils.js';

async function runYaraDocker(filePath: string): Promise<EngineResult> {
  const start = Date.now();
  const image = process.env.YARA_DOCKER_IMAGE;
  if (!image) {
    throw new Error('YARA_DOCKER_IMAGE not set');
  }
  const rulesPath = process.env.YARA_RULES_PATH;
  if (!rulesPath) {
    return {
      engine: 'yara',
      detected: false,
      threatName: null,
      severity: null,
      details: {
        error: 'YARA_RULES_PATH not set',
      },
    };
  }

  const { uploadsDir, relative } = ensureFileWithinUploads(filePath);
  const containerFilePath = `/data/${relative.replace(/\\/g, '/')}`;
  const command = splitCommand(process.env.YARA_DOCKER_CMD);
  const args = [
    'run',
    '--rm',
    '-v',
    `${uploadsDir}:/data:ro`,
    '-v',
    `${path.resolve(rulesPath)}:/rules:ro`,
    image,
    ...command,
    '/rules',
    containerFilePath,
  ];

  try {
    const { stdout } = await execFileAsync('docker', args, {
      timeout: 60000,
    });
    const matches = stdout
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(/\s+/)[0]);

    return {
      engine: 'yara',
      detected: matches.length > 0,
      threatName: matches[0] || null,
      severity: matches.length > 0 ? 'medium' : null,
      details: {
        scanDurationMs: Date.now() - start,
        matches,
      },
    };
  } catch (error) {
    const err = error as { code?: number; stdout?: string; stderr?: string };
    if (err.code === 1) {
      return {
        engine: 'yara',
        detected: false,
        threatName: null,
        severity: null,
        details: {
          scanDurationMs: Date.now() - start,
          matches: [],
        },
      };
    }
    throw new Error(`YARA scan failed: ${err.stderr || err.stdout || 'unknown error'}`);
  }
}

async function runYaraLocal(filePath: string): Promise<EngineResult> {
  const start = Date.now();
  const yaraPath = process.env.YARA_PATH || 'yara';
  const rulesPath = process.env.YARA_RULES_PATH;
  if (!rulesPath) {
    return {
      engine: 'yara',
      detected: false,
      threatName: null,
      severity: null,
      details: {
        error: 'YARA_RULES_PATH not set',
      },
    };
  }

  try {
    const { stdout } = await execFileAsync(yaraPath, ['-w', rulesPath, filePath], {
      timeout: 60000,
    });
    const matches = stdout
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.split(/\s+/)[0]);

    return {
      engine: 'yara',
      detected: matches.length > 0,
      threatName: matches[0] || null,
      severity: matches.length > 0 ? 'medium' : null,
      details: {
        scanDurationMs: Date.now() - start,
        matches,
      },
    };
  } catch (error) {
    const err = error as { code?: number; stdout?: string; stderr?: string };
    if (err.code === 1) {
      return {
        engine: 'yara',
        detected: false,
        threatName: null,
        severity: null,
        details: {
          scanDurationMs: Date.now() - start,
          matches: [],
        },
      };
    }
    throw new Error(`YARA scan failed: ${err.stderr || err.stdout || 'unknown error'}`);
  }
}

export async function runYara(filePath: string) {
  if (process.env.YARA_DOCKER_IMAGE) {
    return runYaraDocker(filePath);
  }
  return runYaraLocal(filePath);
}
