import express from 'express';
import cors from 'cors';
import config from './config';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';

import patientsRouter from './routes/patients';
import reportsRouter from './routes/reports';
import queueRouter from './routes/queue';
import invoicesRouter from './routes/invoices';
import snippetsRouter from './routes/snippets';
import syncRouter from './routes/sync';

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Mount API routes
app.use('/api/patients', patientsRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/queue', queueRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/snippets', snippetsRouter);
app.use('/api/sync', syncRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(config.PORT, () => {
  console.log(`[Clinic Server] Excel backend running on http://localhost:${config.PORT}`);
  console.log(`[Clinic Server] Excel files directory: ${config.DATA_DIR}`);
});

export default app;

