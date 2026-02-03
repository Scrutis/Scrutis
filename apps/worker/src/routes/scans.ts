import { Router, Request, Response } from 'express';
import { processScan, getScanStatus } from '../services/scanner.js';

export const scanRoutes: Router = Router();

// POST /api/scans/process/:id - Process a specific scan
scanRoutes.post('/process/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await processScan(id as string);
    
    if (!result) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    
    res.json({ 
      message: 'Scan processed successfully',
      scan: result 
    });
  } catch (error) {
    console.error('Error processing scan:', error);
    res.status(500).json({ 
      error: 'Failed to process scan',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/scans/status/:id - Get scan processing status
scanRoutes.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const status = await getScanStatus(id);
    
    if (!status) {
      return res.status(404).json({ error: 'Scan not found' });
    }
    
    res.json({ status });
  } catch (error) {
    console.error('Error getting scan status:', error);
    res.status(500).json({ 
      error: 'Failed to get scan status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
