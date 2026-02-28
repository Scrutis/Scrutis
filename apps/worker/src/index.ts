// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { scanRoutes } from './routes/scans.js';
import { startScanProcessor } from './services/processor.js';

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'scrutis-worker' });
});

// Routes
app.use('/api/scans', scanRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Scrutis Worker API running on port ${PORT}`);
  
  // Start the scan processor
  startScanProcessor();
});
