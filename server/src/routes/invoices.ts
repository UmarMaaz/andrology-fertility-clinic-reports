import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import config from '../config';
import { ExcelStore } from '../lib/ExcelStore';
import { invoiceColumns } from '../lib/schemas';

interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  date: string;
  items: any[];
  discount: number;
  total: number;
  amountPaid: number;
  status: 'Paid' | 'Partial' | 'Due';
}

const store = new ExcelStore<Invoice>(
  path.join(config.DATA_DIR, 'invoices.xlsx'),
  invoiceColumns
);

const router = Router();

// GET /api/invoices - list all
router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const all = store.getAll();
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// GET /api/invoices/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = store.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/invoices - upsert
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item: Invoice = req.body;
    if (!item || !item.id || !item.invoiceNumber) {
      return res.status(400).json({ error: 'Missing required invoice fields (id, invoiceNumber)' });
    }
    const saved = await store.save(item);
    res.status(200).json(saved);
  } catch (err) {
    next(err);
  }
});

// POST /api/invoices/sync - bulk sync
router.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoices: Invoice[] = Array.isArray(req.body) ? req.body : [];
    await store.saveMany(invoices);
    res.json({ success: true, count: invoices.length });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/invoices/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await store.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
export { store as invoiceStore };

