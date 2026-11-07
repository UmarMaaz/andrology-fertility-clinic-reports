import { Router, Request, Response, NextFunction } from 'express';
import { patientStore } from './patients';
import { reportStore, enrichReport } from './reports';
import { queueStore } from './queue';
import { invoiceStore } from './invoices';
import { snippetStore } from './snippets';

const router = Router();

// GET /api/sync/health - Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// GET /api/sync/export - Export entire database from Excel files as JSON
router.get('/export', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      patients: patientStore.getAll(),
      reports: reportStore.getAll(),
      queue: queueStore.getAll(),
      invoices: invoiceStore.getAll(),
      snippets: snippetStore.getAll(),
    };
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

// POST /api/sync/all - Bulk sync all collections at once
router.post('/all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patients, reports, queue, invoices, snippets } = req.body || {};

    const results: Record<string, number> = {};

    if (Array.isArray(patients)) {
      await patientStore.saveMany(patients);
      results.patients = patients.length;
    }

    if (Array.isArray(reports)) {
      const enriched = reports.map(enrichReport);
      await reportStore.saveMany(enriched);
      results.reports = enriched.length;
    }

    if (Array.isArray(queue)) {
      await queueStore.saveMany(queue);
      results.queue = queue.length;
    }

    if (Array.isArray(invoices)) {
      await invoiceStore.saveMany(invoices);
      results.invoices = invoices.length;
    }

    if (Array.isArray(snippets)) {
      await snippetStore.saveMany(snippets);
      results.snippets = snippets.length;
    }

    res.json({
      success: true,
      syncedAt: new Date().toISOString(),
      counts: results,
    });
  } catch (err) {
    next(err);
  }
});

export default router;

