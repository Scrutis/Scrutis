import { db } from '@scrutis/db';
import { scan, scanResult } from '@scrutis/db/src/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { stat } from 'node:fs/promises';
import type { EngineResult } from './scanners/types.js';
import { runClamAV, runYara } from './scanners/file/index.js';
import {
  determineOverallResult,
  getHighestSeverity,
  normalizeFilePath,
} from './scanners/utils.js';
import { runPhishTank, runSafeBrowsing, runUrlScan, runVirusTotal } from './scanners/url/index.js';

/**
 * Process a file scan
 * TODO: Implement actual file scanning logic
 */
async function processFileScan(scanData: typeof scan.$inferSelect) {
  const metadata = (scanData.metadata || {}) as { filePath?: string };
  if (!metadata.filePath) {
    throw new Error('Missing filePath metadata for file scan');
  }

  const filePath = normalizeFilePath(metadata.filePath);
  await stat(filePath);

  const engineResults: EngineResult[] = [];
  const engines = [runClamAV, runYara];

  for (const engine of engines) {
    try {
      engineResults.push(await engine(filePath));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const engineName = engine === runClamAV ? 'clamav' : 'yara';
      engineResults.push({
        engine: engineName,
        detected: false,
        threatName: null,
        severity: null,
        details: { error: message },
      });
    }
  }

  const overallResult = determineOverallResult(engineResults);
  const overallSeverity = getHighestSeverity(engineResults);

  return {
    result: overallResult,
    severity: overallSeverity,
    results: engineResults.map((result) => ({
      id: randomUUID(),
      scanId: scanData.id,
      engine: result.engine,
      detected: result.detected,
      threatName: result.threatName,
      severity: result.severity,
      details: result.details,
      createdAt: new Date(),
    })),
  };
}

/**
 * Process a URL scan
 * In production, this would check URL reputation, phishing databases, etc.
 */
async function processURLScan(scanData: typeof scan.$inferSelect) {
  if (!scanData.target) {
    throw new Error('Missing target URL for scan');
  }

  const url = scanData.target;
  const engines = [runSafeBrowsing, runUrlScan, runVirusTotal, runPhishTank];
  const engineResults: EngineResult[] = [];

  for (const engine of engines) {
    try {
      engineResults.push(await engine(url));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      const engineName =
        engine === runSafeBrowsing
          ? 'google-safe-browsing'
          : engine === runUrlScan
          ? 'urlscan'
          : engine === runVirusTotal
          ? 'virustotal'
          : 'phishtank';
      engineResults.push({
        engine: engineName,
        detected: false,
        threatName: null,
        severity: null,
        details: { error: message },
      });
    }
  }

  const overallResult = determineOverallResult(engineResults);
  const overallSeverity = getHighestSeverity(engineResults);

  return {
    result: overallResult,
    severity: overallSeverity,
    results: engineResults.map((result) => ({
      id: randomUUID(),
      scanId: scanData.id,
      engine: result.engine,
      detected: result.detected,
      threatName: result.threatName,
      severity: result.severity,
      details: result.details,
      createdAt: new Date(),
    })),
  };
}

/**
 * Process a scan by ID
 */
export async function processScan(scanId: string) {
  // Get scan from database
  const scans = await db
    .select()
    .from(scan)
    .where(eq(scan.id, scanId))
    .limit(1);
  
  if (scans.length === 0) {
    return null;
  }
  
  const scanData = scans[0];
  
  // Check if scan is already completed or failed
  if (scanData?.status === 'completed' || scanData?.status === 'failed') {
    return scanData;
  }
  
  // Update status to scanning
  await db
    .update(scan)
    .set({ 
      status: 'scanning',
      updatedAt: new Date(),
    })
    .where(eq(scan.id, scanId));
  
  try {
    // Process based on scan type
    let processResult;
    
    if (scanData?.type === 'file') {
      processResult = await processFileScan(scanData);
    } else if (scanData?.type === 'url') {
      processResult = await processURLScan(scanData);
    } else {
      throw new Error(`Unknown scan type: ${scanData?.type}`);
    }
    
    // Insert scan results
    if (processResult.results.length > 0) {
      await db.insert(scanResult).values(processResult.results);
    }
    
    // Update scan with final status
    const updatedScan = await db
      .update(scan)
      .set({
        status: 'completed',
        result: processResult.result,
        severity: processResult.severity,
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(scan.id, scanId))
      .returning();
    
    console.log(`✅ Scan ${scanId} completed: ${processResult.result}`);
    
    return updatedScan[0];
  } catch (error) {
    // Mark scan as failed
    await db
      .update(scan)
      .set({
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: new Date(),
      })
      .where(eq(scan.id, scanId));
    
    console.error(`❌ Scan ${scanId} failed:`, error);
    throw error;
  }
}

/**
 * Get scan status
 */
export async function getScanStatus(scanId: string) {
  const scans = await db
    .select()
    .from(scan)
    .where(eq(scan.id, scanId))
    .limit(1);
  
  if (scans.length === 0) {
    return null;
  }
  
  return scans[0];
}
