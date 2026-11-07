import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import config from '../config';
import { ExcelStore } from '../lib/ExcelStore';
import { snippetColumns } from '../lib/schemas';

interface Snippet {
  id: string;
  shortcut: string;
  title: string;
  text: string;
  category: string;
}

const store = new ExcelStore<Snippet>(
  path.join(config.DATA_DIR, 'snippets.xlsx'),
  snippetColumns
);

const router = Router();

// GET /api/snippets - list all
router.get('/', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const all = store.getAll();
    res.json(all);
  } catch (err) {
    next(err);
  }
});

// GET /api/snippets/:id
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = store.getById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/snippets - upsert
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item: Snippet = req.body;
    if (!item || !item.id || !item.shortcut) {
      return res.status(400).json({ error: 'Missing required snippet fields (id, shortcut)' });
    }
    const saved = await store.save(item);
    res.status(200).json(saved);
  } catch (err) {
    next(err);
  }
});

// POST /api/snippets/sync - bulk sync
router.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snippets: Snippet[] = Array.isArray(req.body) ? req.body : [];
    await store.saveMany(snippets);
    res.json({ success: true, count: snippets.length });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/snippets/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await store.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
});

export default router;
export { store as snippetStore };

