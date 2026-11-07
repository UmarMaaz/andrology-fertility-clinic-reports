import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import config from '../config';
import { ExcelStore } from '../lib/ExcelStore';
import { queueColumns } from '../lib/schemas';

interface QueueItem {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  patientAge: number;
  testName: string;
  status: 'Waiting' | 'In Procedure' | 'In Reporting' | 'Completed';
  timestamp: string;
}

const store = new ExcelStore<QueueItem>(
  path.join(config.DATA_DIR, 'queue.xlsx'),
  queueColumns
);

const router = Router();

// GET /api/queue - list all
router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const all = store.getAll();
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// GET /api/queue/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = store.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Queue item not found' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/queue - upsert
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item: QueueItem = req.body;
    if (!item || !item.id) {
      return res.status(400).json({ error: 'Missing required queue item fields (id)' });
    }
    const saved = await store.save(item);
    res.status(200).json(saved);
  } catch (err) {
    next(err);
  }
});

// POST /api/queue/sync - bulk sync
router.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const queue: QueueItem[] = Array.isArray(req.body) ? req.body : [];
    await store.saveMany(queue);
    res.json({ success: true, count: queue.length });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/queue/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await store.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Queue item not found' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
export { store as queueStore };

