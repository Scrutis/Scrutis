import { db } from '@scrutis/db';
import { scan } from '@scrutis/db/schema';
import { eq } from 'drizzle-orm';
import { processScan } from './scanner.js';

const POLL_INTERVAL = 5000; // Poll every 5 seconds
const BATCH_SIZE = 5; // Process up to 5 scans at a time

/**
 * Poll for pending scans and process them
 */
async function pollAndProcessScans() {
  try {
    // Find pending scans
    const pendingScans = await db
      .select()
      .from(scan)
      .where(eq(scan.status, 'pending'))
      .limit(BATCH_SIZE);
    
    if (pendingScans.length === 0) {
      return;
    }
    
    console.log(`📋 Found ${pendingScans.length} scan(s) to process`);
    
    // Process scans in parallel (with limit)
    const processPromises = pendingScans.map(scanData => 
      processScan(scanData.id).catch(error => {
        console.error(`Error processing scan ${scanData.id}:`, error);
        return null;
      })
    );
    
    await Promise.all(processPromises);
  } catch (error) {
    console.error('Error in pollAndProcessScans:', error);
  }
}

/**
 * Start the scan processor
 * This will continuously poll for pending scans and process them
 */
export function startScanProcessor() {
  console.log('🔄 Starting scan processor...');
  
  // Process immediately on start
  pollAndProcessScans();
  
  // Then poll at regular intervals
  setInterval(() => {
    pollAndProcessScans();
  }, POLL_INTERVAL);
  
  console.log(`⏰ Scan processor polling every ${POLL_INTERVAL}ms`);
}
