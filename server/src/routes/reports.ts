import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import config from '../config';
import { ExcelStore } from '../lib/ExcelStore';
import { reportColumns } from '../lib/schemas';

interface Report {
  id: string;
  reportNumber: string;
  patientId: string;
  patientName?: string;
  templateId: string;
  templateName?: string;
  patientSnapshot?: any;
  templateSnapshot?: any;
  date: string;
  referringDoctor?: string;
  findings: Record<string, any>;
  customStatuses?: Record<string, string>;
  customColors?: any;
  signatories?: any[];
  impression: string;
  impressionStatus?: string;
  status: string;
  verifiedBy?: string;
  verifiedAt?: string;
  auditLog?: any[];
  createdAt: string;
  updatedAt: string;
}

const store = new ExcelStore<Report>(
  path.join(config.DATA_DIR, 'reports.xlsx'),
  reportColumns
);

function enrichReport(report: Report): Report {
  return {
    ...report,
    patientName: report.patientName || report.patientSnapshot?.name || '',
    templateName: report.templateName || report.templateSnapshot?.name || '',
  };
}

const router = Router();

// GET /api/reports - list all or search
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const search = req.query.search as string;
    if (search && search.trim()) {
      const results = store.search(search.trim(), [
        'reportNumber',
        'patientName',
        'impression',
        'status',
        'referringDoctor',
      ]);
      return res.json(results);
    }
    const all = store.getAll();
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/:id - single report
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = store.getById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (err) {
    next(err);
  }
});

// POST /api/reports - create or update (upsert)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report: Report = req.body;
    if (!report || !report.id || !report.reportNumber) {
      return res.status(400).json({ error: 'Missing required report fields (id, reportNumber)' });
    }
    const enriched = enrichReport(report);
    const saved = await store.save(enriched);
    res.status(200).json(saved);
  } catch (err) {
    next(err);
  }
});

// POST /api/reports/sync - bulk replace all reports
router.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const reports: Report[] = Array.isArray(req.body) ? req.body : [];
    const enrichedList = reports.map(enrichReport);
    await store.saveMany(enrichedList);
    res.json({ success: true, count: enrichedList.length });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/reports/:id - delete report
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await store.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
export { store as reportStore, enrichReport };

